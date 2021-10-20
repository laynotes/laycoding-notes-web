// 下面两个package要单独安装
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
    install (Vue, options) {
        Vue.prototype.getPdf = function (id, title) {
            const dom = document.querySelector(`#${id}`);
            html2Canvas(dom, {
                // allowTaint: true
                useCORS: true,
                height:dom.scrollHeight,
                windowHeight:dom.scrollHeight,
                background: "#ffffff", // 一定要添加背景颜色，否则出来的图片，背景全部都是透明的
                dpi: 450, // 处理模糊问题，越高越清晰，文件越大
            }).then(function (canvas) {
                    let contentWidth = canvas.width
                    let contentHeight = canvas.height
                    let pageHeight = contentWidth / 592.28 * 841.89
                    let leftHeight = contentHeight

                    let position = 0
                    let imgWidth = 595.28
                    let imgHeight = 592.28 / contentWidth * contentHeight
                    let pageData = canvas.toDataURL('image/jpeg', 1.0)

                    let PDF = new JsPDF('', 'pt', 'a4')
                    if (leftHeight < pageHeight) {
                        PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
                    } else {
                        while (leftHeight > 0) {
                            PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
                            leftHeight -= pageHeight
                            position -= 841.89
                            if (leftHeight > 0) {
                                PDF.addPage()
                            }
                        }
                    }
                    PDF.save(title + '.pdf')
                }
            )
        }
    }
}
