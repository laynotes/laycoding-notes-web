<template>
  <div>
    <a-divider orientation="left">基本设置</a-divider>
    <div style="width: 100%;display: flex;align-items: center;text-align: center">
      <a-upload
          name="avatar"
          list-type="picture-card"
          class="avatar-uploader"
          :show-upload-list="false"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          :before-upload="beforeUpload"
          @change="handleChange"
          style="display: flex;justify-content: center;"
      >
        <img v-if="formUser.avatar!==''" :src="formUser.avatar" alt="avatar"/>
        <div v-else>
          <a-icon :type="loading ? 'loading' : 'plus'"/>
          <div class="ant-upload-text">
            Upload
          </div>
        </div>
      </a-upload>
    </div>
    <a-form-model :model="formUser" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item label="昵称">
        <a-input v-model="formUser.username"/>
      </a-form-model-item>


      <a-form-model-item label="邮箱">
        <a-input v-model="formUser.email"/>
      </a-form-model-item>
      <a-form-model-item label="电话">
        <a-input v-model="formUser.phone"/>
      </a-form-model-item>
      <a-form-model-item label="个人介绍">
        <a-input v-model="form.desc" type="textarea"/>
      </a-form-model-item>
      <a-form-model-item v-if="false" :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">
          Create
        </a-button>
        <a-button style="margin-left: 10px;">
          Cancel
        </a-button>
      </a-form-model-item>
    </a-form-model>
    <a-divider orientation="left">安全设置</a-divider>
    <a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item label="当前密码">
        <a-input v-model="form.name"/>
      </a-form-model-item>


      <a-form-model-item label="修改密码">
        <a-input v-model="form.name"/>
      </a-form-model-item>

      <a-form-model-item label="再次确认">
        <a-input v-model="form.name"/>
      </a-form-model-item>

      <a-form-model-item v-if="false" label="Activity zone">
        <a-select v-model="form.region" placeholder="please select your zone">
          <a-select-option value="shanghai">
            Zone one
          </a-select-option>
          <a-select-option value="beijing">
            Zone two
          </a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item v-if="false" :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">
          Create
        </a-button>
        <a-button style="margin-left: 10px;">
          Cancel
        </a-button>
      </a-form-model-item>
    </a-form-model>

    <div style="width: 100%;text-align: center;margin-top: 20px">
      <a-button type="danger" icon="poweroff" @click="logout">
        退出登录
      </a-button>
    </div>
  </div>
</template>
<script>

import service from "@/api/fetch";

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

export default {
  name: "user-setting",
  data() {
    return {
      handleChange(info) {
        if (info.file.status === 'uploading') {
          this.loading = true;
          return;
        }
        if (info.file.status === 'done') {
          // Get this url from response in real world.
          getBase64(info.file.originFileObj, imageUrl => {
            this.imageUrl = imageUrl;
            this.loading = false;
          });
        }
      },
      beforeUpload(file) {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
          this.$message.error('You can only upload JPG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          this.$message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
      },
      loading: false,
      imageUrl: '',
      labelCol: {span: 6},
      wrapperCol: {span: 18},
      form: {
        name: '',
        region: undefined,
        date1: undefined,
        delivery: false,
        type: [],
        resource: '',
        desc: '',
      },
      formUser:{
        avatar:'',
        email:'',
        phone:''
      }
    };
  },
  mounted() {
    console.log(this.$store.state.userInfo)
     this.initForm();
  },
  methods: {
    initForm(){
       this.formUser = this.$store.state.userInfo;
    },
    logout() {
      let that = this;
      that.$confirm({
        title: '确认是否退出登录?',
        content: '',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
          that.postLogout()
        },
        onCancel() {

        },
      });
    },
    postLogout() {
      const info = sessionStorage.getItem("state") ? JSON.parse(sessionStorage.getItem("state")) : null;
      if (!info) {
        this.$message.error("内部错误")
      }
      const refreshToken = info.userInfo && info.userInfo.refreshToken ? info.userInfo.refreshToken : null;
      if (!refreshToken) {
        this.$message.error("内部错误")
      }
      service({
        url: "/oauth/logout?refreshToken=" + refreshToken,
        method: 'post'
      }).then(response => {
        if (response.data) {
          this.$message.success("退出成功");
          setTimeout(() => {
            sessionStorage.clear();
            this.$store.state.userInfo = null;
            this.$router.replace("/main");
            this.$emit("logout");
          }, 300)
        }
      })
    },
    onSubmit() {
      console.log('submit!', this.form);
    },
  },
};
</script>
<style>
.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
