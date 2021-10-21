import Vue from 'vue'
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '*',
      redirect: "/main"
    },
    {
      path:"/markdown/**",
      name:"markdownEditor",
      component:()=>import('../views/markdown/markdown-editor')
    },
    {
      path: '/main',
      name: 'main',
      component: () => import('../views/main'),
      children: [
        {
          path: "/notes/markdownView/**",
          name: "markdownView",
          component: () => import("../views/markdown/markdown")
        }
      ],
      meta: {
        title: 'main'
      }
    }
  ]
});
// meta里可以定义一些自己想要的数据
// 测试权限
// 进入导航之前的钩子
// 写上next()路由才会跳转
// 可以拦截登录，如果meta里配置了需要登录，则重定向到'/login'页面
router.beforeEach((to, from, next) => {
  /* if (to.meta.perm) {
        // next('/403')
       // next('/login')
    } else {
       // next()
    }*/
  next();
})

export default router;
