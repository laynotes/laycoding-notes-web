<template>
  <div id="root">

    <Spin fix size="large" v-if="initDraw"/>

    <div id="headPanel" style="display: flex;justify-content: flex-start">
      <div class="head-left" style="width: 20%;display: flex;justify-content: flex-start;margin: auto 0">
        <el-input
          v-if="fileInput" v-model="fileName" style="width: 160px" @blur="showFileInput"
          clearable>
        </el-input>
        <span @click="showFileInput" v-else style="font-weight: bold;cursor: pointer">{{ fileName }}</span>
      </div>
      <div class="btn-group">
        <div class="btn" title="用户" @mousedown="startDragLine('People',imgsrc,$event)">
          <i class="iconfont icon-renwu3"></i>
        </div>
        <div class="btn" title="文本" @mousedown="startDragLine('Text','',$event)">
          <i class="iconfont icon-wenben"></i>
        </div>

      </div>
      <div class="btn-group">


        <div class="btn" title="分割线(竖)" @mousedown="startDragLine('c',lineSrc,$event)">
          <i class="iconfont icon-xuxian-feijidongche"></i>
        </div>

        <div class="btn" title="分割线(横)" @mousedown="startDragLine('Line',lineSrc,$event)">
          <i class="iconfont icon--xuxian"></i>
        </div>
        <Tooltip content="撤销" placement="bottom">
          <div class="btn" @click="undo()" style="margin-top: 5px;">
            <i class="iconfont icon-zhongzuo2"></i>
          </div>
        </Tooltip>
        <Tooltip content="重做" placement="bottom">
          <div class="btn" @click="redo()" title="粘贴">
            <i class="iconfont icon-zhongzuo1"></i>
          </div>
        </Tooltip>

      </div>
      <div class="btn-group">
        <Tooltip content="直线箭头" placement="bottom">
          <div :class=" ['btn',currentArrow === 1?'currentArrow':'']" @click="changeEdgeType('normal')">
            <i class="iconfont icon-ai28"></i>
          </div>
        </Tooltip>
        <Tooltip content="曲线箭头" placement="bottom">
          <div :class=" ['btn',currentArrow === 2?'currentArrow':'']" @click="changeEdgeType('smooth')">
            <i class="iconfont icon-jiantou11"></i>
          </div>
        </Tooltip>
        <Tooltip content="直角箭头" placement="bottom">
          <div :class=" ['btn',currentArrow === 3?'currentArrow':'']" @click="changeEdgeType()">
            <i class="iconfont icon-jiantou10"></i>
          </div>
        </Tooltip>
      </div>
      <div class="btn-group">
        <div class="btn" @click="changeMode('edit')" title="选择模式">
          <i class="iconfont icon-mousepointershubiao"></i>
        </div>
        <div class="btn" @click="changeMode('drag')" title="拖拽模式">
          <i class="iconfont icon-tuozhuai"></i>
        </div>
      </div>
      <div class="btn-group">
        <Tooltip content="删除" placement="bottom">
          <div class="btn" @click="deleteNode()" style="margin-top: 5px;">
            <i class="iconfont icon-shanchu"></i>
          </div>
        </Tooltip>
        <Tooltip content="保存" placement="bottom">
          <div class="btn" @click="saveToPNG()" title="保存">
            <i class="iconfont icon-xiazai"></i>
          </div>
        </Tooltip>

      </div>
      <div class="btn-group">
        <Tooltip content="复制" placement="bottom">
          <div class="btn" @click="copyNode()" style="margin-top: 5px;">
            <i class="iconfont icon-fuzhi"></i>
          </div>
        </Tooltip>
        <Tooltip content="粘贴" placement="bottom">
          <div class="btn" @click="parseNode()" title="粘贴">
            <i class="iconfont icon-niantie"></i>
          </div>
        </Tooltip>

      </div>
    </div>
    <div id="stencil" class="leftPanel" style=""></div>
    <div class="container_warp" style="">
      <div id="container" style=""></div>
      <div id="minimapContainer"></div>
    </div>
    <RightDrawer class="right_drawer" :drawerType="type" :selectCell="selectCell" :graph="graph" :grid="grid"
                 @deleteNode="deleteNode"></RightDrawer>
    <Dropdown transfer placement="right-start" trigger="custom" ref="contextMenu"
              :visible="visible"
              @on-clickoutside="handleCancel" @on-click="rightMenuClick">
      <Dropdown-menu slot="list">
        <Dropdown-item name="1">删除节点</Dropdown-item>
        <Dropdown-item name="2">复制节点</Dropdown-item>
        <Dropdown-item name="3">粘贴节点</Dropdown-item>
        <Dropdown-item name="4">取 消</Dropdown-item>
      </Dropdown-menu>
    </Dropdown>
    <a-input
      v-show="showInput"
      id="input-controller"
      ref="inputController"
      v-model="inputValue"
      :style="{
        position:'fixed',
        top: `${input.y}px`,
        left: `${input.x}px`,
        width:'150px'
      }"
      type="text"
      @blur="inputBlur"
    />

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
import '@antv/x6-vue-shape'

import RightDrawer from './RightDrawer';
import {Graph, Shape, Addon, FunctionExt, DataUri} from '@antv/x6';
import {getFontSize, startDragToGraph} from "@/views/draw/draw";
import insertCss from "insert-css";
import {startDragLineToGraph} from '@/views/draw/draw';
import service from "@/api/fetch";
import utils from "@/utils/utils";
import registerNode from "./registerNode";

export default {
  name: "draw",
  components: {
    RightDrawer
  },
  data() {
    return {
      showInput: '',
      inputValue: "",
      input: {},
      fileInput: false,
      initDraw: true,
      isEditor: false,
      fileId: '',
      modal1Visible: false,
      fileMd5: '',
      updateMd5: "",
      fileName: '',
      folderName: '',
      labelSelected: "",
      labelArr: [{"label": "java", "id": "1"}, {"label": "面经", "id": "2"}, {"label": "数据库", "id": "3"}, {
        "label": "中间件",
        "id": "4"
      }],
      imgsrc: require("../../assets/people_line.png"),
      lineSrc: require("../../assets/line.png"),
      screenWidth: window.innerWidth,
      screenHeigth: window.innerHeight,
      ports: {
        groups: {
          // 输入链接桩群组定义
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#2D8CF0',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
          // 输出链接桩群组定义
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#2D8CF0',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#2D8CF0',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#2D8CF0',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          {
            id: 'port1',
            group: 'top',
          },
          {
            id: 'port2',
            group: 'bottom',
          },
          {
            id: 'port3',
            group: 'left',
          },
          {
            id: 'port4',
            group: 'right',
          }
        ],
      },
      graph: '',
      value1: true,
      type: 'grid',
      selectCell: '',
      connectEdgeType: {  //连线方式
        connector: 'normal',
        router: {
          name: ''
        }
      },
      showTips: false,
      currentArrow: 1,
      grid: { // 网格设置
        size: 20,      // 网格大小 10px
        visible: true, // 渲染网格背景
        type: 'mesh',
        args: {
          color: '#D0D0D0',
          thickness: 1,     // 网格线宽度/网格点大小
          factor: 10,
        },
      },
      visible: false,
      locator: null,
      posX: 0,
      posY: 0,
      rightId: "",
      rightNode: [],
      dx: 20,
      dy: 20,
      grapData: "",
      folderTree: [],
      drawData: null
    }
  },
  created() {
    window.addEventListener("unload", this.saveLoad);

  },
  methods: {
    inputBlur() {
      this.showInput = false;
      //  this.changeNodeText(this.selectCell);
    },
    getFileInfo(fileId) {
      service({
        url: "/file/getFileInfoById?fileId=" + fileId,
        method: 'get'
      }).then(response => {
        console.log(response.data)
        if (response.data) {
          this.drawData = response.data.fileContent;
          this.fileName = response.data.fileName;
          setTimeout(() => {
            this.isEditor = true;
            this.initDraw = false;
            this.init();
            this.hidePorts();
            this.watchWidth();

          }, 500);
        }
      }).catch(error => {
        this.initDraw = false;
        this.$router.push("/main")
      });
    },
    showFileInput() {
      this.fileInput = !this.fileInput;
    },
    hidePorts() {
      const container = document.getElementById('container')
      const ports = container.querySelectorAll(
        '.x6-port-body'
      )
      this.showPorts(ports, false)
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
    saveLoad() {
      sessionStorage.setItem(this.fileId + "_data", this.grapData);
      sessionStorage.setItem("update_id", this.updateMd5);
    },
    setModal1Visible(show) {
      this.modal1Visible = show;
    },
    saveInfo() {
      this.insertFile();
    },
    insertFile() {
      const config = {};
      config.themeType = "github";
      let data = {};
      data.fileConfig = config;
      data.fileType = 1;
      data.fileSource = "";
      data.fileContent = this.grapData;
      data.fileName = this.fileName;
      data.folderId = this.folderName;
      data.fileId = this.fileId;
      data.fileLabel = [{
        "label": "mysql"
      }];
      this.$http({
        url: service.defaults.baseURL + "/file/insertFile",
        method: "post",
        headers: {
          'Content-Type': 'application/json;',
          'Authorization': "Bearer " + this.userInfo.token
        },
        data: data
      }).then(response => {
        // this.fileMd5 = this.updateMd5;
        this.updateMd5 = this.fileId;

        this.modal1Visible = false;
        this.isReqest = false;

        this.$message.success("已保存")
      }).catch(error => {
        console.log(error);
        // this.isReqest = false;
        this.modal1Visible = false;
      })
    },
    startDragLine(type, src, e) {

      startDragLineToGraph(this.graph, src, type, e);
    },
    changeNodeText(node, text) {
      console.log(this.inputValue)
      const str = node.store.data.attrs.label.text;
      if (this.inputValue === '') {
        this.inputValue = text;
        return;
      }
      //node.attr('label/text', this.inputValue);
      node.setAttrs({
        label: {text: this.inputValue},
      })
      const fontSize = this.selectCell.store.data.attrs.label.fontSize && this.selectCell.store.data.attrs.label.fontSize > 16 ? this.selectCell.store.data.attrs.label.fontSize : 16;
      const arr = getFontSize(this.inputValue, fontSize);
      const oldW = node.size().width;
      const diff_width = oldW - getFontSize(str, fontSize)[0];
      const pos = node.position();
      node.resize(arr[0] + diff_width, node.size().height);
      node.position(pos.x - (arr[0] + diff_width - oldW) / 2, pos.y, {deep: true});
      //this.selectCell = node;
    },
    undo() {
      this.graph.undo();
    },
    redo() {
      this.graph.redo();
    },
    watchWidth() {
      window.onresize = () => {
        return (() => {
          window.screenWidth = window.innerWidth
          this.screenWidth = window.screenWidth;
          this.screenHeigth = window.innerHeight;
          this.initCss();
        })()
      }
    },
    copyNode() {
      const cells = this.graph.getSelectedCells().length === 0 ? this.rightNode : this.graph.getSelectedCells();
      if (cells && cells.length) {
        this.graph.copy(cells)
        this.$Message.success('复制成功')
      } else {
        this.$Message.info('请先选中节点再复制')
      }
    },
    parseNode() {
      if (this.graph.isClipboardEmpty()) {
        this.$Message.info('剪切板为空，不可粘贴')
      } else {
        const cells = this.graph.paste({
          offset: {dx: this.dx, dy: this.dy}
        });
        this.graph.cleanSelection()
        this.graph.select(cells)
        this.$Message.success('粘贴成功')
      }
    },
    rightMenuClick(item) {
      const id = parseInt(item);
      switch (id) {
        case 1:
          this.delete(this.rightId);
          break;
        case 2:
          this.copyNode();
          break;
        case 3:
          this.parseNode();
          break;
        default:
          this.visible = false;
          break;
      }
    },
    handleCancel() {
      this.visible = false
      this.removeLocator();
    },
    removeLocator() {
      if (this.locator) document.body.removeChild(this.locator)
      this.locator = null
    },
    createLocator() {
      // 获取Dropdown
      const contextmenu = this.$refs.contextMenu
      // 创建locator
      const locator = document.createElement('div')
      locator.style.cssText = `position:fixed;left:${this.posX}px;top:${this.posY}px`
      document.body.appendChild(locator)
      // 将locator绑定到Dropdown的reference上
      contextmenu.$refs.reference = locator
      this.locator = locator
    },
    init() {
      const _that = this;
      const graph = new Graph({
        container: document.getElementById('container'),
        grid: _that.grid,
        keyboard: true,
        width: window.innerWidth,
        height: window.innerHeight,
        allowBlank: false,
        allowLoop: false,
        scroller: {
          enabled: true,
        },
        autoResize: true,
        minimap: {
          enabled: true,
          container: document.getElementById("minimapContainer"),
        },
        resizing: { //调整节点宽高
          enabled: true,
          orthogonal: false,
        },
        snapline: true,
        interacting: {
          edgeLabelMovable: true
        },
        clipboard: {
          enabled: true
        },
        following: true,
        strict: true,
        selecting: {
          enabled: true,
          rubberband: true
        },
        history: true,
        multiple: true,
        connecting: { // 节点连接
          anchor: 'center',
          connectionPoint: 'anchor',
          allowBlank: false,
          snap: true,
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  // stroke: '#1890ff',
                  strokeWidth: 1,
                  targetMarker: {
                    name: 'classic',
                    size: 8
                  },
                  strokeDasharray: 0, //虚线
                  style: {
                    animation: 'ant-line 30s infinite linear',
                  },
                },
              },
              label: {
                text: ''
              },
              connector: _that.connectEdgeType.connector,
              router: {
                name: _that.connectEdgeType.router.name || ''
              },
              zIndex: 0
            })
          },
        },
        highlighting: {
          magnetAvailable: {
            name: 'stroke',
            args: {
              padding: 4,
              attrs: {
                strokeWidth: 4,
                stroke: '#6a6c8a'
              }
            }
          }
        },
      });
      insertCss(`
              @keyframes ant-line {
                to {
                    stroke-dashoffset: -1000
                }
              }
            `)
      this.graph = graph;


      this.initLeftPanel();
      if (this.drawData) {
        this.graph.fromJSON(this.drawData);
      }
      this.initCss();

      this.graph.history.redo();
      this.graph.history.undo();

      this.graph.scrollToContent();
      // 鼠标移入移出节点
      this.graph.on('node:mouseenter', FunctionExt.debounce(() => {
          const container = document.getElementById('container')
          const ports = container.querySelectorAll(
            '.x6-port-body'
          )
          this.showPorts(ports, true)
        }),
        500
      );
      graph.on('cell:dblclick', ({ cell, e }) => {
        if (!cell.isEdge()) return;
        cell.addTools([
          {
            name: cell.isEdge() ? 'edge-editor' : 'node-editor',
            args: {
              event: e,
            },
          },
        ])
      })

      this.graph.bindKey('ctrl+space', (e) => {
        let cell = this.selectCell;
        if (cell.isEdge()) {
          return;
        }
        let text = cell.store.data.attrs.label.text;
        let that = this;
        cell.addTools([
          {
            name: cell.isEdge() ? 'edge-editor' : 'node-editor',
            args: {
              event: e,
              getText: () => {
                return text;
              },
              setText: (res) => {
                that.inputValue = res.value;
                that.changeNodeText(cell, text)
              }
            },
          },
        ])
      })

      this.graph.on("cell:contextmenu", ({e, node}) => {
        this.rightId = node.id;
        this.rightNode = [];
        console.log(node)
        this.rightNode.push(node);
        const clientX = e.clientX;
        const clientY = e.clientY;
        if (this.posX !== clientX) this.posX = clientX + 10;
        if (this.posY !== clientY) this.posY = clientY + 10;
        if (this.trigger !== 'custom') {
          this.createLocator()
          this.visible = true
        }


      });

      this.graph.on('blank:contextmenu', ({e}) => {
        const clientX = e.clientX;
        const clientY = e.clientY;
        const cells = this.graph.getCellsInClipboard();

        if (!cells || cells.length == 0) return;
        if (this.posX !== clientX) this.posX = clientX + 10;
        if (this.posY !== clientY) this.posY = clientY + 10;
        if (this.trigger !== 'custom') {
          this.createLocator()
          this.visible = true
        }
      })
      this.graph.on('node:mouseleave', () => {
        const container = document.getElementById('container')
        const ports = container.querySelectorAll(
          '.x6-port-body'
        )
        this.showPorts(ports, false)
      })
      this.graph.on('blank:click', () => {
        this.type = 'grid'
      })
      this.graph.on('cell:click', ({cell}) => {
        console.log(cell)
        this.type = cell.isNode() ? 'node' : 'edge'
      })
      this.graph.on('selection:changed', (args) => {
        args.added.forEach(cell => {
          this.selectCell = cell;
          if (cell.isEdge()) {
            cell.isEdge() && cell.attr('line/strokeDasharray', 5) //虚线蚂蚁线
            cell.addTools([
              {
                name: 'vertices',
                args: {
                  padding: 4,
                  attrs: {
                    strokeWidth: 0.1,
                    stroke: '#2d8cf0',
                    fill: '#ffffff',
                  }
                },
              },
            ])
          }
        })
        args.removed.forEach(cell => {
          cell.isEdge() && cell.attr('line/strokeDasharray', 0)  //正常线
          cell.removeTools()
        })
      })


    },
    initCss() {
      try {
        const obj = document.getElementsByClassName("x6-widget-minimap")[0];
        obj.style.position = "fixed";
        obj.style.bottom = "20px";
        obj.style.right = "350px";
        obj.style.zIndex = 9999;

        const objS = document.getElementsByClassName("x6-graph-scroller")[0];
        objS.style.width = (this.screenWidth - 540) + "px";
        objS.style.height = (this.screenHeigth - 64) + "px";
      } catch (e) {
        console.log(e);
      }
    },
    initLeftPanel() {
      const graph = this.graph;
      //return wrap;
      try {
        Graph.registerHTMLComponent('my-html', (node) => {
          const wrap = document.createElement('img')
          wrap.src = this.lineSrc;
          wrap.style.width = "100%";
          wrap.style.height = "100%"
          return wrap;
        })

        Graph.registerHTMLComponent('line-html', (node) => {
          const wrap = document.createElement('div')
          wrap.style.border = '1px dashed red'
          wrap.style.width = "100%";
          wrap.style.height = "100%"
          return wrap
        })

      } catch (e) {
        console.log("e");
      }


      const stencil = new Addon.Stencil({
        search: (cell, keyword) => {
          if (keyword) {
            return cell.shape === 'rect' && cell.attr('label/text').includes(keyword)
          }
          return true
        },
        title: '流程图',
        target: graph,
        stencilGraphWidth: 200,
        stencilGraphHeight: 180,
        collapsable: true,
        groups: [
          {
            title: '基础流程图',
            name: 'group1',
          },
          {
            title: '系统设计图',
            name: 'group2',
            graphHeight: 250,
            layoutOptions: {
              rowHeight: 70,
            },
          },
        ],
        layoutOptions: {
          columns: 2,
          columnWidth: 80,
          rowHeight: 55,
        },
      })
      document.getElementById('stencil').appendChild(stencil.container)

      const r1 = graph.createNode({
        shape: 'custom-rect',
        attrs: {
          label: {
            text: "开始",
            fontSize: 12,
            fill: '#000000',
          },
          body: {
            rx: 20,
            ry: 26,
          },
        },
      })
      const r2 = graph.createNode({
        shape: 'custom-rect',
        attrs: {
          label: {
            text: "过程",
            fontSize: 12,
            fill: '#000000',
          }
        }
      })
      const r3 = graph.createNode({
        shape: 'custom-rect',
        attrs: {
          label: {
            text: "可选过程",
            fontSize: 12,
            fill: '#000000',
          },
          body: {
            rx: 6,
            ry: 6,
          },
        }
      })
      const r4 = graph.createNode({
        shape: 'custom-polygon',
        attrs: {
          label: {
            text: "决策",
            fontSize: 12,
            fill: '#000000',
          },
          body: {
            refPoints: '0,10 10,0 20,10 10,20',
          },
        }
      })
      const r5 = graph.createNode({
        shape: 'custom-polygon',
        attrs: {
          label: {
            text: "数据",
            fontSize: 12,
            fill: '#000000',
          },
          body: {
            refPoints: '10,0 40,0 30,20 0,20',
          },
        },
        label: '数据',
      })
      const r6 = graph.createNode({
        shape: 'custom-circle',
        attrs: {
          label: {
            text: "连接",
            fontSize: 12,
            fill: '#000000',
          },
        }
      })

      stencil.load([r1, r2, r3, r4, r5, r6], 'group1')

      const m1 = graph.createNode({
        shape: 'custom-image',
        label: 'Client',
        attrs: {
          label: {
            text: "Client",
            fontSize: 12,
            fill: '#ffffff',
          },
          body: {
            stroke: "#26C160",
            fill: "#26C160",
          },
          image: {
            'xlink:href':
              'https://gw.alipayobjects.com/zos/bmw-prod/687b6cb9-4b97-42a6-96d0-34b3099133ac.svg',
          },
        },
      })
      const m2 = graph.createNode({
        shape: 'custom-image',
        label: 'Http',
        attrs: {
          label: {
            text: "Http",
            fontSize: 12,
            fill: '#ffffff',
          },
          body: {
            stroke: '#2CB9FF',
            fill: '#2CB9FF',
          },
          image: {
            'xlink:href':
              'https://gw.alipayobjects.com/zos/bmw-prod/dc1ced06-417d-466f-927b-b4a4d3265791.svg',
          },
        },
      })
      const m3 = graph.createNode({
        shape: 'custom-image',
        label: 'Api',
        attrs: {
          label: {
            text: "Api",
            fontSize: 12,
            fill: '#ffffff',
          },
          body: {
            stroke: '#5AB0BE',
            fill: '#5AB0BE',
          },
          image: {
            'xlink:href':
              'https://gw.alipayobjects.com/zos/bmw-prod/c55d7ae1-8d20-4585-bd8f-ca23653a4489.svg',
          },
        },
      })
      const m4 = graph.createNode({
        shape: 'custom-image',
        label: 'Sql',
        attrs: {
          label: {
            text: "Sql",
            fontSize: 12,
            fill: '#ffffff',
          },
          body: {
            stroke: '#E6475B',
            fill: '#E6475B',
          },
          image: {
            'xlink:href':
              'https://gw.alipayobjects.com/zos/bmw-prod/6eb71764-18ed-4149-b868-53ad1542c405.svg',
          },
        },
      })
      const m5 = graph.createNode({
        shape: 'custom-image',
        label: 'Clound',
        attrs: {
          label: {
            text: "Cloud",
            fontSize: 12,
            fill: '#ffffff',
          },
          body: {
            stroke: '#DA2625',
            fill: '#DA2625',

          },
          image: {
            'xlink:href':
              'https://gw.alipayobjects.com/zos/bmw-prod/c36fe7cb-dc24-4854-aeb5-88d8dc36d52e.svg',
          },
        },
      })
      const m6 = graph.createNode({
        shape: 'custom-image',
        label: 'Mq',
        attrs: {
          label: {
            text: "Mq",
            fontSize: 12,
            fill: '#ffffff',
          },
          body: {
            stroke: '#FFB15F',
            fill: '#FFB15F',
          },
          image: {
            'xlink:href':
              'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
          },
        },
      })


      const m7 = graph.createNode({
        shape: 'custom-image',
        label: 'Kafka',
        attrs: {
          label: {
            text: "Kafka",
            fontSize: 12,
            fill: '#1296db',
          },
          body: {
            stroke: '#ffffff',
            fill: '#ffffff',
          },
          image: {
            'xlink:href':
              require("../../assets/svg/kafka.svg"),
          },
        },
      })

      stencil.load([m1, m2, m3, m4, m5, m7, m6], 'group2');

      const container = document.getElementById('stencil')
      const ports = container.querySelectorAll(
        '.x6-port-body'
      )
      this.showPorts(ports, false);
      this.initHeigth();
    },

    initHeigth() {
      let collaps = document.getElementsByClassName("x6-widget-stencil-group collapsable");
      for (let i = 1; i < collaps.length; i++) {
        const node = collaps[i];
        node.className = "x6-widget-stencil-group collapsable collapsed";
      }

      let arr = document.getElementsByClassName('x6-graph-svg-viewport');
      for (let i = 0; i < arr.length; i++) {
        const node = arr[i];
        const parentMode = node.parentNode;
        const rect = node.getBoundingClientRect();
        if (parentMode && parentMode.parentNode) {
          const heightPx = parentMode.parentNode.style.height;
          const heigth = heightPx.split("px")[0];
          if (rect.height > heigth) {
            parentMode.parentNode.style.height = (rect.height + 30) + "px";
          }
        }
      }
    },
    showPorts(ports, show) {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    },
    // 拖拽生成正方形或者圆形
    startDrag(type, e) {
      startDragToGraph(this.graph, type, e)
    },
    // 删除节点
    deleteNode() {
      const cell = this.graph.getSelectedCells();
      console.log(cell)
      this.graph.removeCells(cell)
      this.type = 'grid';
      this.$Message.success("节点已删除")
    },
    delete(cellId) {
      if (this.graph.getSelectedCells().length > 0) {
        this.deleteNode();
        return;
      } else {
        const cell = this.graph.getCellById(cellId)
        console.log(cell);
        this.graph.removeCell(cell);
      }
      this.$Message.success("节点已删除")
      this.type = 'grid'
    },
    // 保存png
    saveToPNG() {

      //  localStorage.setItem("darw_data", );

      const data = JSON.stringify(this.graph.toJSON());
      //console.log(this.graph.toJSON())
      const fileMd5 = utils.getMd5(data);

      this.grapData = this.graph.toJSON();
      if ((this.fileMd5 === fileMd5 && this.updateMd5 === this.fileId) || this.isEditor) {
        this.insertFile();
      } else {
        this.onLoadData();
        this.modal1Visible = true;
      }

      /* this.$nextTick(() => {
         this.graph.toPNG((dataUri) => {
           // 下载
           DataUri.downloadDataUri(dataUri, '资产拓扑图.png')
         }, {
           backgroundColor: 'white',
           padding: {
             top: 50,
             right: 50,
             bottom: 50,
             left: 50
           },
           quality: 1,
           copyStyles: false
         })
       })*/
    },
    // 改变边形状
    changeEdgeType(e) {
      if (e === 'normal') {
        this.connectEdgeType = {
          connector: 'normal',
          router: {name: ''}
        }
        this.currentArrow = 1
      } else if (e === 'smooth') {
        this.connectEdgeType = {
          connector: 'smooth',
          router: {name: ''}
        }
        this.currentArrow = 2
      } else {
        this.connectEdgeType = {
          connector: 'normal',
          router: {name: 'manhattan'}
        }
        this.currentArrow = 3
      }
    },
  },
  mounted() {
    registerNode(Graph, this);
    const path = this.$route.path;
    const pathArr = path.split("/draw/");
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
      this.initDraw = false;
      this.init();
      this.watchWidth();
    } else if (pathArr.length > 1 && pathArr[1].length === 32) {
      this.fileId = pathArr[1];
      this.getFileInfo(pathArr[1]);
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
  beforeCreate() {
    document.querySelector('body').setAttribute('style', 'overflow: hidden;')
  },
  beforeDestroy() {
    this.graph.dispose();
  }
}
</script>

<style lang="less">
@import '../../assets/iconfont.css';

.right_drawer {
  position: absolute;
  top: 60px;
  right: 0;
  bottom: 0;
  width: 25%;
  overflow: auto;
  background: #fff;
  z-index: 100000;
}

#headPanel {
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

.container {
  position: fixed !important;
  bottom: 0;
  background: #fff;
  left: 240px;
  right: 300px;
  top: 60px;
  padding: 5px;
}

.x6-widget-stencil {
  position: absolute;
  width: 200px;
  top: 60px;
  right: 0;
  bottom: 0;
  left: 0;
}

.main {
  left: 0;
  top: 0;
}

.x6-widget-stencil {
  position: absolute;
  top: 60px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
}

.x6-graph-scroller {
  position: relative;
  left: 208px;
  top: 60px;
  right: 300px;
  box-sizing: border-box;
  overflow: scroll;
  outline: none;
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

  .currentArrow {
    background: #2d8cf0;
    color: #fff;
  }
}
</style>
