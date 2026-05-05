### 第一步：初始化 Vite 项目

在终端（命令行）进入 `timeshards-admin` 文件夹，运行：

```bash
pnpm create vite .
```
*注意：末尾的 `.` 表示在当前文件夹创建。*

**根据提示进行选择：**
1.  **Select a framework:** 选择 `Vue`
2.  **Select a variant:** 选择 `TypeScript`

完成后，安装基础依赖：
```bash
pnpm install
```

---

### 第二步：安装核心依赖

路由管理、状态管理、网络请求和 UI 组件库。

```bash
# 安装 Vue Router (路由), Pinia (状态管理), Axios (网络请求)
pnpm add vue-router@4 pinia axios

# 安装 Element Plus (UI 组件库) 和 图标库
pnpm add element-plus @element-plus/icons-vue

# 安装 Sass (为了方便写样式)
pnpm add -D sass
```

---

### 第三步：配置 Element Plus 自动按需引入

不需要在 `main.ts` 里引入整个库，我们可以配置自动引入，这样打包体积更小，开发更方便。

1.  安装插件：
    ```bash
    pnpm add -D unplugin-vue-components unplugin-auto-import
    ```

2.  修改项目根目录下的 **`vite.config.ts`**：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

---

### 第四步：规划目录结构

在 `src` 目录下手动创建以下文件夹，保持项目整洁：

```text
src/
├── api/            # 网络请求接口定义
├── assets/         # 静态资源（图片、全局样式）
├── components/     # 公共组件
├── layout/         # 页面布局组件（侧边栏、顶栏）
├── router/         # 路由配置
├── store/          # Pinia 状态管理
├── views/          # 页面组件（登录页、首页、博客管理页等）
└── utils/          # 工具函数（Axios 封装等）
```

---

### 第五步：基础配置代码实现

#### 1. 初始化 Pinia (在 `src/main.ts`)
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

#### 2. 创建一个基础路由 (在 `src/router/index.ts`)
```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('../views/login/index.vue'),
    },
    {
      path: '/',
      component: () => import('../layout/index.vue'),
      children: [
        {
          path: 'dashboard',
          component: () => import('../views/dashboard/index.vue'),
        }
      ]
    }
  ]
})

export default router
```

---

### 第六步：测试运行

为了验证 Element Plus 是否生效，修改 **`src/App.vue`**：

```vue
<template>
  <el-config-provider>
    <el-button type="primary">测试 Element Plus 按钮</el-button>
    <router-view />
  </el-config-provider>
</template>
```

然后在终端启动项目：
```bash
pnpm dev
```

---

### 第七步：接下来的核心开发计划

既然是后台管理端，你接下来需要攻克的几个“大头”：

1.  **Axios 二次封装：** 在 `utils/request.ts` 里处理请求头（携带 JWT Token）和响应拦截（处理报错）。
2.  **Layout 布局实现：** 
    *   左侧：`el-menu` 侧边栏导航。
    *   右侧：上方是面包屑和用户头像，下方是 `router-view`。
3.  **Login 页面：** 对接你刚才写的 NestJS 后端 `/api/auth/login` 接口。
4.  **权限控制：** 只有登录后才能进入 `/dashboard`。

### 💡 建议
对于后台管理端，**布局（Layout）** 是最繁琐的。如果你不想从 0 开始写侧边栏折叠、面包屑、标签页切换，可以去 GitHub 参考一下 **`Vue-Pure-Admin`** 或 **`Vue-Element-Admin`** 的结构，但逻辑代码建议自己手写，这样提升最大。
