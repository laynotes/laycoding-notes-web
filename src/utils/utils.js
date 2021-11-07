import copyText from "../plugins/clipboard";
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'
import md5 from 'js-md5';
/*import {
  fixCodeWhiteSpace,
} from "@/assets/scripts/util";
import {solveWeChatImage, solveHtml} from "@/assets/scripts/converter";
*/

const utils = {};

utils.copyWeChat = (vue,html) => {
  vue.$emit("startCopy");
  setTimeout(() => {
    let clipboardDiv = document.getElementById("output");
    solveWeChatImage();
  //  fixCodeWhiteSpace();
    solveHtml();
    clipboardDiv.focus();
    window.getSelection().removeAllRanges();
    let range = document.createRange();

    range.setStartBefore(clipboardDiv.firstChild);
    range.setEndAfter(clipboardDiv.lastChild);
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    fixCodeWhiteSpace("normal");

    clipboardDiv.innerHTML = html;


    //  console.log(this.output);
    // 输出提示
    vue.$notify({
      showClose: true,
      message: "已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴",
      offset: 80,
      duration: 1600,
      type: "success",
    });
    //  vm.$emit("refresh");
    //  vm.$emit("endCopy");
  }, 350);
}

utils.getPdf = function (id, title = "未命名") {
  let dom = document.querySelector(`#${id}`);
  html2Canvas(dom, {
    // allowTaint: true
    useCORS: true,
    height: dom.scrollHeight,
    windowHeight: dom.scrollHeight,
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

utils.copy = function (text, e, vue) {
  copyText(text, e, vue)
}
utils.downloadMD = function (doc, title = "content") {

  let downLink = document.createElement("a");
  downLink.download = title + ".md";
  downLink.style.display = "none";
  let blob = new Blob([doc]);

  downLink.href = URL.createObjectURL(blob);
  document.body.appendChild(downLink);
  downLink.click();
  document.body.removeChild(downLink);
}

/**
 * 生成列表字符串
 * @param {*} data 对应内容集合
 * @param {*} rows 行
 * @param {*} cols 列
 */
utils.createTable = function ({data, rows, cols}) {
  let table = "";
  let currRow = [];
  for (let i = 0; i < rows + 2; ++i) {
    table += "|\t";
    currRow = [];
    for (let j = 0; j < cols; ++j) {
      const rowIdx = i > 1 ? i - 1 : i;
      i === 1
        ? currRow.push("---\t")
        : currRow.push(data[`k_${rowIdx}_${j}`] || "");
    }
    table += currRow.join("\t|\t");
    table += "\t|\n";
  }

  return table;
}

utils.toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",").pop());
    reader.onerror = (error) => reject(error);
  });

export function checkImage(file) {
  // check filename suffix
  const isValidSuffix = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name);
  if (!isValidSuffix) {
    return {
      ok: false,
      msg: "请上传 JPG/PNG/GIF 格式的图片",
    };
  }

  // check file size
  const maxSize = 5;
  const isLt5M = file.size / 1024 / 1024 <= maxSize;
  if (!isLt5M) {
    return {
      ok: false,
      msg: `由于公众号限制，图片大小不能超过 ${maxSize}M`,
    };
  }
  return {ok: true};
}


utils.getMd5 = function (content) {
  return md5(content);
}
export default utils;
