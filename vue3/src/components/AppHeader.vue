<template>
  <div class="app-header">
    <div class="header">
      <img src="img/alice_logo.png" class="logo" />
      <div class="header-text">TRD Event Display</div>
      <img src="img/alice_logo.png" class="logo" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
});
</script>

<style scoped>
.app-header {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header {
  flex: 1 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: 8vh;
}

.logo {
  width: 3em;
  margin: 0.2em;
  padding: 0.4em;
}

.header-text {
  display: inline-block;
  vertical-align: bottom;
  margin-left: 0.5em;
  margin-right: 1em;
  color: #b7412d;
  font-size: 2.5em;
  font-weight: bold;
  text-align: center;
}
</style>