<template>
  <div class="app-content">
    <event-tree-component :data="data"></event-tree-component>
    <sector-view-component :data="data"></sector-view-component>
    <supermodule-view-component :data="data"></supermodule-view-component>
    <view-3-d-component :data="data"></view-3-d-component>
    <track-information-component :data="data"></track-information-component>
    <sector-zoom-view-component :data="data"></sector-zoom-view-component>
    <supermodule-zoom-view-component :data="data"></supermodule-zoom-view-component>
    <timebin-view-component :data="data"></timebin-view-component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EventTreeComponent from "./EventTreeComponent.vue";
import SectorViewComponent from "./SectorViewComponent.vue";
import SectorZoomViewComponent from "./SectorZoomViewComponent.vue";
import SupermoduleViewComponent from "./SupermoduleViewComponent.vue";
import SupermoduleZoomViewComponent from "./SupermoduleZoomViewComponent.vue";
import TimebinViewComponent from "./TimebinViewComponent.vue";
import TrackInformationComponent from "./TrackInformationComponent.vue";
import View3DComponent from "./View3DComponent.vue";

export default defineComponent({
  components: {
    EventTreeComponent,
    SectorViewComponent,
    SupermoduleViewComponent,
    View3DComponent,
    TrackInformationComponent,
    SectorZoomViewComponent,
    TimebinViewComponent,
    SupermoduleZoomViewComponent,
  },
  props: ["data"],
  setup() {},
});
</script>

<style scoped>
.app-content {
  height: 100%;
  background-color: lightskyblue;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  grid-auto-rows: 1fr;
  /* This is better for small screens, once min() is better supported */
  /* grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr)); */
  gap: 0.5rem;
  overflow-y: auto;
}
</style>