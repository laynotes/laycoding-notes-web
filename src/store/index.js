import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const state = sessionStorage.getItem("state") ? JSON.parse(sessionStorage.getItem("state")) : {
  wxRenderer: null,
  output: "",
  html: "",
  editor: null,
  cssEditor: null,
  currentFont: "",
  currentSize: "",
  currentColor: "",
  citeStatus: 0,
  nightMode: false,
  codeTheme: "github",
  rightClickMenuVisible: false,
  userInfo:null
};
const mutations = {
  setUserInfo(state,data){
    state.userInfo = data;
  }
};

export default new Vuex.Store({
  state,
  mutations,
  actions: {},
});
