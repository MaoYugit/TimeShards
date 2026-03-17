import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueParticles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
VueParticles(app, {
  init: async (engine) => {
    await loadSlim(engine)
  },
})

app.mount('#app')
