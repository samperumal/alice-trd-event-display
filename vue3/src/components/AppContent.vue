<template>
  <div class="app-content">
    <event-tree-component :data="data"></event-tree-component>
    <sector-view-component
      :data="data"
      id="sectorView1"
    ></sector-view-component>
    <supermodule-view-component :data="data"></supermodule-view-component>
    <view-3-d-component :data="data"></view-3-d-component>
    <track-information-component :data="data"></track-information-component>
    <sector-view-component
      :data="data"
      id="sectorView2"
    ></sector-view-component>
    <supermodule-zoom-view-component
      :data="data"
    ></supermodule-zoom-view-component>
    <timebin-view-component :data="data"></timebin-view-component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import EventTreeComponent from './EventTreeComponent.vue'
import SectorViewComponent from './SectorViewComponent.vue'
import SectorZoomViewComponent from './SectorZoomViewComponent.vue'
import SupermoduleViewComponent from './SupermoduleViewComponent.vue'
import SupermoduleZoomViewComponent from './SupermoduleZoomViewComponent.vue'
import TimebinViewComponent from './TimebinViewComponent.vue'
import TrackInformationComponent from './TrackInformationComponent.vue'
import View3DComponent from './View3DComponent.vue'

export default defineComponent({
  components: {
    EventTreeComponent,
    SectorViewComponent,
    SupermoduleViewComponent,
    View3DComponent,
    TrackInformationComponent,
    SectorZoomViewComponent,
    TimebinViewComponent,
    SupermoduleZoomViewComponent
  },
  props: ['data'],
  setup() {}
})
</script>

<style scoped>
.app-content {
  height: 100%;
  background-color: lightskyblue;
  display: grid;
  gap: 0.5rem;
  overflow-y: hidden;
  grid-template-rows: repeat(auto-fill, minmax(49%, 1fr));
  grid-template-columns: repeat(auto-fill, minmax(24%, 1fr));
}
</style>
<style>
svg {
  width: 100%;
  height: 100%;
}
</style>