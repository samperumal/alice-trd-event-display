<template>
  <div>
    <div v-if="data.loading">Loading</div>
    <div v-else>Event Tree</div>
    <div>{{ test }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, isReactive } from "vue";

export default defineComponent({
  props: ["data"],
  setup() {},
  computed: {
    test() {
      return isReactive(this.data.rawData);
    },
  },
});
</script>

<style scoped>
</style>