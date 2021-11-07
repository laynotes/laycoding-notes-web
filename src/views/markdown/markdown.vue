<template>
  <div id="codeView" style="height: 100%">
    <a-row style="height: 100%">
      <div id="main" style="display: none">
      </div>
      <a-col :sm="24" :md="20" :lg="20" :xl="20" style="padding: 10px;height: 100%;">
        <div style="display: flex;flex-direction: column;height: 100%">
          <div
            style="width: 100%;height: 50px;border-bottom: 1px solid #e8e8e8;line-height: 50px;display: flex;justify-content: space-between">
            <div>

            </div>
            <div style="margin-right: 10px;width: 60px">
              <a-dropdown>
                <a-menu slot="overlay" @click="handleMenuClick">
                  <a-menu-item key="1">
                    <a-icon type="file-markdown"/>
                    <span style="margin-left: 10px">MarkDown</span>
                  </a-menu-item>
                  <a-menu-divider/>
                  <a-menu-item key="2">
                    <a-icon type="file-pdf"/>
                    <span style="margin-left: 10px">P&nbsp;D&nbsp;F</span>
                  </a-menu-item>

                </a-menu>
                <a-button> 导 出
                  <a-icon type="down"/>
                </a-button>
              </a-dropdown>
            </div>
          </div>
          <section
            id="output-wrapper"
          >
            <div class="preview_html" id="previewHtml">
              <div id="output" v-html="html" ref="mdHtml"></div>
              <Spin size="large" fix v-if="initMd"></Spin>
            </div>
            <div class="back-top" v-if="backTopShow" @click="backTop">
              <a-icon type="arrow-up" style="font-size:28px;color: #fff;margin: auto"/>
            </div>
          </section>
        </div>
      </a-col>
      <a-col :sm="0" :md="4" :lg="4" :xl="4" style="padding: 10px;height: 100%;">
        <div class="card-container">
          <a-tabs default-active-key="1" style="height: 100%">
            <a-tab-pane key="1" tab="目录">
              <div style="position: relative;height: 100%">

                <a-anchor :affix="false" @click="handelClick" style="height: 100%;" @change="onChange"
                          :getContainer="() => this.view">

                  <a-anchor-link v-for="item in mdTitle"
                                 :key="item.id"
                                 :href="item.path"
                                 :title="item.title">
                    <a-anchor-link v-for="node in item.children" :key="node.id"
                                   :href="node.path"
                                   :title="node.title"/>
                  </a-anchor-link>

                </a-anchor>


              </div>
            </a-tab-pane>
            <a-tab-pane key="2" tab="评论" force-render>

            </a-tab-pane>
          </a-tabs>
        </div>
      </a-col>
    </a-row>
  </div>

</template>
<script>
import $ from "jquery";
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';

//import "highlight.js/styles/github-dark.css"
import fetch from "../../api/fetch";

import utils from "../../utils/utils"
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import hljs from "highlight.js";
import xml from "highlight.js/lib/languages/xml"
import marked from "marked";
import WxRenderer from "../../plugins/wx-renderer";

const rendererMD = new marked.Renderer();
marked.setOptions({
  renderer: rendererMD,
});

export default {
  data() {
    return {
      html: '',
      cssName: "github",
      mdContent: '',
      list: [],
      initMd: true,
      init: false,
      backTopShow: false,
      expandedKeys: [],
      searchValue: '',
      searchArr: [],
      autoExpandParent: true,
      gData: [],
      showCssEditor: false,
      aboutDialogVisible: false,
      dialogUploadImgVisible: false,
      dialogFormVisible: false,
      isCoping: false,
      isImgLoading: false,
      source: "",
      childrenActiveIndex: 0,
      mdTitle: [],
      view: null,
      fileTitle: "文件",
    }
  },
  created() {
    const path = this.$route.path
    const fileId = path.split("/notes/markdownView/")[1];
    if (fileId === null || fileId === "") {
      this.$router.push("/notes/error")
    } else {
      this.getFileInfo(fileId);
    }
  },
  mounted() {
    const _this = this;
    $("#output").delegate("img", "click", function (e) {
      _this.imgClick(e, e.currentTarget.currentSrc)
    });

    $("#output").delegate(".code-body", "mouseover", function (e) {

      e.currentTarget.children[0].children[1].style.display = "block";
    });
    $("#output").delegate(".code-body", "mouseout", function (e) {
      e.currentTarget.children[0].children[1].style.display = "none";
      e.currentTarget.children[0].children[1].innerText = "复制"
    });
    $("#output").delegate(".copy-code", "click", function (e) {
      const codeNodes = e.currentTarget.parentNode.parentNode.querySelector("code");
      e.currentTarget.innerText = "已复制";
      utils.copy(codeNodes.innerText, e, _this);
    })

    if (document.getElementById("output-wrapper")) {
      document.getElementById("output-wrapper").addEventListener('scroll', this.handleScroll);
      this.view = document.getElementById("output-wrapper");
    }
  },
  methods: {
    loadCss() {
      let element = document.createElement("link");
      element.setAttribute("rel", "stylesheet");
      element.setAttribute("type", "text/css");
      element.setAttribute(
        "href",
        `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/${this.cssName}.min.css`
      );
      document.getElementsByTagName("head")[0].appendChild(element);
    },
    removeCss(cssName) {
      let element = "link";
      let attr = "href";
      let elements = document.getElementsByTagName(element);
      for (let i = elements.length; i >= 0; i--) {
        if (
          elements[i] &&
          elements[i].getAttribute(attr) != null &&
          elements[i].getAttribute(attr).indexOf(cssName) !== -1
        ) {
          console.log("remove:->" + elements[i].href)
          elements[i].parentNode.removeChild(elements[i]);
        }
      }
    },
    getFileInfo(fileId) {
      fetch({
        url: "/file/getFileInfoById?fileId=" + fileId,
        method: 'get'
      }).then(response => {
        console.log(response.data)
        if (response.code === 0) {
          this.mdContent = response.data.fileSource;
          const option = response.data.fileConfig;
          sessionStorage.setItem("file_config", JSON.stringify(option));
          this.fileTitle = response.data.fileName;
          this.cssName = option.themeType ? option.themeType : "github";
          this.loadCss();
          let output = marked(this.mdContent, {
            renderer: new WxRenderer({
              cssTheme: option.themeType,
              theme: option.theme,
              fonts: option.currentFont,
              size: option.currentSize,
              status: option.citeStatus,
            }).getRenderer(false),
            highlight: function (code) {
              return hljs.highlightAuto(code).value;
            }
          });
          this.html = output;
          this.mdTitle = JSON.parse(localStorage.getItem("md_title_data"));
          this.initMd = false;
          this.addCopy();
          document.getElementsByClassName("ant-anchor-ink-ball")[0].style.display = "block";
          document.getElementsByClassName("ant-anchor-ink-ball")[0].style.top = "10px";
          document.getElementsByClassName("ant-anchor-wrapper")[0].style.marginLeft = "0";
          document.getElementsByClassName("ant-tabs-content")[0].style.height = "90%";
        }
      }).catch(error => {
        console.log(error)
      });
    },
    handleMenuClick(e) {
      if (e.key === "1") {
        utils.downloadMD(this.mdContent, this.fileTitle)
      } else {
        document.getElementById("output-wrapper").scrollTop = 0;
        setTimeout(() => {
        }, 500)
        utils.getPdf("output-wrapper", this.fileTitle);
      }
    },
    handelClick(e, link) {
      e.preventDefault();
    },
    backTop() {
      let top = document.getElementById("output-wrapper").scrollTop;
      // 实现滚动效果
      const timeTop = setInterval(() => {
        document.getElementById("output-wrapper").scrollTop = document.getElementById("output-wrapper").scrollTop = top -= 100;
        if (top <= 0) {
          clearInterval(timeTop);
        }
      }, 3);
    },
    handleScroll() {
      let scrollTop = document.getElementById("output-wrapper").scrollTop;
      if (scrollTop > 100) {
        this.backTopShow = true;
      } else {
        this.backTopShow = false;
      }
    },
    anchorClick(e, link) {

    },
    selectNode(keys, e) {
      const hash = keys[0];
      document.getElementById(hash).scrollIntoView()

    },

    onChange(e) {
      console.log(e);
    },
    imgClick(e, url) {
      const viewer = new Viewer(document.getElementById("previewHtml"), {
        url: "data-original",
        show: function () {
          viewer.update();
        },
        hide: function () { //在图片消失的时候销毁viewer
          viewer.destroy()
        }
      });
    },
    addCopy() {
    },
    getUuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

    }
  },
  destroyed() {
    this.removeCss(this.cssName)
  }
}
</script>

<style lang="less" scoped>

.container {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.copy-elm {
  position: absolute;
  background: #fff;
  padding: 3px;
  border-radius: 3px;
  font-size: 21px;
  right: 3px;
}

.main-body {
  padding-top: 12px;
  overflow: hidden;
}

.preview_html {
  height: 100%;
  position: relative;
  padding: 20px;
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;
}

.el-main {
  transition: all 0.3s;
  padding: 0;
  margin: 20px;
  margin-top: 0;
}

.container {
  transition: all 0.3s;
}

.textarea-wrapper {
  height: 100%;
}

.preview-wrapper_night {
  overflow-y: inherit;
  position: relative;
  left: -3px;

  .preview {
    background-color: #fff;
  }
}

.back-top {
  width: 45px;
  height: 40px;
  border-radius: 2px;
  line-height: 40px;
  text-align: center;
  background: rgba(0, 0, 0, .6);
  position: absolute;
  bottom: 25px;
  right: 25px;
  display: flex;
  align-items: center;
}

.card-container {
  height: 100%;
  width: 100%;

}

.back-top:hover {
  cursor: pointer
}

.ant-anchor-ink-ball {
  display: block !important;
}

#output-wrapper {
  // position: relative;
  display: flex;
  height: 100%;
  user-select: text;
  overflow-y: scroll;
}

.loading-mask {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 101%;
  padding-top: 1px;
  font-size: 15px;
  color: gray;
  background-color: #1e1e1e;

  .loading__img {
    position: absolute;
    left: 50%;
    top: 330px;
    width: 50px;
    height: 50px;
    transform: translate(-50%, -50%);
    background-size: cover;
  }

  span {
    position: absolute;
    left: 50%;
    top: 390px;
    transform: translate(-50%, -50%);
  }
}

.bounceInRight {
  animation-name: bounceInRight;
  animation-duration: 1s;
  animation-fill-mode: both;
}

/deep/ .preview-table {
  border-spacing: 0px;
}

@keyframes bounceInRight {
  0%,
  60%,
  75%,
  90%,
  100% {
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  0% {
    opacity: 0;
    transform: translate3d(3000px, 0, 0);
  }
  60% {
    opacity: 1;
    transform: translate3d(-25px, 0, 0);
  }
  75% {
    transform: translate3d(10px, 0, 0);
  }
  90% {
    transform: translate3d(-5px, 0, 0);
  }
  100% {
    transform: none;
  }
}
</style>
<style lang="less" scoped>
@import url("../../assets/less/app.less");
@import url("../../assets/less/github-v2.min.css");
</style>
