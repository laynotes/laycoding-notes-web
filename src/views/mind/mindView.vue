<template>
  <div class="root" style="overflow-y: hidden">

    <div class="crumb-nav" style="display: none">
      <template v-for="(nav, index) in crumbNavs">
        {{ index > 0 ? '>' : '' }}
        <span
            :key="nav.id"
            class="nav-text"
            @click="changeNode(nav)"
        >{{ nav.label }}</span>
      </template>
    </div>
    <!-- canvas 挂载节点 -->
    <div v-if="initGrap" style="position: relative">
      <Spin size="large" fix></Spin>
    </div>
    <div id="graph" style="overflow-y: hidden;position: relative">

    </div>
    <!-- 输入框 -->
    <input
        v-show="showInput"
        id="input-controller"
        ref="inputController"
        v-model="inputValue"
        :style="{
        top: `${input.y}px`,
        left: `${input.x}px`,
      }"
        type="text"
        @blur="inputBlur"
    >
  </div>
</template>

<script>
import G6 from '@antv/g6';
import registerEdge from './register-edge';
import registerNode from './register-node';
import service from "@/api/fetch";
import utils from "@/utils/utils";
import LayCodingNode from "@/views/mind/laycoding-node";

const {Util} = G6;
const data = {
  id: '1',
  label: 'Java思维导图',
  nodeType: 'node',
  children: [
    {
      id: '1-1',
      label: 'Java基础',
      note: '',
      nodeType: 'node',
      direction: "right",
      children: [
        {
          id: '1-1-1',
          label: 'Java基础1',
          note: '',
          nodeType: 'node',
          direction: "right",
        },
        {
          id: '1-1-2',
          label: 'Java基础1',
          note: '',
          nodeType: 'node',
          direction: "right",
        }
      ]
    },
    {
      id: '1-2',
      label: 'Java进阶',
      note: '',
      nodeType: 'node',
      direction: "left",
      children: []
    }
  ],
};
export default {
  data() {
    return {
      initGrap: true,
      modal1Visible: false,
      currentArrow: 1,
      graph: null,
      showInput: false,
      inputValue: '',
      fileId: '',
      updateMd5: "",
      folderName: '',
      folderTree: [],
      labelSelected: "",
      labelArr: [],
      fileName: '未命名文件',
      fileInput: false,
      input: {
        x: 0,
        y: 0,
      },
      currentNode: {
        id: null,
      },
      crumbNavs: [],
    };
  },
  beforeDestroy() {
    this.graph.destroy();
  },
  created() {
    window.addEventListener("unload", this.saveLoad);
  },
  mounted() {
    const path = this.$route.path;
    const pathArr = path.split("/mindView/");
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
    if (pathArr.length > 1 && pathArr[1].length === 32) {
      this.fileId = pathArr[1];
      this.getFileInfo();
    } else {
      this.$Message.error("参数出错了~");
      let _that = this;
      setTimeout(() => {
        _that.$router.push({
          name: "main"
        })
      }, 500);
    }
  },
  methods: {
    getFileInfo() {
      service({
        url: "/file/getFileInfoById?fileId=" + this.fileId,
        method: 'get'
      }).then(response => {
        if (response.data) {
          this.createGraphic(response.data.fileContent);
          this.initGrap = false;
        } else {
          this.$message.info(response.msg)
          setTimeout(() => {
            this.$router.push("/notes/error")
          }, 500)
        }
      }).catch(error => {
        this.$router.push("/notes/error")
      })
    },
    createGraphic(baseData) {
      const vm = this;
      registerEdge(G6);
      registerNode(G6);
      LayCodingNode(G6);
      const menu = new G6.Menu({
        offsetY: -20,
        itemTypes: ['node'],
        getContent(e) {
          const outDiv = document.createElement('div');
          outDiv.style.width = 'auto';
          outDiv.innerHTML = `<ul class="ivu-dropdown-menu">
            <li class="ivu-dropdown-item menu-item" id = "add" command="add-pnode">添加同级主题</li>
            <li class="ivu-dropdown-item menu-item" id="addSon" command="add-node" >添加子主题</li>
            <li class="ivu-dropdown-item menu-item" id="export">导出数据</li>
            <li class="ivu-dropdown-item menu-item" id="exportImage">导出图片</li>
             <li class="ivu-dropdown-item menu-item" id="delete" command="delete-node">删除节点</li>
            <li class="ivu-dropdown-item menu-item" id="copy" command="edit-node">复制节点</li>
      </ul>`
          return outDiv;
        },
        handleMenuClick(target, item, event) {
          const command = target.getAttribute('command');
          switch (command) {
            case 'edit-node':
              vm.editNode(item);
              break;
            case 'delete-node':
              vm.deleteNode(item);
              break;
            case 'add-node':
              vm.addTreeNode(event, item, 1);
              break;
            case 'add-pnode':
              vm.addTreeNode(event, item, 0);
              break;
          }
        },
      });
      const minimap = new G6.Minimap();
      const grid = new G6.Grid();
      const graph = new G6.TreeGraph({
        container: document.getElementById('graph'),
        width: window.innerWidth - 40,
        height: window.innerHeight - 40,
        defaultNode: {
          type: 'lay-node-root',
          style: {
            width: 100,
            height: 30,
            radius: 4,
            fill: '#1890ff',
            stroke: '#2d8cf0',
          },
          labelCfg: {
            style: {
              fontSize: 14,
            },
          },
        },
        defaultEdge: {
          type: 'right-tree',
        },
        layout: {
          type: 'mindmap',
          direction: 'H',
          getSide: (node) => {
            return node.data.direction ? node.data.direction : "right";
          },
          getHGap: () => 40,
          getVGap: () => 20,
        },
        modes: {
          default: [
            'drag-canvas',
            'zoom-canvas',
            'drag-node',
            /* {
              type: 'collapse-expand',
              onChange(item, collapsed) {
                const data = item.get('model');
                data.collapsed = collapsed;
                return true;
              },
            }, */
          ],
        },
        plugins: [minimap, grid, menu],
        fitView: true,
        minZoom: 0.7,
        maxZoom: 3,

      });
      graph.read(baseData);
      this.graph = graph;
      //  tree.render();
      graph.zoom(1.1);
      graph.fitView();
      graph.fitCenter();

      this.bindEvents();
      this.initMiniMapCss();
    },

    initMiniMapCss() {
      const obj = document.getElementsByClassName("g6-minimap")[0];
      obj.style.position = "fixed";
      obj.style.right = "30px";
      obj.style.bottom = "40px";
      obj.style.padding = "10px";
      //box-shadow: 0 0 4px 0 #eee;
      obj.style.boxShadow = "0 0 4px 0 #ccc";
      obj.style.background = "#fff";
    },
    getParentNodes(node, id, deep = 1) {
      if (id.substring(0, 1) === '1' && deep === 1) {
        this.crumbNavs.push(node);
      }
      if (id.length > 1) {
        const $id = id.substring(0, deep * 2 + 1);
        const $node = node.children.find(item => item.id === $id);
        if ($node) {
          this.crumbNavs.push($node);
          if ($node.children) {
            this.getParentNodes($node, id, deep + 1);
          }
        }
      }
    },
    bindEvents() {
      this.graph.on('node:click', e => {
        const model = e.item.getModel();
        // console.log(model)
        if (e.target.cfg.name === 'node-label') {
          this.editNode(e.item);
          return;
        }
        model.collapsed = !model.collapsed;
        const childNum = model.children ? model.children.length : 0;
        if (model.collapsed) {
          model.label = model.label + "(" + childNum + ")";
        } else {
          model.label = model.label.indexOf("(") > -1 ? model.label.split("(")[0] : model.label;
        }
        this.graph.updateItem(e.item, model);
        this.graph.layout(false);
      });
    },
    inputBlur() {

    },
    appendGroup(group, width) {

    },
    // 编辑节点
    editNode(item) {

    },
    deleteNode(item) {

    },
    changeNode(node) {
      // this.graph.changeData(JSON.parse(JSON.stringify(node)));
    },
  },
  beforeCreate() {
    document.querySelector('body').setAttribute('style', 'overflow: hidden;')
  },
};
</script>

<style lang="scss">
.crumb-nav {
  position: absolute;
  top: 50px;
  left: 40px;
  background: #73bf8f;
  border-radius: 4px;
  color: #fff;
}

.root {
  background: white;
  background-image: linear-gradient(90deg, rgba(241, 243, 244, 1) 10%, transparent 0),
  linear-gradient(rgba(241, 243, 244, 1) 10%, transparent 0);
  background-size: 10px 10px;

}

.nav-text {
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin: 0 10px;
  cursor: pointer;
}

.g6-component-contextmenu {
  width: 100px;
  padding: 6px 0;
  cursor: pointer;

  .menu-item {
    padding: 0 10px;
    line-height: 26px;

    &:hover {
      background: #f0f0f0;
    }
  }
}

#input-controller {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 12;
  width: 100px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding-left: 6px;
  font-size: 14px;
}

#headPanel {
  text-align: center;
  left: 0;
  right: 0;
  height: 60px;
  padding: 10px;
  line-height: 20px;
  background: #fff;
  position: fixed;
  z-index: 11;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .1);
  transition: transform .3s ease-in-out;
}

.btn-group {
  border-right: 1px solid #efefef;
  display: inline-block;
  padding-left: 10px;
  padding-right: 14px;
  position: relative;

  .btn-group_tips {
    text-align: center;
    top: 63px;
    left: 1px;
    position: absolute;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 60px;
    background: #515a6e;
    border-radius: 6px;
    animation: tips 4s;
    transition: all 1s;

    &:after {
      content: "";
      width: 0;
      height: 0;
      position: absolute;
      top: -5px;
      left: 46%;
      border-width: 0 5px 5px;
      border-style: solid;
      border-color: transparent transparent #515a6e;
    }
  }

  &:last-of-type {
    border-right: 0;
  }

  .btn {
    display: inline-block;
    margin: 2px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    transition: all .4s;
    border-radius: 6px;
    border: 1px solid rgba(233, 233, 233, 0);

    i {
      font-size: 20px;
    }
  }
}
</style>
