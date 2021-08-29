<template>
  <div class="tree-container">
    <div>Event Tree</div>
    <div v-if="data.loading">Loading</div>
    <div v-else>
      <div class="columns">
        <div class="column">
          <div v-for="event in this.data.treeData" :key="event.id">
            <div class="event" :class="event.selected ? 'selected' : ''" @click="selectEvent(event)">{{ event.label }}</div>
          </div>
        </div>
        <div class="column">
          <div v-if="selectedEvent != null">
            <div class="track" :class="track.selected ? 'selected' : ''" v-for="track in selectedEvent.tracks" :key="track.id" @click="selectTrack(selectedEvent, track)">
              {{ track.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, isReactive, PropType, ref } from "vue";
import { DisplayData, SelectionTreeEvent, SelectionTreeEventTrack } from "../lib/types";

export default defineComponent({
  props: { data: { type: Object as PropType<DisplayData>, required: true } },
  setup() {},
  computed: {
    test() {
      return isReactive(this.data.rawData);
    },
    selectedEvent() {
      // return null
      if (this.data == null || this.data.treeData == null) return null;
      let arrData = this.data.treeData;
      let filteredResult = arrData.filter(e => e.selected)
      if (filteredResult == null || filteredResult.length == 0)
        return null
      else return filteredResult[0]
    }
  },
  methods: {
    selectEvent(selectedEvent : SelectionTreeEvent) {
      let found = false;
      for (let event of this.data.treeData) {
        if (event.selected = (event == selectedEvent))
          this.data.selectedEvent = event;
          found = true;
      }

      if (!found) {
        this.data.selectedEvent = null;
      }
    },
    selectTrack(selectedEvent : SelectionTreeEvent | null, selectedTrack : SelectionTreeEventTrack) {
      
      let found = false;
      if (selectedEvent != null && selectedEvent.tracks != null) {
        this.selectEvent(selectedEvent)
        for (let track of selectedEvent.tracks) {
          if (track.selected = (track == selectedTrack))
            this.data.selectedTrack = track;
            found = true;
        }
      }

      if (!found) {
        this.data.selectedTrack = null;
      }
    }
  }
});
</script>

<style scoped>
.tree-container {
  background-color: coral;
  overflow-y: auto;
}

.columns {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
}

.column {
  /* width: 50%; */
  padding: 0 1em;
  text-align: left;
}

.event, .track {
  cursor: pointer;
  padding: 0.2em 0.4em;
  border-radius: 5px;
}

.selected {
  background-color: white;
}
</style>