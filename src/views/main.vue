<template>
  <a-layout id="components-layout-demo-custom-trigger" style="height: 100%">
    <a-layout-sider breakpoint="lg"
                    collapsed-width="0"
                    style="margin: 10px 0 10px 10px;border-radius: 10px;background: #fff" @collapse="onCollapse"
                    @breakpoint="onBreakpoint"
                    :trigger="null">
      <div style="height: 100px;width: 100%;line-height: 100px;text-align: center" @contextmenu.prevent="">
        <a-avatar v-if="this.$store.state.userInfo === null" :size="64" icon="user" @click="setModal1Visible(true)"/>
        <a-avatar v-else :size="64" :src="this.$store.state.userInfo.avatar"/>
      </div>
      <div style="align-items: center;text-align: center;width: 100%;margin-bottom:20px">

        <a-button type="danger" @click="() => setModal1Visible(true)" style="width: 120px" shape="round"
                  v-if="this.$store.state.userInfo === null">
          登 入
        </a-button>


        <a-dropdown :trigger="['click']" v-else>
          <a class="ant-dropdown-link" @click="e => e.preventDefault()">

            <a-button type="primary" shape="round" icon="plus">
              新建文件
            </a-button>
          </a>
          <a-menu slot="overlay">
            <a-menu-item key="0" style="display: flex;flex-direction: row;" @click="createFile">
              <i class="iconfont icon-file-markdown"></i>
              <span style="margin-left: 10px">笔&nbsp;&nbsp;记</span>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="1" style="display: flex;flex-direction: row;">
              <i class="iconfont icon-flowChart"></i>
              <span style="margin-left: 10px">流程图</span>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="3" style="display: flex;flex-direction: row;">
              <i class="iconfont icon-gongzuoliuchengtu"></i>
              <span style="margin-left: 10px">脑&nbsp;&nbsp;图</span>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="4" style="display: flex;flex-direction: row;">
              <i class="iconfont icon-wenjianjia2"></i>
              <span style="margin-left: 10px">文件夹</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>

      </div>
      <a-menu
          :default-selected-keys="defaultKey"
          mode="inline"
          :inline-collapsed="collapsed"
      >
        <template v-for="item in folderList">
          <a-menu-item @click="folderItemClick" v-if="item.children && item.children.length === 0" :key="item.folderId">
            <div class="folderItem">
              <div>
                <i class="iconfont icon-wenjianjia2"/>
                <a-tooltip v-if="getFontSize(item.folderName,14) > 100">
                  <template slot="title">
                    {{ item.folderName }}
                  </template>
                  <span>{{ getSpanText(item.folderName, 100) }}</span>
                </a-tooltip>
                <span v-else>{{ getSpanText(item.folderName, 100) }}</span>
              </div>
              <a-dropdown v-if="item.isEditor">
                <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                  <i class="iconfont icon-caozuo" style="margin-right: 0px!important;"></i>
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a href="javascript:;">1st menu item</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>
          </a-menu-item>
          <a-sub-menu v-else :key="item.folderName" @titleClick="folderItemClick">
          <span slot="title">
             <div class="folderItem">
            <div>
              <i class="iconfont icon-wenjianjia2"/>
               <a-tooltip v-if="getFontSize(item.folderName,14) > 100">
                      <template slot="title">
                        {{ item.folderName }}
                      </template>
                      <span>{{ getSpanText(item.folderName, 100) }}</span>
                    </a-tooltip>
                    <span v-else>{{ getSpanText(item.folderName, 100) }}</span>
            </div>
          </div>
          </span>
            <template v-for="child in item.children">
              <a-menu-item :key="child.folderId" @click="folderItemClick">
                <div class="folderItem">
                  <div>
                    <i class="iconfont icon-wenjianjia2"/>
                    <a-tooltip v-if="getFontSize(child.folderName,14) > 80">
                      <template slot="title">
                        {{ child.folderName }}
                      </template>
                      <span>{{ getSpanText(child.folderName, 80) }}</span>
                    </a-tooltip>
                    <span v-else>{{ getSpanText(child.folderName, 80) }}</span>
                  </div>
                  <a-dropdown v-if="child.isEditor === 0">
                    <a class="ant-dropdown-link" @click="e => e.preventDefault()">

                      <i class="iconfont icon-caozuo" style="margin-right: 0px!important;"></i>
                    </a>
                    <a-menu slot="overlay">
                      <a-menu-item>
                        <a href="javascript:;">1st menu item</a>
                      </a-menu-item>
                    </a-menu>
                  </a-dropdown>
                </div>
              </a-menu-item>

            </template>

          </a-sub-menu>
        </template>
      </a-menu>

      <!-- <div class="silder-footer">
         <a-button type="dashed" shape="circle" icon="github" />
         <a-button type="dashed" shape="circle" icon="setting" />
       </div> -->
    </a-layout-sider>

    <a-layout-sider breakpoint="lg"
                    collapsedWidth="0" style="margin: 10px 0 10px 10px;border-radius: 10px;background: #fff"
                    v-model="collapsed">

      <div style="text-align: center;padding: 10px">
        <a-input-search placeholder="输入关键词" style="" @search="onSearch"/>
      </div>
      <a-menu mode="inline" :selectedKeys="fileItemSelect">
        <template v-for="item in fileList">
          <a-menu-item :key="item.fileId" :title="item.fileName" :value="item.fileType" @click="menuClick">
            <div class="folderItem">
              <div>
                <i v-if="item.fileType===0" class="iconfont icon-file-markdown"/>

                <i v-else-if="item.fileType===1" class="iconfont icon-flowChart"/>

                <i v-else-if="item.fileType===2" class="iconfont icon-gongzuoliuchengtu"/>

                <i v-else class="iconfont icon-wenjian"/>

                <!--  <a-tooltip v-if="getFontSize(item.fileName,14) > 100">
                    <template slot="title">
                      {{ item.fileName }}
                    </template>
                    <span>{{ getSpanText(item.fileName, 100) }}</span>
                  </a-tooltip>-->
                <span>{{ getSpanText(item.fileName, 100) }}</span>
              </div>
              <a-dropdown>
                <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                  <i class="iconfont icon-caozuo" style="margin-right: 0px!important;"></i>
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a href="javascript:;">1st menu item</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>
          </a-menu-item>
        </template>

      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- <a-layout-header style="background: #fff;margin: 10px 10px 0 10px;border-radius: 10px">
         <a-icon
             class="trigger"
             :type="collapsed ? 'menu-unfold' : 'menu-fold'"
             @click="() => (collapsed = !collapsed)"
         />
       </a-layout-header>-->
      <a-layout-content class="CodeView"
                        :style="{ margin: '10px 10px', padding: '10px', background: '#fff', minHeight: '280px' }"
      >
        <!--<keep-alive> </keep-alive> -->
          <router-view :key="$route.fullPath"/>


        <div v-if="routerInit" style="height: 100%;line-height: 100%;text-align: center;width: 100%">

          <a-result title="Great, we have done all the operations!">
            <template #icon>
              <a-icon type="smile" theme="twoTone"/>
            </template>
            <template #extra>
              <a-button type="primary">
                Next
              </a-button>
            </template>
          </a-result>
        </div>

      </a-layout-content>
    </a-layout>
    <a-modal
        title="登 录"
        :dialog-style="{ top: '60px' }"
        :visible="modal1Visible"
        @ok="onSubmit"
        @cancel="() => setModal1Visible(false)"
    >
      <a-form-model
          ref="ruleForm"
          :model="form"
          :rules="rules"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
      >

        <a-form-model-item ref="name" label="用户名" prop="name">
          <a-input
              v-model="form.name"
              @blur="
          () => {
            $refs.name.onFieldBlur();
          }
        "
          />
        </a-form-model-item>

        <a-form-model-item ref="password" label="密码" type="password" prop="password">
          <a-input
              v-model="form.password"
              @blur="
          () => {
            $refs.password.onFieldBlur();
          }
        "
          />
        </a-form-model-item>

      </a-form-model>
    </a-modal>
  </a-layout>


</template>
<script>
import {Icon} from 'ant-design-vue';
import G6 from '@antv/g6';
import fetch from "../api/fetch";
import service from "../api/fetch";
import utils from "../utils/utils";
const {Util} = G6;

export default {
  data() {
    return {
      labelCol: {span: 4},
      wrapperCol: {span: 14},
      other: '',
      form: {
        name: '',
        password: ''
      },
      rules: {
        name: [
          {required: true, message: 'Please input Activity name', trigger: 'blur'},
          {min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur'},
        ],
        region: [{required: true, message: 'Please select Activity zone', trigger: 'change'}],
        date1: [{required: true, message: 'Please pick a date', trigger: 'change'}],
        type: [
          {
            type: 'array',
            required: true,
            message: 'Please select at least one activity type',
            trigger: 'change',
          },
        ],
        resource: [
          {required: true, message: 'Please select activity resource', trigger: 'change'},
        ],
        desc: [{required: true, message: 'Please input activity form', trigger: 'blur'}],
      },
      routerInit: true,
      rootSubmenuKeys: ['sub1', 'sub2', 'sub4'],
      openKeys: ['sub1'],
      collapsed: false,
      breakpoint: "",
      fileItemSelect: [],
      defaultKey: ["recent_file"],
      folderList: [],
      modal1Visible: false,
      innerList: [
        {
          folderId: "recent_file",
          folderName: "最近文件",
          isEditor: 0,
          children: []
        },
        {
          folderId: "-2",
          folderName: "个人收藏",
          isEditor: 0,
          children: []
        }
      ],
      fileList: []
    };
  },
  created() {
    // console.log(this.$route.path)
    if (this.$route.path.startsWith("/notes/markdownView/")) {
      const fileId = this.$route.path.split("/notes/markdownView/")[1];
      const arr = [];
      arr.push(fileId);
      this.fileItemSelect = arr;
    }

  },
  mounted() {
    if (this.$store.state.userInfo) {
        this.listFolder();
    } else {
       this.folderList = this.innerList;
    }
  },
  methods: {
    onSubmit() {
      //console.log('submit!', this.form);
      fetch({
        url: "/oauth/login?username=" + this.form.name + "&password=" + this.form.password,
        method: 'post'
      }).then(response => {
        // this.folderList = response.data;
        this.$store.state.userInfo = response.data;
        const obj = {};
        obj.userInfo = response.data;
        sessionStorage.setItem("state", JSON.stringify(obj))
        this.setModal1Visible(false);

        this.listFolder();
      })
          .catch(error => {
            console.log(error);
            this.folderList = this.innerList;
            this.setModal1Visible(false);
          });
    },
    setModal1Visible(modal1Visible) {
      this.modal1Visible = modal1Visible;
    },
    folderItemClick(e) {
      this.fileItemSelect = [];
      console.log(e);
      if (e.keyPath) {
        if (e.key === "recent_file" || e.key === "-2") {
          this.listFile();
        }
        this.listFile(0, e.key)
      }
    },
    listFolder() {
      //fetch.get("http://127.0.0.1:8088/folder/listFolder",)
      fetch({
        url: "/folder/listFolders",
        method: 'get'
      }).then(response => {
        // this.folderList = response.data;
        if (response.code === 0) {
          const arr = this.innerList;
          this.folderList = arr.concat(response.data);
        }
      })
          .catch(error => {
            //console.log(error);
            this.folderList = this.innerList;
          });
      this.listFile();

    },
    listFile(type = 1, folderId = null) {
      service({
        url: "/file/listFiles?type=" + type + "&folderId=" + folderId,
        method: 'get'
      }).then(response => {
        console.log(response.data)
        if (response.code === 0) {
          this.fileList = response.data;
        }
      })
          .catch(error => {
            console.log(error)
          });

    },
    onSearch(e) {

    },
    getFontSize(text, size) {
      const arr = Util.getTextSize(text, size);
      return arr[0];
    },
    getSpanText(text, len) {
      const wh = this.getFontSize(text, 14);
      let str = text;
      if (wh > len) {
        while (this.getFontSize(str, 14) >= len) {
          str = str.substring(0, str.length - 1);
        }
        return str + "...";
      }
      return str;
    },
    menuClick(item, key, keyPath) {
      var arr = [];
      this.fileItemSelect = arr;
      this.routerInit = false;
      const fileType = item.item.value;
      console.log(item)
      if (fileType < 0) return;

      arr.push(item.key);
      this.fileItemSelect = arr;
      switch (fileType) {
        case 0:
          this.$router.push({
            path: "/notes/markdownView/" + item.key
          }).catch(err => err);
          break;
        case 1:
          this.$router.push("/view/drawView");
          break;
        default:
          break;
      }
    },
    onCollapse(collapsed, type) {
      console.log(collapsed, type);
    },
    onBreakpoint(broken) {
      console.log(broken);
    },
    createFile(e) {
      const {href} = this.$router.resolve({
        path: '/markdown/' + this.$uuid.v1()
      })
      window.open(href, '_blank')
    },
    onOpenChange(openKeys) {
      const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys;
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    },
  }
};
</script>
<style>

@media screen and (max-width: 800px) {


}

#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.folderItem {
  width: 100%;
  height: 100%;
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between
}

.folderItem span {
  padding-left: 10px
}

.iconfont {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

.CodeView {
  overflow-x: hidden;
  border-radius: 10px;
  overflow-y: hidden;
  height: 100%;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

.ant-layout-sider-zero-width-trigger {
  top: 10px !important;
  left: 10px !important;
  right: 0px !important;
  background: rgba(0, 0, 0, 0.6) !important;
}


#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

.silder-footer {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  bottom: 10px;
}
</style>
