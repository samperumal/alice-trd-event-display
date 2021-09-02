<template>
  <div class="sector-view-vue-component">
    <svg :id="this.id" preserveAspectRatio="xMidYMid meet"></svg>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, isReactive } from 'vue'
import { DisplayData } from '../lib/types'
import { SectorViewComponent } from '../svg-render/sector-view'
import '../css/sector-view.css'

export default defineComponent({
  props: {
    data: { type: Object as PropType<DisplayData>, required: true },
    id: { type: String, required: true }
  },
  setup() {
    return {
      svgRender: null as SectorViewComponent | null
    }
  },
  mounted() {
    this.svgRender = new SectorViewComponent('#' + this.id, 300, 300)
  }
})
</script>

<style scoped>
.sector-view-vue-component {
  background-color: lavender;
}
</style>