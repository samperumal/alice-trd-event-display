<template>
  <div class="app-footer">
    <div class="legend">
      <div class="legend-header">Legend</div>
      <div class="legend-column">
        <div>
          <div style="border: darkgray 2px solid" class="legend-color"></div>
          <div class="legend-text">Detector module</div>
        </div>
        <div>
          <div style="border-color: lightgray" class="legend-color"></div>
          <div class="legend-text">Detector pad</div>
        </div>
        <div>
          <div
            style="background-color: #f4f4f4; border: none"
            class="legend-color"
          ></div>
          <div class="legend-text">ALICE TPC</div>
        </div>
      </div>
      <div class="legend-column">
        <div>
          <div style="background-color: #3392e3" class="legend-color"></div>
          <div class="legend-text">Selected TRD track</div>
        </div>
        <div>
          <div style="background-color: #b37ce5" class="legend-color"></div>
          <div class="legend-text">Other TRD track</div>
        </div>
        <div>
          <div style="background-color: #cfe9ff" class="legend-color"></div>
          <div class="legend-text">Background track</div>
        </div>
      </div>
      <div class="legend-column">
        <div>
          <div style="background-color: #f03b20" class="legend-color"></div>
          <div class="legend-text">Selected TRD tracklet</div>
        </div>
        <div>
          <div style="background-color: #faa535" class="legend-color"></div>
          <div class="legend-text">Matched TRD tracklet</div>
        </div>
        <div>
          <div style="background-color: #f5d443" class="legend-color"></div>
          <div class="legend-text">Other TRD tracklet</div>
        </div>
      </div>
      <div class="legend-column">
        <div>
          <svg class="legend-color time-bin-view">
            <path d="M0,4 L20,4" class="tracklet"></path>
          </svg>
          <div class="legend-text">Lorentz corrected tracklet</div>
        </div>
        <div>
          <svg class="legend-color time-bin-view">
            <path d="M0,4 L20,4" class="tracklet lorentz"></path>
          </svg>
          <div class="legend-text">Raw reconstructed tracklet</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {},
});
</script>

<style>
.app-footer {
  height: 6em;
  overflow: hidden;
  /* background-color: lightgreen; */
  display: flex;
  align-items: center;
  justify-content: center;
}

.legend {
  display: flex;
  flex-direction: row;
  justify-content: center;
  /* height: 8vh; */
}

.legend-header {
  font-weight: bold;
  font-size: 16px;
  align-self: center;
}

.legend-color {
  width: 20px;
  height: 10px;
  display: inline-block;
  margin-right: 5px;
  border: 1px darkgray solid;
}

.legend-text {
  display: inline-block;
}

.legend-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
	align-items: start;
}
</style>