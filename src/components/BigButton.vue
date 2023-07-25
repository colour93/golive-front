<template>
  <button :btn-type="type" @click="props.onClick"><slot></slot></button>
</template>

<style scoped>
button {
  min-width: 200px;
  padding: 15px 30px;

  border: none;
  border-radius: 36px;

  font-size: 32px;
  font-weight: 400;

  transition: all 0.2s;
}

button:hover {
  cursor: pointer;
}

button[btn-type="primary"] {
  background: #fff;
  color: var(--indigo-a400);
}

button[btn-type="primary"]:hover {
  background: #e0e0e0;
  color: var(--indigo-500);
}

button[btn-type="secondary"] {
  background: var(--indigo-a200);
  color: #fff;
}

button[btn-type="secondary"]:hover {
  background: var(--indigo-a400);
  color: #eee;
}
</style>

<script setup lang="ts">
const props = defineProps({
  onClick: Function,
  type: String,
});
</script>
