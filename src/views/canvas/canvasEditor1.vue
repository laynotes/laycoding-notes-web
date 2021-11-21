<template>
  <div class="main" id="components-layout-demo-basic">
    <a-layout style="height: 100%">
      <a-layout-header>Header</a-layout-header>
      <a-layout>
        <a-layout-sider>
          <div class="title">基础图形</div>
          <div class="controlPanel">
            <div
              :class="[initIdx == idx ? 'contro-item active' : 'contro-item']"
              v-for="(item,idx) in toolsArr" :key="idx"
              @click="handleTools(item, idx)">
              <i :class="'iconfont' + item.icon"></i>
            </div>
          </div>
        </a-layout-sider>
        <a-layout-content>
          <div class="canvas">
            <canvas id="canvas" ref="canvas"></canvas>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>
<script>
import {fabric} from 'fabric'

export default {
  data() {
    return {
      currentTool: '',
      done: false,
      fabricObj: null,
      initIdx: 0,
      toolsArr: [
        {
          name: 'pencil',
          icon: ' icon-bi'
        },
        {
          name: 'line',
          icon: ' icon-jiantou11'
        },
        {
          name: 'arrow',
          icon: ' icon-jiantou10'
        },
        {
          name: 'dashedline',
          icon: ' icon-xiaoxuxian'
        },
        {
          name: 'text',
          icon: ' icon-ziti'
        },
        {
          name: 'rectangle',
          icon: ' icon-xingzhuang-juxing'
        },
        {
          name: 'circle',
          icon: ' icon-yuanxing'
        },
        {
          name: 'ellipse',
          icon: ' icon-xingzhuang-tuoyuanxing'
        },
        {
          name: 'equilateral', //三角形
          icon: ' icon-xingzhuang-sanjiaoxing'
        },
        {
          name: 'remove',
          icon: ' icon-xiangpica'
        },
        {
          name: 'undo',
          icon: ' icon-zhongzuo2'
        },
        {
          name: 'redo',
          icon: ' icon-zhongzuo1'
        },
        {
          name: 'reset',
          icon: ' icon-shanchu'
        },
      ],
      mouseFrom: {},
      mouseTo: {},
      moveCount: 1,
      doDrawing: false,
      fabricHistoryJson: [],
      mods: 0,
      drawingObject: null, //绘制对象
      drawColor: '#E34F51',
      drawWidth: 2,
      imageBase64: '',
      zoom: window.zoom ? window.zoom : 1,
      afterDrawingObject: null
    }
  },
  mounted() {
    //初始化canvas
    this.initCanvas()
  },
  computed: {
    canvasWidth() {
      return document.getElementsByClassName("ant-layout-content")[0].clientWidth - 20;
    },
    canvasHeight() {
      return document.getElementsByClassName("ant-layout-content")[0].clientHeight - 20;
    }
  },
  methods: {
    initCanvas() {
      this.fabricObj = new fabric.Canvas('canvas', {
        isDrawingMode: true,
        selectable: false,
        selection: false,
        devicePixelRatio: true, //Retina 高清屏 屏幕支持
      })
      this.fabricObj.freeDrawingBrush.color = '#E34F51'
      this.fabricObj.freeDrawingBrush.width = 2
      this.fabricObj.setWidth(this.canvasWidth)
      this.fabricObj.setHeight(this.canvasHeight)
      /*   this.fabricObj.add(
           new fabric.Rect({top: 100, left: 100, width: 50, height: 50, fill: '#f55'}),
           new fabric.Circle({top: 140, left: 230, radius: 75, fill: 'green'}),
           new fabric.Triangle({top: 300, left: 210, width: 100, height: 100, fill: 'blue'}),
         )*/
      //绑定画板事件
      this.fabricObjAddEvent()
    },
    //时间监听
    fabricObjAddEvent() {
      this.fabricObj.on({
        'mouse:down': (o) => {

          this.mouseFrom.x = o.pointer.x;
          this.mouseFrom.y = o.pointer.y;
          this.doDrawing = true;
          console.log("开始:" + JSON.stringify(this.mouseFrom))
          if (this.currentTool == 'text') {
            this.drawText()
          }
        },
        'mouse:up': (o) => {
          this.mouseTo.x = o.pointer.x;
          this.mouseTo.y = o.pointer.y;
          this.drawingObject = null;
          this.moveCount = 1;
          this.doDrawing = false;
          this.afterDrawingObject = o;

          const diffX = Math.abs(this.mouseTo.x - this.mouseFrom.x);
          const diffY = Math.abs(this.mouseTo.y - this.mouseFrom.y);
          if (diffX < 20 && diffY < 20 && this.currentTool !== "text") {
            const arr = this.fabricObj.getObjects();
            this.fabricObj.remove(arr[arr.length - 1]);
          }
          this.updateModifications(true);
        },
        'mouse:move': (o) => {
          if (this.moveCount % 2 && !this.doDrawing) {
            //减少绘制频率
            return
          }
          this.moveCount++;
          this.mouseTo.x = o.pointer.x;
          this.mouseTo.y = o.pointer.y;
          this.drawing();
        },
        //对象移动时间
        'object:moving': (e) => {
          e.target.opacity = 0.5;
        },
        //增加对象
        'object:added': () => {
          // debugger
        },
        'object:modified': (e) => {
          e.target.opacity = 1;
          // let object = e.target;
          this.updateModifications(true)
        },
        'selection:created': (e) => {


          e.target.set('selectable', true);

         /* if (e.target._objects) {
            //多选删除
            var etCount = e.target._objects.length;
            for (var etindex = 0; etindex < etCount; etindex++) {
              this.fabricObj.remove(e.target._objects[etindex]);
            }
          } else {
            //单选删除
            this.fabricObj.remove(e.target);
          }*/
        //  this.fabricObj.discardActiveObject(); //清楚选中框
          this.updateModifications(true)
        },

      });
    },
    //储存历史记录
    updateModifications(savehistory) {
      if (savehistory == true) {
        this.fabricHistoryJson.push(JSON.stringify(this.fabricObj))
      }
    },
    //canvas 历史后退
    undo() {
      let state = this.fabricHistoryJson
      if (this.mods < state.length) {
        this.fabricObj.clear().renderAll();
        this.fabricObj.loadFromJSON(state[state.length - 1 - this.mods - 1]);
        this.fabricObj.renderAll();
        this.mods += 1;
      }
    },
    //前进
    redo() {
      let state = this.fabricHistoryJson
      if (this.mods > 0) {
        this.fabricObj.clear().renderAll();
        this.fabricObj.loadFromJSON(state[state.length - 1 - this.mods + 1]);
        this.fabricObj.renderAll();
        this.mods -= 1;
      }
    },
    transformMouse(mouseX, mouseY) {
      return {x: mouseX / this.zoom, y: mouseY / this.zoom};
    },
    resetObj() {
      this.fabricObj.selectable = false
      this.fabricObj.selection = false
      this.fabricObj.skipTargetFind = true
      //清除文字对象
      if (this.textboxObj) {
        this.textboxObj.exitEditing();
        this.textboxObj = null;
      }
    },
    handleTools(tools, idx) {
      this.initIdx = idx;
      this.currentTool = tools.name;
      this.fabricObj.isDrawingMode = false;
      this.resetObj()

      switch (tools.name) {
        case 'pencil':
          this.fabricObj.isDrawingMode = true;
          break;
        case 'remove':
          this.fabricObj.selection = true
          this.fabricObj.skipTargetFind = false
          this.fabricObj.selectable = true
          break;
        case 'reset':
          this.fabricObj.clear();
          break;
        case 'redo':
          this.redo();
          break;
        case 'undo':
          this.undo();
          break;
        default:
          break;
      }
    },
    //绘制文字对象
    drawText() {
      this.textboxObj = new fabric.Textbox(" ", {
        left: this.mouseFrom.x,
        top: this.mouseFrom.y,
        width: 220,
        fontSize: 18,
        fill: this.drawColor,
        hasControls: true,
      });
      this.fabricObj.add(this.textboxObj);
      this.textboxObj.enterEditing();
      this.textboxObj.hiddenTextarea.focus();
      this.updateModifications(true)
    },
    drawing() {
      if (this.drawingObject) {
        this.fabricObj.remove(this.drawingObject)
      }
      let fabricObject = null;


      switch (this.currentTool) {
        case 'pencil':
          this.fabricObj.isDrawingMode = true
          break;
        case 'line':
          fabricObject = new fabric.Line([this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y], {
            stroke: this.drawColor,
            strokeWidth: this.drawWidth,
            x2: this.mouseTo.x,
            y2: this.mouseTo.y
          })
          break;
        case 'arrow':
          fabricObject = new fabric.Path(this.drawArrow(this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y, 15.5, 15.5), {
            stroke: this.drawColor,
            fill: "rgba(255,255,255,0)",
            strokeWidth: this.drawWidth,
            x2: this.mouseTo.x,
            y2: this.mouseTo.y
          });
          break;
        case 'dashedline':
          // doshed line
          fabricObject = this.drawDoshedLine()
          break;
        case 'rectangle':
          // 矩形
          fabricObject = this.drawRectangle()
          break;
        case "circle": //正圆
          fabricObject = this.drawCircle()
          break;
        case "ellipse":
          // 椭圆
          fabricObject = this.drawEllipse()
          break;
        case "equilateral": //等边三角形
          fabricObject = this.drawTriangle()
          break;
        case 'remove':
          break;
        default:
          // statements_def'
          break;
      }

      if (fabricObject) {
        this.$nextTick(() => {
          this.fabricObj.add(fabricObject)
          this.drawingObject = fabricObject
        })
      }
    },
    // dashed line
    drawDoshedLine() {
      return new fabric.Line([this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y], {
        strokeDashArray: [10, 3],
        stroke: this.drawColor,
        strokeWidth: this.drawWidth,
        x2: this.mouseTo.x,
        y2: this.mouseTo.y
      })
    },
    // circle
    drawCircle() {
      let radius = Math.sqrt((this.mouseTo.x - this.mouseFrom.x) * (this.mouseTo.x - this.mouseFrom.x) + (this.mouseTo.y - this.mouseFrom.y) * (this.mouseTo.y - this.mouseFrom.y)) / 2;
      return new fabric.Circle({
        left: this.mouseFrom.x,
        top: this.mouseFrom.y,
        stroke: this.drawColor,
        fill: "rgba(255, 255, 255, 0)",
        radius: radius,
        strokeWidth: this.drawWidth,
        x2: this.mouseTo.x,
        y2: this.mouseTo.y
      });
    },
    // triangle
    drawTriangle() {
      let height = this.mouseTo.y - this.mouseFrom.y
      return new fabric.Triangle({
        top: this.mouseFrom.y,
        left: this.mouseFrom.x,
        width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
        height: height,
        stroke: this.drawColor,
        strokeWidth: this.drawWidth,
        fill: "rgba(255,255,255,0)",
        x2: this.mouseTo.x,
        y2: this.mouseTo.y
      });
    },
    // ellipse
    drawEllipse() {
      let left = this.mouseFrom.x
      let top = this.mouseFrom.y
      // let ellipse = Math.sqrt((this.mouseTo.x - left) * (this.mouseTo.x - left) + (this.mouseTo.y - top) * (this.mouseTo.y - top)) / 2;
      return new fabric.Ellipse({
        left: left,
        top: top,
        stroke: this.drawColor,
        fill: "rgba(255, 255, 255, 0)",
        originX: "center",
        originY: "center",
        rx: Math.abs(left - this.mouseTo.x),
        ry: Math.abs(top - this.mouseTo.y),
        strokeWidth: this.drawWidth,
        x2: this.mouseTo.x,
        y2: this.mouseTo.y
      });
    },
    // rectangle
    drawRectangle() {
      return new fabric.Rect({
        left: this.mouseFrom.x,
        top: this.mouseFrom.y,
        width: this.mouseTo.x - this.mouseFrom.x,
        height: this.mouseTo.y - this.mouseFrom.y,
        fill: "rgba(255, 255, 255, 0)",
        stroke: this.drawColor,
        strokeWidth: this.drawWidth,
        x2: this.mouseTo.x,
        y2: this.mouseTo.y
      });
    },
    //书写箭头的方法
    drawArrow(fromX, fromY, toX, toY, theta, headlen) {
      theta = typeof theta != "undefined" ? theta : 30;
      headlen = typeof theta != "undefined" ? headlen : 10;
      // 计算各角度和对应的P2,P3坐标
      let angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
        angle1 = (angle + theta) * Math.PI / 180,
        angle2 = (angle - theta) * Math.PI / 180,
        topX = headlen * Math.cos(angle1),
        topY = headlen * Math.sin(angle1),
        botX = headlen * Math.cos(angle2),
        botY = headlen * Math.sin(angle2);
      let arrowX = fromX - topX,
        arrowY = fromY - topY;
      let path = " M " + fromX + " " + fromY;
      path += " L " + toX + " " + toY;
      arrowX = toX + topX;
      arrowY = toY + topY;
      path += " M " + arrowX + " " + arrowY;
      path += " L " + toX + " " + toY;
      arrowX = toX + botX;
      arrowY = toY + botY;
      path += " L " + arrowX + " " + arrowY;
      return path;
    },
    downLoadImage() {
      this.done = true
      //生成双倍像素比的图片
      let base64URl = this.fabricObj.toDataURL({
        formart: 'png',
        multiplier: 2
      })
      this.imageBase64 = base64URl
      this.done = false
    },
  },
}
</script>

<style scoped>
#components-layout-demo-basic {
  text-align: center;
  height: 100%;
  width: 100%;
}

#components-layout-demo-basic .ant-layout-header,
#components-layout-demo-basic .ant-layout-footer {
  background: #7dbcea;

}

#components-layout-demo-basic .ant-layout-footer {
  line-height: 1.5;
}

#components-layout-demo-basic .ant-layout-sider {
  background: #F3F3F3;
  height: 100%;
}

#components-layout-demo-basic .ant-layout-content {
  padding: 10px;
  border-radius: 10px;
  min-height: 100%;
  height: 100%;
  background: #fff;
}

#components-layout-demo-basic > .ant-layout:last-child {
  margin: 0;
}

.controlPanel {
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding: 10px;
}

.contro-item {
  margin: 2px;
  width: 40px;
  padding: 2px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  cursor: pointer;
  background: #fefefe;
}

.canvas {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: url('../../assets/bg.jpg') repeat;
}

.contro-item i {
  margin: 0 auto;
  font-size: 32px;
  line-height: 32px;
}

.active {
  background: #7dbcea;
  border-radius: 2px;
}

.active i {
  font-size: 36px;
  color: #fff;
}
</style>
