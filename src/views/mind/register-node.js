import {attr} from "@antv/x6/es/util/dom/attr";

export default G6 => {
    G6.registerNode('tree-node', {
        draw(cfg, group) {
            const id = cfg.id;
            let isNodeStyle = false;
            if (id.indexOf("-") === -1 || id.split("-").length < 3) {
                isNodeStyle = true;
            } else {
                isNodeStyle = cfg.nodeType === 'node';
            }
            const style = this.getShapeStyle(cfg, group); // node 样式
            const textStyle = {...style}; // 文本节点样式
            const size = G6.Util.getTextSize(cfg.label, 14);

            if (!isNodeStyle) {
                delete textStyle.fill;
                delete textStyle.stroke;
                textStyle.width = size[0] + 12;
            }
            const attrs = isNodeStyle ? style : textStyle;

            const wd = G6.Util.getTextSize(cfg.label, 14)[0] + 18;
            attrs.width = wd
            const shape = group.addShape('rect', {
                attrs,
                name: 'rect-node',
            });

            group.addShape('text', {
                attrs: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    fill: isNodeStyle ? '#fff' : '#000000',
                    text: cfg.label,
                    x: attrs.x + 9,
                    y: 6,
                },
                name: 'node-label',
            });

            if (cfg.children && cfg.children.length > 0) {
                // const circleX = !isNodeStyle && style.width > size[0] ? (-style.width / 2 + size[0] + 22) : (attrs.width / 2 + 11);
                const circleX = cfg.direction === "right" ? attrs.width / 2 + 10 : -(attrs.width / 2 + 22);
                group.addShape('circle', {
                    attrs: {
                        r: 7,
                        fill: '#fff',
                        stroke: '#ccc',
                        x: circleX,
                    },
                    name: 'node-icon',
                });
                const iconX = cfg.direction === "right" ? attrs.width / 2 + 5 : -(attrs.width - 10);
                group.addShape('text', {
                    attrs: {
                        text: '-',
                        fontSize: 16,
                        fill: '#ccc',
                        cursor: 'pointer',
                        x: iconX,
                        y: (attrs.height - size[1]) / 2,
                    },
                    name: 'node-icon-text',
                });

            }

            return shape;
        },
        update(cfg, node) {
            const group = node.getContainer();
            const rect = group.getFirst();
            //  console.log(rect);
            const children = group.get('children');
            const nodeLabel = children.find(child => child.cfg.name === 'node-label');
            const icon = children.find(child => child.cfg.name === 'node-icon-text');
            const nodeICon = children.find(child => child.cfg.name === 'node-icon-text');
            const attrs = cfg.style;
            if (nodeLabel) {
                nodeLabel.attr({
                    text: cfg.label,
                });
            }
            const num = sessionStorage.getItem(node.get("model").id + "_coll");
            const circleX = cfg.direction === "right" ? attrs.width / 2 + 10 : -(attrs.width / 2 + 22);
            const iconX = cfg.direction === "right" ? attrs.width / 2 + 5 : -(attrs.width - 10);
            if (icon) {
                icon.attr({
                    text: cfg.collapsed ? num : '-',
                    fontSize: 10,

                });
            }

        },
    }, 'rect');

    G6.registerNode("lay-node-root1", {
        draw(cfg, group) {
            const isNodeStyle = cfg.nodeType === 'node';
            const style = this.getShapeStyle(cfg, group); // node 样式


            const textStyle = {...style}; // 文本节点样式
            const size = G6.Util.getTextSize(cfg.label, 14);
            //     style.width =  G6.Util.getTextSize(cfg.label, 14)[0] + 12;
            if (!isNodeStyle) {
                delete textStyle.fill;
                delete textStyle.stroke;
                textStyle.width = size[0] + 12;
            }
            const attrs = isNodeStyle ? style : textStyle;

            attrs.width = size[0] + 18;
            const shape = group.addShape('rect', {
                attrs,
                name: 'rect-node',
            });
            //   console.log(size)
            group.addShape('text', {
                attrs: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    fill: isNodeStyle ? '#000000' : '#000000',
                    text: cfg.label,
                    x: attrs.x + 9,
                    y: (attrs.height - size[1]) / 2,
                },
                name: 'node-label',
            });


            return shape;
        },
        update(cfg, node) {
            const group = node.getContainer();
            const rect = group.getFirst();

            const children = group.get('children');
            const nodeLabel = children.find(child => child.cfg.name === 'node-label');
            const icon = children.find(child => child.cfg.name === 'node-icon-text');
            const nodeICon = children.find(child => child.cfg.name === 'node-icon-text');
            if (nodeLabel) {
                nodeLabel.attr({
                    text: cfg.label,
                });
            }

        },
    }, 'rect')


    G6.registerNode("tree-node-left", {
        draw(cfg, group) {
            const isNodeStyle = cfg.nodeType === 'node';
            const style = this.getShapeStyle(cfg, group); // node 样式


            const textStyle = {...style}; // 文本节点样式
            const size = G6.Util.getTextSize(cfg.label, 14);
            //     style.width =  G6.Util.getTextSize(cfg.label, 14)[0] + 12;
            if (!isNodeStyle) {
                delete textStyle.fill;
                delete textStyle.stroke;
                textStyle.width = size[0] + 12;
            }
            const attrs = isNodeStyle ? style : textStyle;
            // const wd = G6.Util.getTextSize(cfg.label, 14)[0] + 12;
            //   attrs.width = wd > 80 ? wd : 80
            const shape = group.addShape('rect', {
                attrs,
                name: 'rect-node',
            });
            if (cfg.children) {
                const circleX = !isNodeStyle && style.width > size[0] ? (-style.width / 2 + size[0] + 22) : (attrs.width / 2 + 11);

                group.addShape('circle', {
                    attrs: {
                        r: 7,
                        fill: '#fff',
                        stroke: '#ccc',
                        x: -10,
                    },
                    name: 'node-icon',
                });
                const iconX = !isNodeStyle && style.width > size[0] ? (-style.width / 2 + size[0] + 17) : (style.width / 2 + 6);
                group.addShape('text', {
                    attrs: {
                        text: '-',
                        fontSize: 16,
                        fill: '#ccc',
                        cursor: 'pointer',
                        x: iconX,
                        y: 6,
                    },
                    name: 'node-icon-text',
                });
            }
            group.addShape('text', {
                attrs: {
                    fontSize: 14,
                    fill: '#666',
                    text: cfg.label,
                    x: -style.width / 2 + 6,
                    y: style.height / 2 - 8,
                },
                name: 'node-label',
            });

            return shape;
        },
        update(cfg, node) {
            const group = node.getContainer();
            const rect = group.getFirst();

            const children = group.get('children');
            const nodeLabel = children.find(child => child.cfg.name === 'node-label');
            const icon = children.find(child => child.cfg.name === 'node-icon-text');
            const nodeICon = children.find(child => child.cfg.name === 'node-icon-text');
            if (nodeLabel) {
                nodeLabel.attr({
                    text: cfg.label,
                });
            }
            //console.log(group)


            if (icon) {
                console.log(icon.attrs.x)
                icon.attr({
                    text: cfg.collapsed ? '+' : '-',

                });
            }
        },
    }, "rect");
};
