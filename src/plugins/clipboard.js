import Vue from 'vue'
import Clipboard from 'clipboard'

// 文本复制
function copySuccess(vue) {
    vue.$message.success(
        '复制成功~',
        3,
    );
}

function copyFail(vue) {
    vue.$message.error("复制失败,浏览器不支持~")
}

export default function copyText(text, e, vue) {
    const clipboard = new Clipboard(e.target, {
        text: () => text
    })
    clipboard.on('success', () => {
        copySuccess(vue);
        // 释放内存
        clipboard.destroy()
    })
    clipboard.on('error', () => {
        // 不支持复制
        copyFail()
        // 释放内存
        clipboard.destroy()
    })
    // 解决第一次点击不生效的问题，如果没有，第一次点击会不生效
    clipboard.onClick(e)
}



