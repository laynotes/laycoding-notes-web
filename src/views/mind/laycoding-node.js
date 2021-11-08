
export default G6 => {
    G6.registerNode("lay-node-root", {
        draw(cfg, group) {
            //  const isNodeStyle = cfg.nodeType === 'node';
            const style = this.getShapeStyle(cfg, group); // node 样式
            const id = cfg.id;
            let config_style = {};
            config_style.fontSize = 14;
            config_style.x = style.x;
            config_style.y = style.y;
            const textStyle = {...style}; // 文本节点样式
            const childNum = cfg.children ? cfg.children.length : 0;
            //cfg.label = childNum > 0 ? cfg.label + "(" + childNum + ")" : cfg.label;
            if (cfg.label.indexOf("(") > -1) {
                cfg.label = cfg.label.split('(')[0];
            }
            let size = G6.Util.getTextSize(cfg.label, 14);
            config_style.fontWeight = '';
            if (id.indexOf("-") === -1) {
                size = G6.Util.getTextSize(cfg.label, 16);
                config_style.fontSize = 16;
                config_style.width = 40;
                config_style.height = 40;
                config_style.fontWeight = 'bold';
            } else {
                config_style.width = 36;
                config_style.height = 36;
                config_style.fontWeight = '';
                config_style.y = config_style.y + 2;
            }
            const attrs = style;
            const leve = id.split("-").length;
            if (leve > 2) {
                return group.addShape('text', {
                    attrs: {
                        fontSize: config_style.fontSize,
                        fontWeight: config_style.fontWeight,
                        fill: '#000000',
                        text: cfg.label,
                        x: config_style.x,
                        y: config_style.y + 25
                    },
                    name: 'node-label',
                });
            }
            const shape = group.addShape('image', {
                attrs: {
                    x: config_style.x,
                    y: config_style.y,
                    width: config_style.width,
                    height: config_style.height,
                    img: 'https://g.alicdn.com/cm-design/arms-trace/1.0.155/styles/armsTrace/images/TAIR.png',
                },
                name: 'image-shape',

            });
            group.addShape('text', {
                attrs: {
                    fontSize: config_style.fontSize,
                    fontWeight: config_style.fontWeight,
                    fill: '#000000',
                    text: cfg.label,
                    x: config_style.x - (size[0] / 2 - (config_style.width / 2)),
                    y: attrs.height + config_style.height / 2,
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

            const childNum = cfg.children ? cfg.children.length : 0;
            if (cfg.collapsed && cfg.label.indexOf("(") === -1) {
                cfg.label = cfg.label + "(" + childNum + ")";
            }
            if (nodeLabel) {
                nodeLabel.attr({
                    text: cfg.label,
                });
            }

        },
    }, 'rect')
};
