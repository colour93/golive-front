<template>
  <homepage-view
    v-if="loginStatus === -1"
    @login="updateLoginStatus(1)"
  ></homepage-view>
  <profile-view
    v-if="loginStatus === 1"
    @logout="updateLoginStatus(-1)"
  ></profile-view>
</template>

<style scoped></style>

<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import HomepageView from "../views/Homepage.vue";
import ProfileView from "../views/Profile.vue";

import axios from "axios";

const loginStatus = ref(0);

onBeforeMount(async () => {
  const result = await axios.get("/api/overview").then((resp) => resp.data);

  loginStatus.value = result.user ? 1 : -1;
});

function updateLoginStatus(status: 0 | 1 | -1) {
  loginStatus.value = status;
}
</script>
