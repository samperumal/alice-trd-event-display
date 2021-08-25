<template>
  <app-header @load="load"></app-header>
  <app-content :data="data"></app-content>
  <app-footer></app-footer>
</template>

<script type="ts">
import { defineComponent, reactive, markRaw } from "@vue/runtime-core";
import AppContent from "./components/AppContent.vue";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";
import axios from "axios";

export default defineComponent({
  components: { AppHeader, AppFooter, AppContent },
  setup() {
    const rawData = markRaw({});
    const data = reactive({
      loading: true,
      treeData: {},
      rawData
    });

    return { data };
  },
  methods: {
    load() {
      axios
        .get("data/o2/data.json")
        .then((resp) => {
          this.data.loading = false;
          this.data.rawData = markRaw(resp.data);
        })
        .catch((err) => console.error(err));
    },
  },
});
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
