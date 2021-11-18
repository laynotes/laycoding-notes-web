<template>
  <a-layout id="components-layout-demo-custom-trigger" style="height: 100%">

    <a-modal v-model="visible" title="创建归档" @ok="handleOk">
      <a-input placeholder="归档名称" v-model="folderName"/>
    </a-modal>


    <a-layout-sider breakpoint="lg"
                    collapsed-width="0"
                    style="margin: 10px 0 10px 10px;border-radius: 10px;background: #fff"
                    @collapse="onCollapse"
                    @breakpoint="onBreakpoint"

                    :trigger="null">
      <div style="height: 100px;width: 100%;line-height: 100px;text-align: center" @contextmenu.prevent="">
        <a-avatar v-if="this.$store.state.userInfo === null" :size="64" icon="user" @click="setModal1Visible(true)"/>
        <a-avatar v-else :size="64" :src="this.$store.state.userInfo.avatar" @click="todoPage"/>
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
          <a-menu slot="overlay" @click="createFile">
            <a-menu-item key="0" style="display: flex;flex-direction: row;">
              <i class="iconfont icon-file-markdown"></i>
              <span style="margin-left: 10px">笔&nbsp;&nbsp;记</span>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="1" style="display: flex;flex-direction: row;">
              <i class="iconfont icon-flowChart"></i>
              <span style="margin-left: 10px">流程图</span>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="2" style="display: flex;flex-direction: row;">
              <i class="iconfont icon-gongzuoliuchengtu"></i>
              <span style="margin-left: 10px">脑&nbsp;&nbsp;图</span>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="3" style="display: flex;flex-direction: row;">
              <i class="iconfont icon-wenjianjia2"></i>
              <span style="margin-left: 10px">表&nbsp;&nbsp;格</span>
            </a-menu-item>
            <a-menu-divider/>
            <a-menu-item key="-1" style="display: flex;flex-direction: row;">
              <i class="iconfont icon-wenjianjia2"></i>
              <span style="margin-left: 10px">文件夹</span>
            </a-menu-item>

          </a-menu>
        </a-dropdown>
      </div>

      <div>
        <a-menu mode="inline" :default-selected-keys="defaultKey" :selectedKeys="folderSelected"
                @click="folderItemClick">
          <a-menu-item v-for="item in innerList" :key="item.folderId">
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
              <a-dropdown v-if="item.isEditor===0">
                <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                  <i class="iconfont icon-caozuo" style="margin-right: 0px!important;"></i>
                </a>
                <a-menu slot="overlay">
                  <a-menu-item :key="item.id + '_0_'+item.folderName" @click="opreation">
                    <a-icon type="plus"/>
                    同级归档
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>
          </a-menu-item>
        </a-menu>
      </div>
      <div style="display: flex;height: 64%;position: relative">
        <Spin size="large" fix v-if="initFolder"></Spin>
        <a-menu
          :default-selected-keys="defaultKey"
          mode="inline"
          style="overflow-y: auto;overflow-x: hidden"
          :inline-collapsed="collapsed"
          :selectedKeys="folderSelected"
          @openChange="onOpenChange"
          :open-keys="openKeys"
          @click="folderItemClick"
        >
          <template v-for="item in folderList">
            <a-menu-item v-if="item.children && item.children.length === 0"
                         :key="item.folderId">
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
                <a-dropdown v-if="item.isEditor===0">
                  <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                    <i class="iconfont icon-caozuo" style="margin-right: 0px!important;"></i>
                  </a>
                  <a-menu slot="overlay">
                    <a-menu-item :key="item.folderId + '_0_rename_'+item.folderName" @click="opreation">
                      <a-icon type="form"/>
                      重命名
                    </a-menu-item>
                    <a-menu-divider/>
                    <a-menu-item :key="item.parentId + '_0_add_'+item.folderName" @click="opreation">
                      <a-icon type="plus"/>
                      同级归档
                    </a-menu-item>

                    <a-menu-divider/>
                    <a-menu-item :key="item.id + '_0_add_'+item.folderName" @click="opreation">
                      <a-icon type="plus-circle"/>
                      子级归档
                    </a-menu-item>
                    <a-menu-divider/>
                    <a-menu-item :key="item.folderId + '_0_delete_'+item.folderName" @click="opreation">
                      <a-icon type="delete"/>
                      删除归档
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </div>
            </a-menu-item>
            <a-sub-menu v-else :key="item.folderName">
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
                <a-menu-item :key="child.folderId">
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
                        <a-menu-item :key="child.folderId + '_0_rename_'+child.folderName" @click="opreation">
                          <a-icon type="form"/>
                          重命名
                        </a-menu-item>
                        <a-menu-divider/>
                        <a-menu-item :key="item.id + '_0_add_'+item.folderName" @click="opreation">
                          <a-icon type="plus"/>
                          同级归档
                        </a-menu-item>
                        <a-menu-divider/>
                        <a-menu-item :key="child.folderId + '_0_delete_'+item.folderName" @click="opreation">
                          <a-icon type="delete"/>
                          删除归档
                        </a-menu-item>
                      </a-menu>
                    </a-dropdown>
                  </div>
                </a-menu-item>
              </template>
            </a-sub-menu>
          </template>
        </a-menu>
      </div>

      <div class="lay_footer"
           style="display: none;height: 64px;bottom:15px;position: fixed;flex-direction: row;padding:10px;justify-content: center;border-top:1px #e8e8e8 solid">
        <div style="cursor: pointer;height: 100%;width: 100px;border-right:1px #e8e8e8 solid;">
          <div style="display: flex;flex-direction: column;align-items: center;">
            <a-icon type="delete" :style="{ fontSize: '18px',padding: '5px'}"/>
            <div>回收站</div>
          </div>
        </div>

        <div @click="settingHandler"
             style="cursor: pointer;height: 100%;width: 100px;align-items: center;">
          <div style="display: flex;flex-direction: column;align-items: center;">
            <a-icon type="setting" :style="{ fontSize: '18px',padding: '5px'}"/>
            <div>设&nbsp;置</div>
          </div>
        </div>
      </div>
    </a-layout-sider>
    <a-layout-sider breakpoint="lg"
                    collapsedWidth="0" style="margin: 10px 0 10px 10px;border-radius: 10px;background: #fff"
                    v-model="collapsed">

      <Spin size="large" fix v-if="initFile"></Spin>
      <div style="padding:0 10px">
        <div style="border-bottom: 1px rgb(232, 232, 232) solid;height: 70px;display: flex;align-items: center">
          <a-input-search placeholder="输入关键词" style="" v-model="searchVal"
                          @search="onSearch" @change="onSearch" allowClear/>
        </div>
      </div>
      <a-empty v-if="fileList.length === 0"
               image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
               :image-style="{
      height: '60px',
    }"
      >
        <span slot="description"> folder is empty ~  </span>
      </a-empty>
      <a-menu style="padding: 10px 0" v-if="fileList.length > 0" mode="inline" :selectedKeys="fileItemSelect">
        <template v-for="item in fileList">
          <a-menu-item :key="item.fileId" :title="item.fileName" :value="item.fileType" @click="menuClick">

            <div class="folderItem">
              <div>
                <i v-if="item.fileType===0" class="iconfont icon-file-markdown"/>
                <i v-else-if="item.fileType===1" class="iconfont icon-flowChart"/>
                <i v-else-if="item.fileType===2" class="iconfont icon-gongzuoliuchengtu"/>
                <i v-else class="iconfont icon-wenjian"/>
                <span>{{ getSpanText(item.fileName, 100) }}</span>
              </div>
              <a-dropdown>
                <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                  <i class="iconfont icon-caozuo" style="margin-right: 0px!important;"></i>
                </a>
                <a-menu slot="overlay" @click="opreation">
                  <a-menu-item :key="item.fileId + '_1_rename_'+item.fileName">
                    <a-icon type="form"/>
                    重命名
                  </a-menu-item>
                  <a-menu-divider/>
                  <a-menu-item :key="item.fileId + '_1_edit_'+item.fileName+'_' + item.fileType">
                    <a-icon type="edit"/>
                    编&nbsp;&nbsp;辑
                  </a-menu-item>
                  <a-menu-divider/>
                  <a-menu-item :key="item.fileId + '_1_delete_'+item.fileName">
                    <a-icon type="delete"/>
                    删&nbsp;&nbsp;除
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>
          </a-menu-item>
        </template>

      </a-menu>
      <div style="position: absolute;width: 100%;text-align: center;;bottom: 20px" v-if="pageTotal>0">
        <a-pagination :defaultPageSize="2" size="small" @change="pageChange" v-model="cruPage" :total="pageTotal"
                      :hideOnSinglePage="true"/>
      </div>
    </a-layout-sider>

    <a-layout>
      <a-layout-content class="CodeView"
                        :style="{ margin: '10px 10px', padding: '10px', background: '#fff', minHeight: '280px' }"
      >

        <router-view :key="this.$route.fullPath"/>

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

        <a-form-model-item ref="password" label="密码" prop="password">
          <a-input-password
            v-model="form.password"
          />
        </a-form-model-item>

      </a-form-model>
    </a-modal>

    <!--待办面板-->
    <a-drawer

      placement="right"
      :closable="false"
      :visible="todoShow"
      @close="onClose"
      width="450px"
    >
      <lay-todo @showCalender="showCalender"/>
    </a-drawer>

    <LayTodoCalendar :show="todoCalenderShow" @showCalender="showCalender"/>
    <!--设置弹窗-->
    <a-drawer

      placement="right"
      :closable="true"
      :visible="settingShow"
      @close="onClose"
      width="450px"
    >
      <el-tabs style="height: 100%">
        <el-tab-pane label="个人设置">
          <user-setting @logout="logout"/>
        </el-tab-pane>

        <el-tab-pane label="图床配置">
          <image-bed/>
        </el-tab-pane>

        <el-tab-pane label="图床配置1">

        </el-tab-pane>
        <el-tab-pane label="关于开源">关于开源</el-tab-pane>

      </el-tabs>
    </a-drawer>

  </a-layout>


</template>
<script>
import {Icon} from 'ant-design-vue';
import G6 from '@antv/g6';
import fetch from "../api/fetch";
import service from "../api/fetch";
import utils from "../utils/utils";
import UserSetting from "@/components/setting/userPage";
import LayTodo from "@/components/setting/todoPage";
import LaytodoCalendar from "@/components/setting/todoListPage";
import LayTodoCalendar from "@/components/setting/todoListPage";
import ImageBed from "@/components/setting/imageBed";


const {Util} = G6;

export default {
  components: {ImageBed, LayTodoCalendar, LayTodo, UserSetting},
  data() {
    return {
      todoCalenderShow: false,
      todoShow: false,
      settingShow: false,
      initFolder: false,
      initFile: false,
      labelCol: {span: 4},
      wrapperCol: {span: 14},
      other: '',
      parentId: 0,
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
      rootSubmenuKeys: [],
      openKeys: [],
      collapsed: false,
      breakpoint: "",
      folderName: "",
      fileItemSelect: [],
      folderSelected: [],
      defaultKey: ["recent_file"],
      folderList: [],
      modal1Visible: false,
      visible: false,
      folderId: '',
      innerList: [
        {
          folderId: "recent_file",
          folderName: "最近文件",
          isEditor: 1,
          children: []
        },
        {
          folderId: "-2",
          folderName: "个人收藏",
          isEditor: 1,
          children: []
        }
      ],
      fileList: [],
      isLogin: false,
      pageTotal: 0,
      searchVal: '',
      cruPage: 1,
      loading: false
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

    window.addEventListener("unload", this.saveStatus);

  },
  mounted() {
    if (this.$store.state.userInfo) {
      this.listFolder();
    }

    this.folderSelected = sessionStorage.getItem("folder_id") ? JSON.parse(sessionStorage.getItem("folder_id")) : [];
    this.fileItemSelect = sessionStorage.getItem("file_id") ? JSON.parse(sessionStorage.getItem("file_id")) : [];
  },
  methods: {
    saveStatus() {
      sessionStorage.setItem("file_id", JSON.stringify(this.fileItemSelect));
      sessionStorage.setItem("folder_id", JSON.stringify(this.folderSelected));
    },
    pageChange(page, pageSize) {
      this.listPages(this.folderId)
    },
    showCalender(show) {
      this.todoCalenderShow = show;
    },
    todoPage() {
      this.todoShow = true;
    },

    settingHandler() {
      if (!this.isLogin) {
        this.$message.error("请先登录！");
        return;
      }
      this.settingShow = true;
    },
    logout() {
      this.folderList = [];
      this.fileList = [];
      this.settingShow = false;
      this.isLogin = false;
    },
    onClose(e) {
      this.settingShow = false;
      this.todoShow = false;
    },
    handleOk() {
      const folderName = this.folderName;
      if (folderName === "" || folderName === null) {
        this.$Message.error("归档名称不能为空~")
        return;
      }
      service({
        url: "/folder/saveFolder?folderName=" + folderName + "&parentId=" + this.parentId,
        method: "post",
      }).then(renpose => {
        if (renpose.data) {
          this.$Message.success("创建成功~");
          this.listFolder();
        }
        setTimeout(() => {
          this.visible = false;
        }, 300)
      }).catch(erro => {
        this.visible = false;
      })
      this.parentId = 0;
    },
    opreation(e) {
      console.log(e)
      const key = e.key;
      if (key.indexOf("_") === -1) {
        return;
      }
      const arr = key.split("_");
      const parentId = arr[0];
      const type = parseInt(arr[1]);
      const action = arr[2];
      this.parentId = parseInt(parentId);

      if (type === 0) {
        if (action === "add") {
          this.visible = true;
        }
        if (action === "rename") {
          this.renameOpreation(parentId, type, arr[3]);
        }
        if (action === "delete") {
          this.$confirm({
            title: '操作提示',
            content: '确认删除归档:' + arr[3] + "吗?",
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
              this.deleteOpreation(type, parentId);
            },
          });
        }
      } else {
        if (action === "add") {
          this.visible = true;
        }
        // eslint-disable-next-line no-empty
        if (action === "rename") {
          this.renameOpreation(parentId, type, arr[3]);
        }
        console.log(action)
        if (action === "edit") {
          this.redirectEditor(parseInt(arr[4]), parentId);
        }
        if (action === "delete") {
          this.$confirm({
            title: '操作提示',
            content: '确认删除文件:' + arr[3] + '吗?',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
              this.deleteOpreation(type, parentId);
            },
          });
        }
      }
    },
    renameOpreation(id, type, name) {
      this.$prompt('请输入新名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: name
      }).then(({value}) => {
        if (value.trim() === name.trim()) {
          return;
        }
        service({
          url: '/file/updateFileName',
          method: 'post',
          data: {
            id: id,
            type: type,
            name: value.trim()
          }
        }).then(response => {
          if (response.data) {
            this.$message.success("更新成功~");
            if (type === 1 && this.folderSelected.length > 0 && this.folderSelected[0] !== "recent_file") {
              this.listFile(0, this.folderSelected[0]);
              return;
            } else if (type === 0) {
              console.log("更新文件")
              this.listFolder();
            }
            this.listFile();
          }
        })
      }).catch(() => {
        this.$message.warning("已取消~");
      });
    },
    deleteOpreation(type, id) {
      const url = type === "0" ? "/folder/deleteFolder?folderId=" + id : "/file/deleteFile?fileId=" + id;
      service({
        url: url,
        method: "delete"
      }).then(res => {
        this.$Message.info("操作成功");
        this.listFolder();
      })
    },
    onSubmit() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      service({
        url: "/oauth/login?username=" + this.form.name + "&password=" + this.form.password,
        method: 'post'
      }).then(response => {
        this.$store.state.userInfo = response.data;
        const obj = {};
        obj.userInfo = response.data;
        sessionStorage.setItem("state", JSON.stringify(obj));
        this.$message.success("登入成功~")
        setTimeout(() => {
          this.setModal1Visible(false);
          this.listFolder();
          this.loading = false;
        }, 200)
      }).catch(error => {
        this.loading = false;
        this.$message.error("登录失败~")
        this.setModal1Visible(false);
      });
    },
    setModal1Visible(modal1Visible) {
      this.modal1Visible = modal1Visible;
    },
    folderItemClick(e) {
      this.fileItemSelect = [];
      this.folderSelected = [e.key];
      this.folderId = e.key;
      if (e.keyPath) {
        if (e.key === "recent_file" || e.key === "-2") {
          this.listFile();
        } else {
          this.listFile(0, e.key)
        }
      }
    },
    listFolder() {
      this.initFolder = true;
      fetch({
        url: "/folder/listFolders",
        method: 'get'
      }).then(response => {
        if (response.code === 0) {
          this.folderList = response.data;
          const arr = response.data;
          this.isLogin = true;
          const rootKeys = [];
          arr.forEach(item => {
            if (item.children && item.children.length > 0) {
              rootKeys.push(item.folderName);
            }
          })
          this.rootSubmenuKeys = rootKeys;
          this.initFolder = false;
          this.listFile();
        }
      }).catch(error => {
        this.initFolder = false;
      });
    },
    listFile(type = 1, folderId = null) {
      if (type === 0) {
        this.listPages(folderId);
        return;
      }
      this.initFile = true;
      service({
        url: "/file/listFiles?type=" + type + "&folderId=" + folderId + "&val=" + this.searchVal,
        method: 'get'
      }).then(response => {
        if (response.code === 0) {
          this.fileList = response.data;
          this.isLogin = true;
        }
        this.initFile = false;
      }).catch(error => {
        console.log(error);
        this.initFile = false;
      });

    },
    listPages(folderId) {
      this.initFile = true;
      service({
        url: "/file/listPages?folderId=" + folderId + "&val=" + this.searchVal + "&pageNum=" + this.cruPage + "&pageSize=10",
        method: 'get'
      }).then(response => {
        console.log(response.data)
        if (response.code === 0) {
          this.fileList = response.data.records;
          this.pageTotal = response.data.total;
          this.isLogin = true;
        }
        this.initFile = false;
      }).catch(error => {
        console.log(error);
        this.initFile = false;
      });
    },
    onSearch(e) {
      if (this.folderId.length === 32) {
        this.listPages(this.folderId);
      } else {
        this.listFile();
      }
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
      this.redirectView(fileType, item.key);
    },
    redirectView(fileType, key) {
      switch (fileType) {
        case 0:
          this.$router.push({
            path: "/notes/markdownView/" + key
          }).catch(err => err);
          break;
        case 1:
          this.$router.push({
            path: "/notes/drawView/" + key
          }).catch(err => console.log(err));
          break;
        case 2:
          this.$router.push({
            path: "/notes/mindView/" + key
          }).catch(err => console.log(err));
          break;
        default:
          break;
      }
    },
    redirectEditor(fileType, key) {
      console.log(fileType, key)
      let path = "/markdown/";
      switch (fileType) {
        case 0:
          path = "/markdown/";
          break;
        case 1:
          path = "/draw/";
          break;
        case 2:
          path = "/mind/";
          break;
        default:
          path = "/excel/";
          break;
      }
      const {href} = this.$router.resolve({
        path: path + key
      })
      window.open(href, '_blank');
    },
    onCollapse(collapsed, type) {

    },
    onBreakpoint(broken) {

    },
    createFile(e) {
      if (e.key === "-1") {
        this.visible = true;
        return;
      }
      this.redirectEditor(parseInt(e.key), this.$uuid.v1())
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

.setting-model {
  height: 400px;
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
