<style lang="css" scoped>
@import url("https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css");
</style>

<template>
  <div id="output-wrapper" style="width: 100%;height: 100%;align-items: center;padding: 10px">

    <div id="preview" style="height: 100%;margin: 0 auto">
      <div class="markdown-body" id="output" v-html="html"></div>
    </div>
    <!-- 大图预览 -->
    <transition name="le-img-preview-animation" v-if="false">
      <div
          class="le-img-preview"
          @click="previewImg = ''"
          :style="imgPreviewStyle"
          v-if="previewImg!==''"
      >
        <img :src="previewImg" id="le-img-preview-content" alt/>
      </div>
    </transition>
  </div>
</template>
<script>
import flowchart from "flowchart.js";

export default {
  name: "lay-preview",
  props: {
    isMd: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ""
    },
    hljsCss: {
      type: String,
      default: "github"
    }
  },
  data() {
    return {
      content: "",
      oldStyle: "",
      currentStyle: "",
      previewImg: "",
      html: '',
      imgPreviewStyle: {
        minWidth: document.documentElement.clientWidth + "px",
        minHeight: document.documentElement.clientHeight + "px"
      }
    };
  },
  watch: {
    value(value) {
      this.content = value;
    },
    content(value) {
      if (this.isMd) {
        // this.html = md.render(value);
      } else {
        this.html = value;
      }
      this.$nextTick().then(() => {
        // setTimeout(function () {
        this.$el.querySelectorAll(".md-flowchart").forEach(element => {
          try {
            let code = element.textContent;
            let chart = flowchart.parse(code);
            element.textContent = "";
            chart.drawSVG(element);
          } catch (e) {
            element.outerHTML = `<pre>error: ${e}</pre>`;
          }
        });
        // }, 3000)
      });
    },
    hljsCss(value) {
       this.currentStyle = value;
       this.loadCss();
    }
  },
  methods: {
    loadCss() {
      if (this.currentStyle !== null && this.currentStyle !== '') {
        this.removeCss(this.currentStyle);
      }
      this.currentStyle = localStorage.getItem("code_theme") ? localStorage.getItem("code_theme") : "github";
      let element = document.createElement("link");
      element.setAttribute("rel", "stylesheet");
      element.setAttribute("type", "text/css");
      element.setAttribute(
          "href",
          `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/${this.currentStyle}.min.css`
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
          elements[i].parentNode.removeChild(elements[i]);
        }
      }
    }
  },
  created() {
  },
  mounted() {
    let that = this;
    /* this.content = this.value;
   if (hljsCssConfig[`${this.hljsCss}`]) {
     this.currentStyle = toKebabCase(this.hljsCss);
   } else {
     this.currentStyle = "github";
   }
   this.oldStyle = this.currentStyle;
   this.loadCss();*/
    // 监听屏幕大小
    window.addEventListener("resize", () => {
      that.imgPreviewStyle.minWidth =
          document.documentElement.clientWidth + "px";
      that.imgPreviewStyle.minHeight =
          document.documentElement.clientHeight + "px";
    });
    // 监听图片点击
    this.$el
        .querySelector(".markdown-body")
        .addEventListener("click", function (event) {
          event = event ? event : window.event;
          let ele = event.srcElement ? event.srcElement : event.target;
          if (ele.tagName === "IMG") {
            // 当且仅当点击的是预览区图片且不是预览大图
            if (ele.id !== "le-img-preview-content") {
              that.previewImg = ele.src;
            }
          }
        });
  }
};
</script>
<style>
#preview {
  position: relative;
  margin: 0 -20px;
  width: 375px;
  padding: 20px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  box-shadow: 0 0 60px rgb(0 0 0 / 10%);

}
</style>
