import '@antv/x6-vue-shape';
import {Graph, Shape, Addon, FunctionExt} from '@antv/x6';
// 拖拽生成四边形或者圆形
import G6 from '@antv/g6';


const {
  Util
} = G6;

export const getFontSize = (text, size) => {
  return Util.getTextSize(text, size);
}

export const startDragLineToGraph = (graph, src, type, e) => {
  let node = null;
  console.log(src)
  switch (type) {
    case "People":
      node = graph.createNode({
        x: 40,
        y: 40,
        width: 60,
        height: 100,
        shape: 'html',
        attrs: {
          label: {
            text: ""
          },
          fontSize: 16
        },
        ports: ports,
        html() {
          const wrap = document.createElement('img')
          wrap.src = src;
          wrap.style.width = "100%";
          wrap.style.height = "100%"
          return wrap
        },
      });
      break;
    case "Text":
      node = graph.createNode({
        width: 60,
        height: 30,
        shape: 'html',
        attrs: {
          label: {
            text: "文本"
          },
          fontSize: 16
        },
        html() {
          const wrap = document.createElement('div');
          wrap.style.width = "100%";
          wrap.style.height = "100%"
          wrap.style.textAlign = "center";
          return wrap
        },
      });
      break;
    case "Line":
      node = graph.createNode({
        width: 400,
        height: 20,
        shape: 'html',
        attrs: {
          label: {
            text: ""
          },
          fontSize: 16
        },
        html: 'my-html',
      });
      break;
    default:
      node = graph.createNode({
        x: 40,
        y: 40,
        width: 200,
        height: 200,
        shape: 'html',
        attrs: {
          label: {
            text: ""
          },
          fontSize: 16
        },
        html: "line-html",
      });
      break;
  }

  const dnd = new Addon.Dnd({target: graph})
  dnd.start(node, e)
}

export const startDragToGraph = (graph, type, e) => {
  let node = null;
  switch (type) {
    case "Rect":
      node = graph.createNode({
        width: 100,
        height: 60,
        attrs: {
          label: {
            text: '正方形节点',
            fill: '#000000',
            fontSize: 14,
            textWrap: {
              width: -10,
              height: -10,
              ellipsis: true,
            },
          },
          body: {
            stroke: '#000000',
            strokeWidth: 1,
            fill: '#ffffff',
          }
        },
        ports: ports
      });
      break;
    case "Circle":
      node = graph.createNode({
        shape: 'ellipse',
        width: 100,
        height: 100,
        attrs: {
          label: {
            text: '圆形节点',
            fill: '#000000',
            fontSize: 14,
            textWrap: {
              width: -20,
              height: -10,
              ellipsis: true,
            },
          },
          body: {
            stroke: '#000000',
            strokeWidth: 1,
            fill: '#ffffff',
          }
        },
        ports: ports
      });
      break;
    case "Text":
      node = graph.createNode({
        width: 60,
        height: 30,
        shape: 'html',
        attrs: {},
        ports: ports,
        html() {
          const wrap = document.createElement('div');
          wrap.style.width = "100%";
          wrap.style.height = "100%"
          return wrap
        },
      });
      break;
    default:
      node = graph.createNode({
        shape: 'polygon',
        x: 40,
        y: 40,
        width: 120,
        height: 120,
        attrs: {
          label: {
            text: '条件节点',
            fill: '#000000',
            fontSize: 14,
            textWrap: {
              width: -50,
              height: '70%',
              ellipsis: true,
            },
          },
          body: {
            fill: '#ffffff',
            stroke: '#000000',
            refPoints: '0,10 10,0 20,10 10,20',
            strokeWidth: 1,
          },
        },
        ports: ports,
        zIndex:0
      });
      break;
  }

  const dnd = new Addon.Dnd({target: graph})
  dnd.start(node, e)
}
const ports = {
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
};

export const regiterNode = () => {
  Graph.registerNode(
    'custom-rect',
    {
      inherit: 'rect',
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          color: '#262626',
        },
      },
      ports: this.ports
    },
    true,
  )

  Graph.registerNode(
    'custom-polygon',
    {
      inherit: 'polygon',
      width: 66,
      height: 36,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          color: '#262626',
        },
      },
      ports: this.ports
    },
    true,
  )

  Graph.registerNode(
    'custom-circle',
    {
      inherit: 'circle',
      width: 45,
      height: 45,
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#EFF4FF',
        },
        text: {
          fontSize: 12,
          color: '#262626',
        },
      },
      ports: this.ports
    },
    true,
  )

  Graph.registerNode(
    'custom-image',
    {
      inherit: 'rect',
      width: 52,
      height: 52,
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'image',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
      ],
      attrs: {
        body: {
          strokeWidth: 1,
          stroke: '#26C160',
          fill: '#26C160',
        },
        image: {
          width: 26,
          height: 26,
          refX: 13,
          refY: 16,
        },
        label: {
          refX: 3,
          refY: 2,
          textAnchor: 'left',
          textVerticalAnchor: 'top',
          fontSize: 12,
          fill: '#fff',
        },
      },
      ports: this.ports
    },
    true,
  )
}
