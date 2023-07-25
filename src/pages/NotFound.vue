<template>
  <div class="container">
    <n-result
      status="404"
      title="404 资源不存在"
      description="生活总归带点荒谬"
      size="huge"
    >
    </n-result>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}
</style>

<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({
  title: "404 - GoLive"
})
</script>
