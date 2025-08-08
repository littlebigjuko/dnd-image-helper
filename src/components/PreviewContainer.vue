<template>
  <div class="shared-preview-section">
    <div class="shared-preview-container">
      <div class="shared-preview-placeholder" v-if="showPlaceholder">
        <div class="shared-preview-placeholder-icon">{{ placeholderIcon }}</div>
        <div>{{ placeholderText }}</div>
      </div>
      <div ref="containerRef"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  placeholderIcon: {
    type: String,
    default: '🖼️'
  },
  placeholderText: {
    type: String,
    default: 'Upload images to see preview'
  },
  showPlaceholder: {
    type: Boolean,
    default: true
  }
});

const containerRef = ref(null);

function getContainer() {
  return containerRef.value;
}

function resetContainer() {
  if (containerRef.value) {
    const children = Array.from(containerRef.value.children);
    children.forEach((child) => {
      if (!child.classList.contains('shared-preview-placeholder')) {
        child.remove();
      }
    });
  }
}

defineExpose({
  getContainer,
  resetContainer,
  containerRef
});
</script>

<style scoped>
.shared-preview-container {
  flex: 1;
  min-height: 0;
}
</style>
