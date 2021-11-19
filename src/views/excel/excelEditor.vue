<template>
  <div class="hello">
    <div
      id="excelEditor"
      style="margin:0px;padding:0px;position:absolute;width:100%;height:100%;left: 0px;"
    ></div>

    <div id="functionButton" style="display: none">

      <a-button type="primary" id="save">
        保 存
      </a-button>

      <div class="ant-upload ant-upload-select ant-upload-select-text" id="uploadExcel">
        <span role="button" tabindex="0" class="ant-upload">
          <input type="file" style="display: none;" id="fileUpload">
          <button type="button" class="ant-btn"><i aria-label="图标: upload" class="anticon anticon-upload">
            <svg viewBox="64 64 896 896" data-icon="upload" width="1em" height="1em" fill="currentColor"
                 aria-hidden="true" focusable="false" class="">
              <path
                d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 0 0-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
            </svg></i><span>上传</span></button>
        </span>
      </div>

    </div>
  </div>
</template>

<script>
import LuckyExcel from 'luckyexcel';

export default {
  data() {
    return {
      excelEditor: null,
      options: {
        container: 'excelEditor', //luckysheet为容器id
        title: '表格文件', //表 头名
        lang: 'zh', //中文
        column: 10,//列数
        row: 30,//行数
        showtoolbar: true,//是否显示工具栏
        showinfobar: true,//是否显示顶部信息栏
        showsheetbar: true,//是否显示底部sheet按钮
        allowEdit: true,//是否允许前端编辑
        myFolderUrl: 'https://www.cnblogs.com/javascript9527/',//<左上角的“后退”按钮的链接
        cellRightClickConfig: {//自定义配置单元右键菜单
          copy: true, // 复制
          copyAs: true, // 复制为
          paste: true, // 粘贴
          insertRow: true, // 插入行insert row
          insertColumn: true, // 插入列insert column
          deleteRow: true, // 删除选中行的数据 delete the selected row
          deleteColumn: true, // 删除选中列的数据delete the selected column
          deleteCell: false, // delete cell
          hideRow: true, // hide the selected row and display the selected row
          hideColumn: true, // hide the selected column and display the selected column
          rowHeight: true, // 设置行高
          columnWidth: true, // 设置行宽
          clear: true, // 清空选定内容clear content
          matrix: false, //矩阵 matrix operation selection
          sort: false, // 排序sort selection
          filter: false, //筛选 filter selection
          chart: false, //图表生成 chart generation
          image: false, //插入图片 insert picture
          link: false, // 插入连接，比如网址之类insert link
          data: false, //数据校验 data verification
          cellFormat: false //设置单元格格式，锁定单元格格式，隐藏公示等 Set cell format
        },
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    addListener() {
      const that = this;
      document.getElementById("excelEditor").querySelector("#save").addEventListener('click', () => {
        console.log(that.excelEditor.toJson());
        localStorage.setItem("execl_data", JSON.stringify(that.excelEditor.getAllSheets()));
      });

      document.getElementById("excelEditor").querySelector("#uploadExcel").addEventListener('click', (event) => {
        // console.log(event)

        document.getElementById("excelEditor").querySelector("#fileUpload").click();

        // that.uploadExcel(event);
      });
      document.getElementById("excelEditor").querySelector("#fileUpload").addEventListener('change', (event) => {
        // console.log(event)

        that.uploadExcel(event);
      });

    },
    uploadExcel(evt) {
      const files = evt.target.files;
      if (files == null || files.length === 0) {
        console.log("No files wait for import");
        return;
      }

      let name = files[0].name;
      let suffixArr = name.split("."), suffix = suffixArr[suffixArr.length - 1];
      if (suffix !== "xlsx") {
        console.log("Currently only supports the import of xlsx files");
        return;
      }

      const _that = this;
      LuckyExcel.transformExcelToLucky(files[0], function (exportJson, luckysheetfile) {
        console.log(exportJson)
        if (exportJson.sheets == null || exportJson.sheets.length == 0) {
          alert("Failed to read the content of the excel file, currently does not support xls files!");
          return;
        }
        _that.excelEditor.destroy();
        _that.options.data = exportJson.sheets;
        _that.options.title = exportJson.info.name;
        _that.excelEditor.create(_that.options);
        _that.addListener();
      });
    },
    init() {
      if (localStorage.getItem("execl_data") != null) {
        this.options.data = JSON.parse(localStorage.getItem("execl_data"))
      }
      this.options.functionButton = document.getElementById("functionButton").innerHTML;
      // eslint-disable-next-line no-undef
      this.excelEditor.create(this.options);
      this.addListener();
    }
  },
  created() {
    this.excelEditor = window.luckysheet;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
