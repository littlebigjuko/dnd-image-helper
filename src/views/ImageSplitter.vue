<template>
  <div class="shared-main-content">
    <div class="shared-desktop-layout">
      <div class="shared-controls-column">
        <div class="shared-upload-section">
          <div
            class="shared-upload-area"
            ref="uploadAreaRef"
            @click="fileInputRef?.click()"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            :class="{ dragover: isDragOver }"
          >
            <div class="shared-upload-icon">📁</div>
            <div class="shared-upload-text">
              Drop your image here or click to browse
            </div>
            <div class="shared-upload-hint">
              Supports JPEG, PNG, WebP, GIF (max 10MB)
            </div>
          </div>
          <input
            type="file"
            ref="fileInputRef"
            class="shared-file-input"
            accept="image/*"
            @change="handleImageUpload($event.target.files)"
          />
        </div>

        <div class="shared-controls-section">
          <div class="shared-control-group">
            <label class="shared-control-label">Grid Settings</label>
            <div class="shared-grid-controls">
              <div class="shared-input-group">
                <label class="shared-input-label">Rows</label>
                <input
                  type="number"
                  ref="rowsInputRef"
                  class="shared-number-input"
                  min="1"
                  max="10"
                  v-model.number="rows"
                />
              </div>
              <div class="shared-input-group">
                <label class="shared-input-label">Columns</label>
                <input
                  type="number"
                  ref="colsInputRef"
                  class="shared-number-input"
                  min="1"
                  max="10"
                  v-model.number="cols"
                />
              </div>
            </div>
          </div>

          <div class="shared-control-group">
            <label class="shared-control-label">Actions</label>
            <div class="shared-action-buttons">
              <button
                ref="generateBtnRef"
                class="shared-btn shared-btn-primary"
                :disabled="!selectedFile"
                @click="generatePDF"
              >
                📄 Generate PDF
              </button>
              <button
                ref="resetBtnRef"
                class="shared-btn shared-btn-secondary"
                @click="resetImageSplitter"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="shared-preview-column">
        <div class="shared-preview-section">
          <div class="shared-preview-container" ref="previewContainerRef">
            <div class="shared-preview-placeholder">
              <div class="shared-preview-placeholder-icon">🖼️</div>
              <div>Upload an image to see the grid preview</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <MessageDisplay
      :message="currentMessage.text"
      :type="currentMessage.type"
      :show="currentMessage.show"
      @dismiss="dismissMessage"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import MessageDisplay from '../components/MessageDisplay.vue';
import { useFileUpload } from '../composables/useFileUpload';
import { useImageCanvas } from '../composables/useImageCanvas';
import { usePdfGeneration } from '../composables/usePdfGeneration';

const uploadAreaRef = ref(null);
const fileInputRef = ref(null);
const previewContainerRef = ref(null);
const rowsInputRef = ref(null);
const colsInputRef = ref(null);
const generateBtnRef = ref(null);
const resetBtnRef = ref(null);

const rows = ref(2);
const cols = ref(2);

const currentMessage = ref({
  text: '',
  type: 'info',
  show: false
});

const {
  selectedFile,
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  clearFile
} = useFileUpload((imageSrc) => {
  loadImage(imageSrc).then(() => {
    createCanvas(previewContainerRef.value);
    updatePreview();
  });
}, showMessage);

const {
  currentImage,
  canvas,
  loadImage,
  createCanvas,
  updatePreview,
  clearCanvas
} = useImageCanvas();

const { isGenerating: isPdfGenerating, generateImageSplitPDF } =
  usePdfGeneration();

function showMessage(text, type) {
  currentMessage.value = {
    text,
    type,
    show: true
  };
}

function dismissMessage() {
  currentMessage.value.show = false;
}

async function handleImageUpload(files) {
  const success = await handleFileSelect(files, showMessage);
  if (success && generateBtnRef.value) {
    generateBtnRef.value.disabled = false;
  }
}

async function generatePDF() {
  if (!selectedFile.value) {
    showMessage('Please upload an image first', 'error');
    return;
  }

  await generateImageSplitPDF(
    currentImage.value,
    rows.value,
    cols.value,
    showMessage
  );
}

function resetImageSplitter() {
  clearFile();
  dismissMessage();
  rows.value = 2;
  cols.value = 2;
  if (rowsInputRef.value) rowsInputRef.value.value = '2';
  if (colsInputRef.value) colsInputRef.value.value = '2';
  if (generateBtnRef.value) generateBtnRef.value.disabled = true;
  if (previewContainerRef.value) {
    previewContainerRef.value.innerHTML = `
      <div class="shared-preview-placeholder">
        <div class="shared-preview-placeholder-icon">🖼️</div>
        <div>Upload an image to see the grid preview</div>
      </div>
    `;
  }
  showMessage('Reset complete', 'info');
}

watch([selectedFile, rows, cols], () => {
  if (selectedFile.value && previewContainerRef.value) {
    updatePreview();
  }
});

onMounted(() => {});
</script>

<style scoped>
.shared-upload-area {
  padding: 10px 10px;
}

.shared-preview-container {
  flex: 1;
  min-height: 0;
}
</style>
