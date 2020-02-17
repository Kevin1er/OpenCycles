<template>
  <div class="home">
    <Map />
  </div>
</template>

<style scoped>
.home {
  height: 100%;
  width: 100%;
}
</style>

<script>
// @ is an alias to /src
import Map from "@/components/Map.vue";

export default {
  name: "home",
  components: {
    Map
  }
};
</script>
