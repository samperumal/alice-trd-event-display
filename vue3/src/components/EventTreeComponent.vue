<template>
  <div class="tree-container">
    <div>Event Tree</div>
    <div v-if="data.loading">Loading</div>
    <div v-else>
      <div v-for="event in this.data.treeData" :key="event.id">
        <div>{{ event.label }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, isReactive, PropType } from "vue";
import { DisplayData } from "../lib/types";

export default defineComponent({
  props: { data: { type: Object as PropType<DisplayData>, required: true } },
  setup() {},
  computed: {
    test() {
      return isReactive(this.data.rawData);
    },
  },
});
</script>

<style scoped>
.tree-container {
  background-color: coral;
  overflow-y: auto;
}
</style>