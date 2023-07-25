<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped></style>

<script setup lang="ts">
import { useOsTheme, darkTheme } from "naive-ui";
import { computed, ref } from "vue";

const osThemeRef = ref(useOsTheme());
const theme = computed(() => (osThemeRef.value === "dark" ? darkTheme : null));
</script>
