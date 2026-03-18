import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueParticles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import { useThemeStore } from './stores/theme'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
VueParticles(app, {
  init: async (engine) => {
    await loadSlim(engine)
  },
})

useThemeStore(pinia).initTheme()

app.mount('#app')
