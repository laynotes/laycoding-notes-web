import Vue from 'vue'
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
  mode:'history',
  routes: [
    {
      path: '*',
      redirect: "/main"
    },
    {
      path: "/markdown/**",
      name: "markdownEditor",
      component: () => import('../views/markdown/markdown-code'),
      meta: {
        title: "markdown | 来码笔记"
      }
    },
    {
      path: "/draw/**",
      name: "drawEditor",
      component: () => import('../views/draw/draw.vue'),
      meta: {
        title: "流程图 | 来码笔记"
      }
    },
    {
      path: "/excel/**",
      name: "excelEditor",
      component: () => import('../views/excel/excelEditor'),
      meta: {
        title: "表格 | 来码笔记"
      }
    },
    {
      path: "/canvas/**",
      name: "canvasEditor",
      component: () => import('../views/canvas/canvasEditor'),
      meta: {
        title: "画板 | 来码笔记"
      }
    },
    {
      path: "/mind/**",
      name: "mindEditor",
      component: () => import('../views/mind/mind.vue'),
      meta: {
        title: "脑图 | 来码笔记"
      }
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
        },
        {
          path: "/notes/drawView/**",
          name: "drawView",
          component: () => import("../views/draw/drawView")
        },
        {
          path: "/notes/mindView/**",
          name: "mindView",
          component: () => import("../views/mind/mindView")
        },
        {
          path: "/notes/error",
          name: "error",
          component: () => import("../views/common/error")
        }
      ],
      meta: {
        title: '来码笔记'
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
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = '来码笔记';
  }
  next();
})

export default router;
