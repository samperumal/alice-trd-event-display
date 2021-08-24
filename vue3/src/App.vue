<template>
  <app-header></app-header>
  <div class="app-content">Content</div>
  <app-footer></app-footer>
</template>

<script type="ts">
import { defineComponent } from "@vue/runtime-core";
import AppFooter from "./components/AppFooter.vue";
import AppHeader from "./components/AppHeader.vue";

export default defineComponent({
  components: { AppHeader, AppFooter },
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

.app-content {
  height: 100%;
  background-color: lightskyblue;
}
</style>
