<template>
  <div class="shared-upload-section">
    <div
      class="shared-upload-area"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ dragover: isDragOver }"
    >
      <div class="shared-upload-icon">
        <component :is="iconComponent" :size="24" v-if="iconComponent" />
        <span v-else>{{ icon }}</span>
      </div>
      <div class="shared-upload-text">{{ uploadText }}</div>
      <div class="shared-upload-hint">{{ hintText }}</div>
    </div>
    <input
      type="file"
      ref="fileInputRef"
      class="shared-file-input"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { Folder, SquareUserRound } from 'lucide-vue-next';
import { computed, ref } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    default: 'folder'
  },
  uploadText: {
    type: String,
    default: 'Drop files here or click to browse'
  },
  hintText: {
    type: String,
    default: 'Select files to upload'
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  multiple: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['files-selected', 'drag-over', 'drag-leave']);

const fileInputRef = ref(null);
const isDragOver = ref(false);

const iconComponent = computed(() => {
  if (props.icon === 'folder') {
    return Folder;
  }
  if (props.icon === 'target') {
    return SquareUserRound;
  }
  return null;
});

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleDragOver() {
  isDragOver.value = true;
  emit('drag-over');
}

function handleDragLeave() {
  isDragOver.value = false;
  emit('drag-leave');
}

function handleDrop(event) {
  isDragOver.value = false;
  const files = event.dataTransfer?.files;
  if (files?.length) {
    emit('files-selected', files);
  }
}

function handleFileChange(event) {
  const files = event.target.files;
  if (files?.length) {
    emit('files-selected', files);
  }
}

function resetInput() {
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

defineExpose({
  resetInput
});
</script>

<style scoped>
.shared-upload-area {
  padding: 10px 10px;
}
</style>
