<template>
  <div id="editor-main">

    <Spin size="large" fix v-if="initMd"></Spin>

    <lay-editor v-model="value" ref="editor" :image-uploader="imageUploader"
                @save="save"></lay-editor>

    <a-modal
      title="保存笔记"
      :dialog-style="{ top: '50px' }"
      :visible="modal1Visible"
      @ok="saveInfo"
      @cancel="() => setModal1Visible(false)"
    >
      <a-form :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
        <a-form-item label="标 题">
          <a-input v-model="fileName"
                   v-decorator="['note', { rules: [{ required: true, message: 'Please input your note!' }] }]"
          />
        </a-form-item>
        <a-form-item label="归 档">
          <a-tree-select
            v-model="folderName"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="所属归档"
            allow-clear
            tree-default-expand-all
          >
            <a-tree-select-node v-for="item in folderTree"
                                :selectable="item.children === null ||  item.children.length ===0" :key="item.id"
                                :value="item.folderId" :title="item.folderName">

              <a-tree-select-node v-for="child in item.children" :key="child.id"
                                  :selectable="child.children === null || child.children.length ===0"
                                  :value="child.folderId"
                                  :title="child.folderName"/>

            </a-tree-select-node>
          </a-tree-select>
        </a-form-item>
        <a-form-item label="标 签">
          <a-select mode="tags" v-model="labelSelected" style="width: 100%" placeholder="标签">
            <a-select-option v-for="item in labelArr" :key="item.id">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script>

import {JSEncrypt} from 'encryptlong'
import service from "../../api/fetch";
import md5 from 'js-md5';
import LayEditor from "@/components/layeditor/index/lay-editor";
import utils from "@/utils/utils";
import fetch from "@/api/fetch";

export default {
  // eslint-disable-next-line vue/no-unused-components
  components: {LayEditor},
  data() {
    return {
      folderSelected: '',
      sectionContainer: null,
      hljsCss: 'agate',
      value: '',
      updateMd5: '',
      fileName: null,
      folderName: null,
      labelSelected: "1",
      modal1Visible: false,
      initMd: true,
      html: '',
      fileId: '',
      userInfo: '',
      fileMd5: "",
      isReqest: false,
      imageUploader: {
        custom: false,
        fileType: 'file',
        fileNameType: '',
        imagePrefix: 'http://localhost:8088', // 图片上传成功后，预览地址前缀
        type: 'server',
        url: 'http://localhost:8088/oss/upload' // 上传接口地址
      },
      labelArr: [{"label": "java", "id": "1"}, {"label": "面经", "id": "2"}, {"label": "数据库", "id": "3"}, {
        "label": "中间件",
        "id": "4"
      }],
      folderTree: [],
      isEditor: false
    }
  },
  created() {
    window.addEventListener("unload", this.saveLoad);
  },
  mounted() {
    const path = this.$route.path;
    const pathArr = path.split("/markdown/");
    if (!sessionStorage.getItem("state") || !JSON.parse(sessionStorage.getItem("state")).userInfo) {
      this.$Message.error("非法请求~");
      let _that = this;
      setTimeout(() => {
        _that.$router.push({
          name: "main"
        })
      }, 1000)
    }
    this.userInfo = JSON.parse(sessionStorage.getItem("state")).userInfo;
    sessionStorage.setItem("config", sessionStorage.getItem("state"));
    if (pathArr.length > 1 && pathArr[1].indexOf("-") > -1 && pathArr[1].length === 36) {
      this.fileId = pathArr[1].replaceAll("-", "");
      this.initMd = false;
      this.loadMd();
    } else if (pathArr.length > 1 && pathArr[1].length === 32) {
      //编辑操作
      this.fileId = pathArr[1];
      this.getFileInfo(this.fileId);
    } else {
      this.$Message.error("参数出错了~");
      let _that = this;
      setTimeout(() => {
        _that.$router.push({
          name: "main"
        })
      }, 500)
    }

  },
  methods: {
    getFileInfo(fileId) {
      fetch({
        url: "/file/getFileInfoById?fileId=" + fileId,
        method: 'get'
      }).then(response => {
        console.log(response.data)
        if (response.data) {
          this.value = response.data.fileSource;
          localStorage.setItem("code_theme", response.data.fileConfig.themeType);
          setTimeout(() => {
            this.isEditor = true;
            this.initMd = false;
          }, 500);
        }
      }).catch(error => {
        this.$router.push("/main")
      });
    },
    setModal1Visible(show) {
      this.modal1Visible = show;
    },
    loadMd: function () {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i); //获取本地存储的Key
        if (key.endsWith("_md")) {
          if (key.startsWith(this.fileId)) {
            this.value = localStorage.getItem(key);
          } else {
            localStorage.removeItem(key);
          }
        }
      }
    },
    saveLoad: function () {
      localStorage.setItem(this.fileId + "_md", this.value);
      sessionStorage.setItem(this.fileId + "_user", JSON.stringify(this.userInfo));
    },
    save: function (val) {
      utils.copyWeChat(this, val)
      const fileMd5 = md5(this.value);
      if (fileMd5 === this.fileMd5) {
      } else {
        if (this.fileMd5 === fileMd5 || this.isEditor) {
          if (this.isReqest) return;
          this.isReqest = true;
          this.insertFile();
        } else {
          this.updateMd5 = fileMd5;
          this.onLoadData();
          this.modal1Visible = true;
        }
      }
    },
    onLoadData() {
      return new Promise(resolve => {
        service({
          url: "/folder/listFolders",
          method: "get"
        }).then(reponse => {
          this.folderTree = reponse.data;
        }).catch(erro => {
          console.log(erro);
        })
      });
    },
    saveInfo() {
      this.insertFile();
    },
    insertFile() {
      const config = JSON.parse(localStorage.getItem("opt_config"));
      config.themeType = localStorage.getItem("code_theme") ? localStorage.getItem("code_theme") : "github-dark";
      let data = {};
      data.fileConfig = config;
      data.fileType = 0;
      data.fileSource = this.value;
      data.fileName = this.fileName;
      data.folderId = this.folderName;
      data.fileId = this.fileId;
      data.fileLabel = [{
        "label": "mysql"
      }];
      localStorage.setItem("md_data", this.value);
      this.$http({
        url: service.defaults.baseURL + "/file/insertFile",
        method: "post",
        headers: {
          'Content-Type': 'application/json;',
          'Authorization': "Bearer " + this.userInfo.token
        },
        data: data
      }).then(response => {
        this.fileMd5 = this.updateMd5;
        this.modal1Visible = false;
        this.isReqest = false;
      }).catch(error => {
        console.log(error);
        this.isReqest = false;
        this.modal1Visible = false;
      })
    },
    encryptStr() {
      const testEncrypt = new JSEncrypt();
      testEncrypt.setPrivateKey("MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAI0K3CxNfUQ3XNN8LK3y1Y6VFS1Q7iWIn0iPFiRXO6oKn3hrJi6QR+5KpLylwiPMv4hAlaOqlxSFoWkfVvmLUhPN72a7BaO4JC72604gRfQZjmDDNsBTHycYBeKPAxc+MbuhObDFbfMi5XMZ15lIAMlDIM/Hdvbdkla57RfZ1F5LAgMBAAECgYA0RkwoV2gQOny7HZDpv9ELEZJRw2cgnix7Fh1cxsAkW9+TIBN8upkOZrf7+2ujHSX3+Af+KyHnx0d10NnJj6uRgMw69O8tZzIsFyPdL6zt/TMCkpqyczvmedczhbRlKBCxwxqhbQSs3B50wq35P1k3pt539o7AKDjak+IDUMYnQQJBAN+yIs+/uw1mG/q8LCPCgvBNxwJVMeAIA+nYq8krmkiDG406eGIzCbYJweGX+3M6GprIKXfHvlqZkPn6fsGrUhECQQChaRciwClPqoqyqY3UW4BmTn5rJBHKkCG/8FMSZnSWLSmDTx+v6cKnO2wR4K3bqfZt76XxLnGf3COluDf6EM6bAkBXDjtwAFzqdP+Uj+DZtdxBavN1G/TCDDyBqFoKe1aau7NgPg4VoWk5GAkFI6GvEUDDVfyVaf3RwoviTTNBacwRAkAL3R6PNlKTAXT6Vs4O6r7QRjqyg08vdVKVugNRGei91Qn1Fc69blAZXJu/4KTGvYJYaEHpLUG6v0J7fsPWhH+7AkA3g348bEVC6sPISL17KRkGC8TRN9Ld73ma8XbUg7JxciYEAw4pQFbf+Ygsmvwx0HQwu2GiPRv5KEKyDkFvOotS")

      this.$http.get("http://127.0.0.1:8088/test", {
        params: {
          password: testEncrypt.encrypt("admin123")
        }
      }).then(function (response) {


      }).catch(function (error) {

      });
    }
  }
}
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}

#editor-main {
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>
