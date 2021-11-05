<template>
  <div>
    <div>
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="当前存储" :required="true">
          <a-select
              show-search
              placeholder="选择图片存储方式"
              option-filter-prop="children"
              :default-value="ossType"
          >
            <a-select-option value="0">
              本地OSS
            </a-select-option>
            <a-select-option value="1">
              码云OSS
            </a-select-option>
            <a-select-option value="2">
              七牛OSS
            </a-select-option>
            <a-select-option value="3">
              阿里OSS
            </a-select-option>

          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <a-collapse accordion>
      <a-collapse-panel key="1" header="本地OSS">
        <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-form-item label="图库路径">
            <a-input disabled value="/var/locals"/>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="2" header="码云OSS" >
        <el-form
            class="setting-form"

            label-position="right"
            label-width="80px"
        >
          <el-form-item label="Gitee 仓库" :required="true">
            <el-input

                placeholder="如：gitee.com/yanglbme/resource"
            ></el-input>
          </el-form-item>
          <el-form-item label="分支">
            <el-input

                placeholder="如：release，可不填，默认 master"
            ></el-input>
          </el-form-item>
          <el-form-item label="私人令牌" :required="true">
            <el-input

                show-password
                placeholder="如：cc1d0c1426d0fd0902bd2d7184b14da61b8abc46"
            ></el-input>
            <el-link
                type="primary"
                href="https://gitee.com/profile/personal_access_tokens"
                target="_blank"
            >请在 Gitee「设置->安全设置->私人令牌」中生成</el-link
            >
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
            >保存配置</el-button
            >
          </el-form-item>
        </el-form>
      </a-collapse-panel>
      <a-collapse-panel key="3" header="七牛OSS" >
        <el-form
            class="setting-form"
            label-position="right"
            label-width="140px"
        >
          <el-form-item label="AccessKey" :required="true">
            <el-input

                placeholder="如：6DD3VaLJ_SQgOdoocsyTV_YWaDmdnL2n8EGx7kG"
            ></el-input>
          </el-form-item>
          <el-form-item label="SecretKey" :required="true">
            <el-input

                show-password
                placeholder="如：qgZa5qrvDOOcsmdKStD1oCjZ9nB7MDvJUs_34SIm"
            ></el-input>
          </el-form-item>
          <el-form-item label="Bucket" :required="true">
            <el-input

                placeholder="如：md"
            ></el-input>
          </el-form-item>
          <el-form-item label="Bucket 对应域名" :required="true">
            <el-input

                placeholder="如：https://images.123ylb.cn"
            ></el-input>
          </el-form-item>
          <el-form-item label="存储区域" :required="true">
            <el-input

                placeholder="如：z2"
            ></el-input>
          </el-form-item>
          <el-form-item label="存储路径" :required="false">
            <el-input

                placeholder="如：img，可不填，默认为根目录"
            ></el-input>
            <el-link
                type="primary"
                href="https://developer.qiniu.com/kodo"
                target="_blank"
            >如何使用七牛云 Kodo？</el-link
            >
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
            >保存配置</el-button
            >
          </el-form-item>
        </el-form>
      </a-collapse-panel>
      <a-collapse-panel key="4" header="阿里OSS">
        <el-form
            class="setting-form"

            label-position="right"
            label-width="140px"
        >
          <el-form-item label="AccessKey ID" :required="true">
            <el-input

                placeholder="如：LTAI4GdoocsmdoxUf13ylbaNHk"
            ></el-input>
          </el-form-item>
          <el-form-item label="AccessKey Secret" :required="true">
            <el-input

                show-password
                placeholder="如：cc1d0c142doocs0902bd2d7md4b14da6ylbabc46"
            ></el-input>
          </el-form-item>
          <el-form-item label="Bucket" :required="true">
            <el-input

                placeholder="如：doocs"
            ></el-input>
          </el-form-item>
          <el-form-item label="Bucket 所在区域" :required="true">
            <el-input

                placeholder="如：oss-cn-shenzhen"
            ></el-input>
          </el-form-item>
          <el-form-item label="自定义 CDN 域名" :required="false">
            <el-input

                placeholder="如：https://imagecdn.alidaodao.com，可不填"
            ></el-input>
          </el-form-item>
          <el-form-item label="存储路径">
            <el-input

                placeholder="如：img，可不填，默认为根目录"
            ></el-input>
            <el-link
                type="primary"
                href="https://help.aliyun.com/document_detail/31883.html"
                target="_blank"
            >如何使用阿里云 OSS？</el-link
            >
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
            >保存配置</el-button
            >
          </el-form-item>
        </el-form>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script>
export default {
  data() {
    return {
      ossType:'1',
      text: ``,
    };
  },
};
</script>
