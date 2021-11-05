import axios from "axios";
// 创建axios实例

import store from '../store/index'

let isLock = false;

let requestsArr = [];

const service = axios.create({
  baseURL: "https://docs.laycoding.com/api",
  timeout: 15 * 1000, // 请求超时时间
});

service.interceptors.request.use(
  (config) => {

    if (/^(post)|(put)|(delete)$/i.test(config.method)) {
      if (config.data && config.data.upload) {
        config.headers["Content-Type"] = "multipart/form-data";
        return config;
      }
    }
    config.url = config.url.indexOf(config.baseURL) > -1 ? config.url : config.baseURL + config.url;
    if (config.url.indexOf("/oauth/") > -1) {
      console.log("config->"+JSON.stringify(config));
      return config;
    }
    if (sessionStorage.getItem("state")) {
      const state = JSON.parse(sessionStorage.getItem("state"));
      if (state.userInfo && state.userInfo.token != null) {
        config.headers.Authorization = "Bearer " + state.userInfo.token;
      }
    }

    if (isLock && config.url.indexOf("/oauth/refresh") === -1) {

      const retry = new Promise((resolve, reject) => {
        //(token) => {...}这个函数就是回调函数
        subscribeTokenRefresh((token) => {
          config.headers.Authorization = 'Bearer ' + token
          //将请求挂起
          resolve(config)
        })
      })
      return retry
    }
    if (isLock && config.url.indexOf("/oauth/refresh") >-1){
      return config
    }else if (isLock) {
      Promise.reject(config);
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
const subscribeTokenRefresh = (cb) => {
  requestsArr.push(cb);
  console.log("挂起的请求:" + requestsArr.length)
}
const onRrefreshed = (token) => {
  requestsArr.map(cb => cb(token));
}
let that = this;

service.interceptors.response.use(
  (res) => {
    if (res.data.code === 0 || res.data.success) {
      return res.data ? res.data : Promise.reject(res);
    }
    const userInfo = sessionStorage.getItem("state") ? JSON.parse(sessionStorage.getItem("state")).userInfo : null;
    if (res.data.code === 401 && !isLock && userInfo != null) {

      new Promise((resolve, reject) => {
        refreshToken(userInfo.refreshToken);
      }).then(respones => {
        var axiosPromise = service(res.config);
        isLock = false;
        return axiosPromise;
      });
      //  console.log("res:",res.config)
    }
    return res.data ? res.data : Promise.reject(res);
  },
  (error) => Promise.reject(error)
);
const refreshToken = (token) => {
  if (token === null || token === "") {

    return;
  }
  service({
    url: "/oauth/refresh?refreshToken=" + token,
    method: "post"
  }).then(reponse => {
    const storage = sessionStorage.getItem("state");
    const obj = sessionStorage.getItem("state") ? JSON.parse(storage) : {};
    obj.userInfo = reponse.data;
    sessionStorage.setItem("state", JSON.stringify(obj));
    //store.state = obj;
    store.commit("setUserInfo", reponse.data);
    // store.userInfo = reponse.data;
    isLock = false;//释放锁
    onRrefreshed(reponse.data.token);
    //清空数组中保存的请求
    requestsArr = [];
  }).catch(erro => {
    console.log(erro);
    sessionStorage.clear();
  })
};
/*
request1.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response
}, async function (error) {
    // 对响应错误做点什么
    console.dir(error)
    const refreshToken = store.state.tokenInfo.refresh_token // 拿到refres_token 定义变量不能和引入的变量名重复 例如 const store
    if (error.response.status === 401) { // 在error对象中 可以看到状态 是否为401
        if (refreshToken) {
            // 1.  token 过期的情况 判断如果有refreshToken 去发ajax
            try {
                const res = await axios({
                    url: 'http://localhost:8000/v1_0/authorizations',
                    method: 'PUT',
                    headers: { // headers 不能按接口文档抄 H不能大写！！！！
                        Authorization: `Bearer ${refreshToken}`
                    }
                })
                const newToken = res.data.data.token // 拿到新的token再去发请求
                console.log(newToken)
                // 发请求调用vuex的mutations
                store.commit('setTokenInfo', { token: newToken, refresh_token: refreshToken }) // 这里的token 和 refresh_token要和之前定义变量匹配(vuex中)
                return request1(error.config) // 哪里发请求就在哪调用 这里指的是只是修改了新的token  并没有修改error其他的值 只是重新发请求
            } catch (error) {
                // 2.  refreshToken 也过期了 但是登录着呢 但是之前的已经登录已经跳不过去了 所以要设置为空 （这里之前设置过登录用户无法访问登录页 ）
                store.commit('setTokenInfo', {}) // 传一个空的token就可以了
                // encodeURIComponent 因为我们在路由传参的时候遇见&符后面的参数不能转码 所以我们要把整句转换成编码形式
                // 下面代码解释 例如我从文章页进行操作 没有token自动跳到登录页 登录之后用户想的是继续访问文章页 并不是想访问主页 所以我们就要保存刚才的路径
                // 通过'login?参数='+刚才的路径地址  这样登录页面就能拿到参数  登陆成功后进行跳转    this.$router.push(this.$route.query.returnUrl || '/')
                router.push('/login?returnUrl=' + encodeURIComponent(router.currentRoute.fullPath)) // router.currentRoute 相当于 vue中的$route
                return Promise.reject(new Error('refresh_token清空')) // 抛出错误不然会可能提示执行成功
            }
        } else { // 3.  如果没有refresh_token  去登录 和上面同样的操作
            console.log('未获取到refreshToken,所以要去登录')
            store.commit('setTokenInfo', {})
            router.push('/login?returnUrl=' + encodeURIComponent(router.currentRoute.fullPath)) // router.currentRoute 相当于 vue中的$route
            return Promise.reject(new Error('refresh_token不存在'))
        }
    }
})*/


export default service;
