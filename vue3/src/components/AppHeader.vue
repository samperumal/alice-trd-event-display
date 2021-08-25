<template>
  <div class="app-header">
    <div><a class="menu" @click="$emit('load')">Load</a></div>
    <div class="header">
      <img src="img/alice_logo.png" class="logo" />
      <div class="header-text">TRD Event Display</div>
      <img src="img/alice_logo.png" class="logo" />
    </div>
    <div>{{ data.text }}</div>
  </div>
  <modal v-if="showModal" @close="showModal = false">
    <template v-slot:header>
      <h3>Data Source</h3>
    </template>
    <template v-slot:body>
      <input class="url-input" type="url" />
    </template>
  </modal>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Modal from "./Modal.vue";

export default defineComponent({
  components: { Modal },
  emits: ["load"],
  setup() {
    const showModal = ref(false);

    return { showModal, data: { text: "This shouldn't change" } }
  },
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
  justify-content: center;
  align-items: center;
  /* min-height: 8vh; */
}

.logo {
  width: 3em;
  margin: 0.2em;
  padding: 0.4em;
}

.header-text {
  display: inline-block;
  vertical-align: bottom;
  margin-left: 1em;
  margin-right: 1em;
  color: #b7412d;
  font-size: 2.5em;
  font-weight: bold;
  text-align: center;
}

.menu {
  padding: 0.3em;
  margin-left: 1em;
}

.menu:hover {
  background-color: lightgray;
  border-radius: 2px;
  border-color: black;
  cursor: pointer;
}

.url-input {
  width: 30em;
}
</style>