<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>


export default {
  name: 'App',
  created() {
     window.addEventListener("unload",this.saveState);
  },
  data() {
    return {
      collapsed: false,
    };
  },
  methods:{
    saveState(){
      console.log(JSON.stringify(this.$store.state))
      sessionStorage.setItem("state",JSON.stringify(this.$store.state))
    }
  }
}
</script>

<style lang="less">
@import './assets/iconfont.css';
/* 每个页面公共css */
@import url("./assets/less/style-mirror.css");
@import url("./assets/less/theme.less");
@import url("./assets/less/code-theme.less");

#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

#app{
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #fff;
}

::-webkit-scrollbar-track {
  border-radius: 6px;
  background-color: rgba(200, 200, 200, 0.3);
}

::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: rgba(144, 146, 152, 0.5);
  transition: background-color 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 146, 152, 0.5);
}
/* CSS-hints */
.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow: hidden;
  list-style: none;

  margin: 0;
  padding: 2px;

  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  min-width: 200px;
  font-size: 12px;
  font-family: monospace;

  max-height: 20em;
  overflow-y: auto;
  color: #333333;
}

.CodeMirror-hint {
  margin: 0;
  margin-top: 10px;
  padding: 4px 6px;
  border-radius: 2px;
  white-space: pre;
  color: black;
  cursor: pointer;
}
.CodeMirror-hint:first-of-type {
  margin-top: 0;
}
.CodeMirror-hint:hover {
  background: #f0f0f0;
}
</style>
