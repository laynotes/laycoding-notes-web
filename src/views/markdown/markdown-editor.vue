<template>
  <div id="vditor">

  </div>
</template>
<script>
import Vditor from "vditor";
import "vditor/src/assets/scss/index.scss"
export default {
  data() {
    return {
      contentEditor: '',
    }
  },
  mounted() {
    this.contentEditor = new Vditor('vditor', {
      height: 500,
      toolbarConfig: {
        pin: true,
      },
      cache: {
        enable: true,
      },
      after: () => {
        this.contentEditor.setValue('hello, Vditor + Vue!')
      },
    });
    this.contentEditor.setTheme("classic")
  },
}
</script>
