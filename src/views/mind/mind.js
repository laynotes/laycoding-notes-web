import '@antv/x6-vue-shape';
import {Graph, Shape, Addon, FunctionExt} from '@antv/x6';

const MsgUtil = null;
const addTreeNode = (currentTarget, item, nodeWidth, type) => {

    const direction = item.get('model').direction;
    const colorArr = [
        '#5B8FF9',
        '#5AD8A6',
        '#5D7092',
        '#F6BD16',
        '#6F5EF9',
        '#6DC8EC',
        '#D3EEF9',
        '#DECFEA',
        '#FFE0C7',
        '#1E9493',
        '#BBDEDE',
        '#FF99C3',
        '#FFE0ED',
        '#CDDDFD',
        '#CDF3E4',
        '#CED4DE',
        '#FCEBB9',
        '#D3CEFD',
        '#945FB9',
        '#FF9845',
    ];

    if (type === 0) {
        const id = item.get("model").id;
        item = item.get('parent');
        const model = item.get('model');
        const newId = getUuid();
        const config = {
            id: newId,
            direction: direction,
            label: '子主题',
            type:"dice-mind-map-sub",
            color: model.color || colorArr[Math.floor(Math.random() * colorArr.length)],
            style: {
                "background": "red"
            },
            nodeWidth:nodeWidth
        };
        let arr = model.children;
        const child = [];
        // eslint-disable-next-line no-empty
        for (let i = 0; i < arr.length; i++) {
            if (id === arr[i].id) {
                child.push(arr[i]);
                child.push(config);
            } else {
                child.push(arr[i]);
            }
        }
        currentTarget.updateItem(item, {
            children: child,
        });
    } else {
        const model = item.get('model');
        const newId = getUuid();
        currentTarget.updateItem(item, {
            children: (model.children || []).concat([{
                id: newId,
                direction: newId.charCodeAt(newId.length - 1) % 2 === 0 ? 'right' : 'left',
                label: '子主题',
                type:"dice-mind-map-leaf",
                nodeWidth:nodeWidth,
                color: colorArr[Math.floor(Math.random() * colorArr.length)],
            },]),
        });
    }
    currentTarget.layout(false);
}
const deleteTreeNode = (currentTarget, item) => {
    const parent = item.get('parent');
    const model = item.get('model');
    console.log("modelId:", model.id)
    currentTarget.updateItem(parent, {
        children: (parent.get('model').children || []).filter((e) => e.id !== model.id),
    });
    currentTarget.layout(false);
}
const collapseExpand = (evt) => {
    const model = evt.item.get('model');
    const attrItem = evt.target;
    model.collapsed = model.collapsed !== true;
    attrItem.attr({
        text: model.collapsed === true ? model.children.length : '-'
    })
    evt.currentTarget.updateItem(evt.item, model);
    evt.currentTarget.layout(false);

}

const getUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

}
export const MindUtil = {addTreeNode, deleteTreeNode, collapseExpand};
