import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'

// Create a new store instance.
const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state) {
      state.count++
    }
  }
})

createApp(App)
  .use(store)
  .mount('#app')
