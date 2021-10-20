import marked from "marked";
import hljs from "highlight.js";
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import xml from "highlight.js/lib/languages/xml"

class WxRenderer {
  constructor(opts) {
    this.opts = opts;
    console.log(opts);
    localStorage.setItem("opt_config", JSON.stringify(opts));


    //const fileConfig = JSON.stringify(opts);


    //const cssTheme = "highlight.js/styles/github.css";
    //const cssTheme = opts.cssTheme ? opts.cssTheme : "github";

    //  require(cssTheme);
    //require(`highlight.js/styles/${cssTheme}.css`);


    let ENV_STRETCH_IMAGE = true;

    let footnotes = [];
    let footnoteIndex = 0;
    let styleMapping = null;

    const CODE_FONT_FAMILY =
      "Menlo, Operator Mono, Consolas, Monaco, monospace";

    let merge = (base, extend) => Object.assign({}, base, extend);

    this.buildTheme = (themeTpl) => {
      let mapping = {};
      let base = merge(themeTpl.BASE, {
        "font-family": this.opts.fonts,
        "font-size": this.opts.size,
      });
      let base_block = merge(base, {});
      for (let ele in themeTpl.inline) {
        // eslint-disable-next-line no-prototype-builtins
        if (themeTpl.inline.hasOwnProperty(ele)) {
          let style = themeTpl.inline[ele];
          mapping[ele] = merge(base, style);
        }
      }

      for (let ele in themeTpl.block) {
        // eslint-disable-next-line no-prototype-builtins
        if (themeTpl.block.hasOwnProperty(ele)) {
          let style = themeTpl.block[ele];
          if (ele === "code") {
            style["font-family"] = CODE_FONT_FAMILY;
          }
          mapping[ele] = merge(base_block, style);
        }
      }
      return mapping;
    };

    let getStyles = (tokenName, addition) => {
      let arr = [];
      let dict = styleMapping[tokenName];
      if (!dict) return "";
      for (const key in dict) {
        arr.push(key + ":" + dict[key]);
      }
      return `style="${arr.join(";") + (addition || "")}"`;
    };

    let addFootnote = (title, link) => {
      footnotes.push([++footnoteIndex, title, link]);
      return footnoteIndex;
    };

    this.buildFootnotes = () => {
      let footnoteArray = footnotes.map((x) => {
        if (x[1] === x[2]) {
          return `<code style="font-size: 90%; opacity: 0.6;">[${x[0]}]</code>: <i>${x[1]}</i><br/>`;
        }
        return `<code style="font-size: 90%; opacity: 0.6;">[${x[0]}]</code> ${x[1]}: <i>${x[2]}</i><br/>`;
      });
      return `<h4 ${getStyles("h4")}>引用链接</h4><p ${getStyles(
        "footnotes"
      )}>${footnoteArray.join("\n")}</p>`;
    };

    this.buildAddition = () => {
      return `
            <style>
            .preview-wrapper pre::before {
                position: absolute;
                top: 0;
                right: 0;
                color: #ccc;
                text-align: center;
                font-size: 0.8em;
                padding: 5px 10px 0;
                line-height: 15px;
                height: 15px;
                font-weight: 600;
            }
            </style>
        `;
    };

    this.setOptions = (newOpts) => {
      this.opts = merge(this.opts, newOpts);
    };

    this.hasFootnotes = () => footnotes.length !== 0;

    this.getRenderer = (status) => {

      footnotes = [];
      footnoteIndex = 0;

      hljs.initHighlighting();

      hljs.registerLanguage("javascript", javascript);

      hljs.registerLanguage("java", java);
      hljs.registerLanguage("xml", xml);

      styleMapping = this.buildTheme(this.opts.theme);
      let renderer = new marked.Renderer();
      const mdTitle = [];
      this.getUuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })
      };

      renderer.heading = (text, level) => {
        const uuid = this.getUuid();
        const arr = mdTitle;
        const item = {};
        if (arr.length === 0 || arr[arr.length - 1].level >= level) {
          item.title = text;
          item.id = uuid;
          item.level = level;
          item.children = [];
          item.path = "#" + uuid;
          arr.push(item);
        } else {
          const node = arr[arr.length - 1];
          const list = node.children;
          item.title = text;
          item.level = level;
          item.id = +uuid;
          item.path = "#" + uuid;
          item.children = [];
          list.push(item);
          node.children = list;
          arr.pop();
          arr.push(node);
        }

        localStorage.setItem("md_title_data", JSON.stringify(arr));
        switch (level) {
          case 1:
            return `<h1 ${getStyles("h1")} id="${uuid}">${text}</h1>`;
          case 2:
            return `<h2 ${getStyles("h2")} id="${uuid}">${text}</h2>`;
          case 3:
            return `<h3 ${getStyles("h3")} id="${uuid}">${text}</h3>`;
          default:
            return `<h4 ${getStyles("h4")} id="${uuid}">${text}</h4>`;
        }
      };
      renderer.paragraph = (text) => {
        if (text.indexOf("<figure") != -1 && text.indexOf("<img") != -1) {
          return text;
        }
        return text.replace(/ /g, "") === ""
          ? ""
          : `<p ${getStyles("p")}>${text}</p>`;
      };

      renderer.blockquote = (text) => {
        text = text.replace(/<p.*?>/g, `<p ${getStyles("blockquote_p")}>`);
        return `<blockquote ${getStyles("blockquote")}>${text}</blockquote>`;
      };
      renderer.code = (text, lang) => {
        text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const codeLines = text
          .split("\n")
          .map(
            (line, index) =>
              `<code class="${lang}" data-id="${index}">${
                hljs.highlightAuto(line).value
              } </code>`
          )
        ;
        const codeTheme = "github";
        return ` <div style="border-radius: 5px;box-shadow: rgb(0 0 0 / 55%) 0px 2px 10px;" class="code-body">
                   <div class="language-java hljs " style="border-radius: 5px 5px 0 0;display: flex;flex-direction: row;justify-content: space-between;height: 30px;line-height: 30px;">
                      <span style="display: block; background: url(${require('@/assets/svg/mac.svg')}); height: 30px; width: 100%; background-size: 40px; background-repeat: no-repeat; margin-bottom: -7px; border-radius: 5px; background-position: 10px 10px;"></span>
                      <div style="display: none;border-radius: 5px;text-align: center;font-family: Consolas,Menlo,Courier,monospace;color:#000;;height: 30px;width: 60px;background: #ffffff;opacity: 0.5;cursor: pointer" class="copy-code">复制</div>
                   </div>
                     <pre class="language-java hljs" style="padding: 10px;display: flex;flex-direction: column;justify-content: flex-start;border-radius:0 0 5px 5px;">
                        ${codeLines.join("")}
                     </pre>

                </div>
            `;
      };
      renderer.codespan = (text, lang) =>
        `<code ${getStyles("codespan")}>${text}</code>`;
      renderer.listitem = (text) =>
        `<span ${getStyles(
          "listitem"
        )}><span style="margin-right: 10px;"><%s/></span>${text}</span>`;

      renderer.list = (text, ordered, start) => {
        text = text.replace(/<\/*p.*?>/g, "");
        let segments = text.split(`<%s/>`);
        if (!ordered) {
          text = segments.join("•");
          return `<p ${getStyles("ul")}>${text}</p>`;
        }
        text = segments[0];
        for (let i = 1; i < segments.length; i++) {
          text = text + i + "." + segments[i];
        }
        return `<p ${getStyles("ol")}>${text}</p>`;
      };
      renderer.image = (href, title, text) => {
        let subText = "";
        if (text) {
          subText = `<figcaption ${getStyles(
            "figcaption"
          )}>${text}</figcaption>`;
        }
        let figureStyles = getStyles("figure");
        let imgStyles = getStyles(ENV_STRETCH_IMAGE ? "image" : "image_org");
        return `<figure ${figureStyles}><img ${imgStyles} src="${href}" title="${title}" data-original="${href}" alt="${text}"/>${subText}</figure>`;
      };
      renderer.link = (href, title, text) => {
        if (href.startsWith("https://mp.weixin.qq.com")) {
          return `<a href="${href}" title="${title || text}" ${getStyles(
            "wx_link"
          )}>${text}</a>`;
        }
        if (href === text || !status) {
          return text;
        }
        let ref = addFootnote(title || text, href);
        return `<span ${getStyles("link")}>${text}<sup>[${ref}]</sup></span>`;
      };
      renderer.strong = (text) =>
        `<strong ${getStyles("strong")}>${text}</strong>`;
      renderer.em = (text) =>
        `<span style="font-style: italic;">${text}</span>`;
      renderer.table = (header, body) =>
        `<section style="padding:0 8px;"><table class="preview-table"><thead ${getStyles(
          "thead"
        )}>${header}</thead><tbody>${body}</tbody></table></section>`;
      renderer.tablecell = (text, flags) =>
        `<td ${getStyles("td")}>${text}</td>`;
      renderer.hr = () =>
        `<hr style="border-style: solid;border-width: 1px 0 0;border-color: rgba(0,0,0,0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);">`;
      return renderer;
    };
  }
}

export default WxRenderer;
