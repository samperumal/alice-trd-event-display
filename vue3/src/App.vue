<template>
  <app-header @load="load"></app-header>
  <app-content :data="data"></app-content>
  <app-footer></app-footer>
</template>

<script lang="ts">
import { defineComponent, reactive, markRaw } from '@vue/runtime-core'
import AppContent from './components/AppContent.vue'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
import axios from 'axios'

import { createEventTree } from './lib/displayMap'
import { PromiseTimeout } from './lib/utils'
import { DisplayData, EventData } from './lib/types'

export default defineComponent({
  components: { AppHeader, AppFooter, AppContent },
  setup() {
    const rawData = markRaw([])
    const data: DisplayData = reactive<DisplayData>({
      loading: false,
      treeData: [],
      rawData,
      selectedEvent: null,
      selectedTrack: null
    })

    return { data }
  },
  mounted() {
    this.load()
  },
  methods: {
    load() {
      this.data.loading = true
      axios
        .get('data/o2/data.json')
        .then((resp) => {
          this.data.rawData = markRaw(resp.data)
          return PromiseTimeout(0 * 1000, resp)
        })
        .then((resp: { data: EventData }) => {
          this.data.treeData = createEventTree(resp.data)
          this.data.loading = false
        })
        .catch((err) => console.error(err))
    }
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
</style>
