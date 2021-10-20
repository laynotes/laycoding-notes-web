<template>
  <div id="editor-main">
    <le-editor v-model="value" ref="editor" :hljs-css="hljsCss" :image-uploader="imageUploader"
               @save="save"></le-editor>
  </div>
</template>

<script>

import {JSEncrypt} from 'jsencrypt'
import service from "../../api/fetch";
import md5 from 'js-md5';

export default {
  data() {
    return {
      sectionContainer: null,
      hljsCss: 'agate',
      value: '',
      html: '',
      fileId: '',
      userInfo: '',
      fileMd5: "",
      imageUploader: {
        custom: false,
        fileType: 'file',
        fileNameType: '',
        imagePrefix: 'http://106.54.92.121', // 图片上传成功后，预览地址前缀
        type: 'server',
        url: 'http://106.54.92.121:82/upload' // 上传接口地址
      }
    }
  },
  created() {
    window.addEventListener("unload", this.saveLoad);
  },
  mounted() {
    const path = this.$route.path;
    const pathArr = path.split("/markdown/");

    console.log(pathArr)
    //const userInfo = {};
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

    if (pathArr.length > 1 && pathArr[1].indexOf("-") > -1 && pathArr[1].length === 36) {
      this.fileId = pathArr[1].replaceAll("-", "");
      console.log(sessionStorage.getItem("state"))
    } else {
      this.$Message.error("参数出错了~");
      let _that = this;
      setTimeout(() => {
        _that.$router.push({
          name: "main"
        })
      }, 500)
    }
    this.loadMd();
  },
  methods: {
    loadMd: function () {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i); //获取本地存储的Key
        //   console.log("key:" + key)
        if (key.endsWith("_md")) {
          //  console.log("结尾:" + key)
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
    // 自定义图片上传
    // uploadImg: function ($vm, file, fileName) {
    //   console.log($vm)
    //   console.log(file)
    //   console.log(fileName)
    //   // 添加图片
    //   // 两个参数 第一个是图片访问路径 第二个是文件名
    //   $vm.insertImg(`${$vm.config.imageUploader.imagePrefix}${fileName}`, fileName)
    // },
    save: function (val) {
      // 获取预览文本
      //console.log(this.value) // 这里是原markdown文本
      //console.log(val) ;// 这个是解析出的html
      //const markdown = "@[TOC](导航)" + "\n " + this.value;

      // this.encryptStr();
      // console.log(this.$md5(this.value))
      const fileMd5 = md5(this.value);

      if (fileMd5 === this.fileMd5) {
        this.$Message.info("内容未改变~")
      } else {
        this.fileMd5 = fileMd5;
      }
      //  console.log(fileMd5);
      // this.insertFile();
    },
    insertFile() {
      const config = JSON.parse(localStorage.getItem("opt_config"));
      config.themeType = "github";
      let data = {};
      data.fileConfig = config;
      data.fileType = 0;
      data.fileSource = this.value;
      data.fileName = "mysql入门到精通";
      data.folderId = "asdsadsadsad1";
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
        console.log("上传结果:", response)
      }).catch(error => {
        console.log(error);
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
