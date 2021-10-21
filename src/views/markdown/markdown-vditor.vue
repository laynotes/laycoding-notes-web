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
      height: 600,
      toolbarConfig: {
        pin: true,
      },
      cache: {
        enable: true,
      },
      after: () => {
        this.contentEditor.setTheme("classic")
        this.contentEditor.setValue('hello, Vditor + Vue!')
      },
    });

  },
}
</script>
