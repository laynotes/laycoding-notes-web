<template>
  <div id="root">
    <div class="container_warp" style="position: relative">
      <div id="container" style=""></div>
      <div id="minimapContainer"></div>
      <Spin size="large" fix v-if="initGrap"></Spin>
    </div>

  </div>
</template>

<script>
import '@antv/x6-vue-shape'

import {Graph, Shape, Addon, FunctionExt, DataUri} from '@antv/x6';
import {startDragToGraph} from "@/views/draw/draw";
import insertCss from "insert-css";
import {startDragLineToGraph} from '@/views/draw/draw';
import service from "@/api/fetch";
import registerNode from "./registerNode";
export default {
  name: "drawView",
  data() {
    return {
      grapData: {},
      initGrap: true,
      imgsrc: require('../../assets/line.png'),
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
      dy: 20
    }
  },
  methods: {
    getFileInfo(fileId) {
      service({
        url: "/file/getFileInfoById?fileId=" + fileId,
        method: 'get'
      }).then(response => {
        this.grapData = response.data.fileContent;
        this.graph.fromJSON(this.grapData);
        this.hidePorts();
        this.graph.scrollToContent()
        this.initGrap = false;
      }).catch(error => {
        this.initGrap = false;
        this.$router.push("/notes/erro")
      });
    },
    startDragLine(type, e) {
      startDragLineToGraph(this.graph, this.imgsrc, type, e);
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
      const cells = this.graph.getSelectedCells().length == 0 ? this.rightNode : this.graph.getSelectedCells();
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
      try {
        Graph.registerHTMLComponent('my-html', (node) => {
          const wrap = document.createElement('img')
          wrap.src = this.imgsrc;
          wrap.style.width = "100%";
          wrap.style.height = "100%"
          return wrap;
        })
      } catch (e) {
        console.log(e);
      }
      const _that = this;
      const graph = new Graph({
        container: document.getElementById('container'),
        grid: _that.grid,
        width: window.innerWidth,
        height: window.innerHeight,
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
                  stroke: '#1890ff',
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
      //     const data = JSON.parse(localStorage.getItem("darw_data"));
      // console.log(data)


      this.graph.fromJSON(this.grapData);
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
        obj.className = "x6-widget-minimap mini-map";
        const objS = document.getElementsByClassName("x6-graph-scroller")[0];
        objS.style.width = "100%";
        objS.style.height = (this.screenHeigth - 64) + "px";

      } catch (e) {
        console.log(e);
      }
    },
    hidePorts() {
      const container = document.getElementById('container')
      const ports = container.querySelectorAll(
        '.x6-port-body'
      )
      this.showPorts(ports, false)
    },
    initLeftPanel() {
      const graph = this.graph;
      try {
        Graph.registerHTMLComponent('my-html', (node) => {
          const wrap = document.createElement('img')
          wrap.src = this.lineSrc;
          wrap.style.width = "100%";
          wrap.style.height = "100%"
          return wrap;
        })
      } catch (e) {
        console.log(e);
      }

      try {

        Graph.registerHTMLComponent('line-html', (node) => {
          const wrap = document.createElement('div')
          wrap.style.border='1px dashed red'
          wrap.style.width = "100%";
          wrap.style.height = "100%"
          return wrap
        })
      }catch (e) {
        console.log(e);
      }
      this.initHeigth();
      this.hidePorts();
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
      this.$nextTick(() => {
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
      })

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
  created() {
    const path = this.$route.path
    const fileId = path.split("/notes/drawView/")[1];
    if (fileId === null || fileId === "") {
      this.$router.push("/notes/error")
    } else {
      this.getFileInfo(fileId);
    }
    registerNode(Graph,this.ports);
  },
  mounted() {
    this.init();
    this.watchWidth();
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

.mini-map {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 0;
}

.right_drawer {
  position: absolute;
  top: 60px;
  right: 0;
  bottom: 0;
  width: 25%;
  overflow: auto;
  background: #fff;
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
  left: 10px;
  top: 10px;

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
