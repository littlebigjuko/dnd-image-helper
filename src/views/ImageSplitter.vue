<template>
  <div class="main-content">
    <div ref="messageAreaRef"></div>

    <div class="desktop-layout">
      <div class="controls-column">
        <div class="upload-section">
          <div
            class="upload-area"
            ref="uploadAreaRef"
            @click="fileInputRef?.click()"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            :class="{ dragover: isDragOver }"
          >
            <div class="upload-icon">📁</div>
            <div class="upload-text">
              Drop your image here or click to browse
            </div>
            <div class="upload-hint">
              Supports JPEG, PNG, WebP, GIF (max 10MB)
            </div>
          </div>
          <input
            type="file"
            ref="fileInputRef"
            class="file-input"
            accept="image/*"
            @change="handleImageUpload($event.target.files)"
          />
        </div>

        <div class="controls-section">
          <div class="control-group">
            <label class="control-label">Grid Settings</label>
            <div class="grid-controls">
              <div class="input-group">
                <label class="input-label">Rows</label>
                <input
                  type="number"
                  ref="rowsInputRef"
                  class="number-input"
                  min="1"
                  max="10"
                  v-model.number="rows"
                />
              </div>
              <div class="input-group">
                <label class="input-label">Columns</label>
                <input
                  type="number"
                  ref="colsInputRef"
                  class="number-input"
                  min="1"
                  max="10"
                  v-model.number="cols"
                />
              </div>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">Actions</label>
            <div class="action-buttons">
              <button
                ref="generateBtnRef"
                class="btn btn-primary"
                :disabled="!selectedFile"
                @click="generatePDF"
              >
                📄 Generate PDF
              </button>
              <button
                ref="resetBtnRef"
                class="btn btn-secondary"
                @click="resetImageSplitter"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-column">
        <div class="preview-section">
          <div class="preview-container" ref="previewContainerRef">
            <div class="preview-placeholder">
              <div class="preview-placeholder-icon">🖼️</div>
              <div>Upload an image to see the grid preview</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useFileUpload } from '../composables/useFileUpload';
import { useImageCanvas } from '../composables/useImageCanvas';
import { usePdfGeneration } from '../composables/usePdfGeneration';

const uploadAreaRef = ref(null);
const fileInputRef = ref(null);
const previewContainerRef = ref(null);
const messageAreaRef = ref(null);
const rowsInputRef = ref(null);
const colsInputRef = ref(null);
const generateBtnRef = ref(null);
const resetBtnRef = ref(null);

const rows = ref(2);
const cols = ref(2);

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
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = text;

  if (messageAreaRef.value) {
    messageAreaRef.value.appendChild(messageElement);
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
}

function clearMessages() {
  if (messageAreaRef.value) {
    messageAreaRef.value.innerHTML = '';
  }
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
  clearMessages();
  rows.value = 2;
  cols.value = 2;
  if (rowsInputRef.value) rowsInputRef.value.value = '2';
  if (colsInputRef.value) colsInputRef.value.value = '2';
  if (generateBtnRef.value) generateBtnRef.value.disabled = true;
  if (previewContainerRef.value) {
    previewContainerRef.value.innerHTML = `
      <div class="preview-placeholder">
        <div class="preview-placeholder-icon">🖼️</div>
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
.main-content {
  padding: 10px;
  width: 100%;
}

.desktop-layout {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (min-width: 1025px) {
  .main-content {
    max-width: none;
    padding: 10px;
    height: calc(100vh - 160px);
    overflow: hidden;
  }

  .desktop-layout {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 10px;
    height: 100%;
  }

  .controls-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
  }

  .preview-column {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .preview-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .preview-container {
    flex: 1;
    min-height: 0;
  }

  .controls-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 0;
  }
}

@media (max-width: 1024px) {
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
  }
}

.upload-section {
  margin-bottom: 0;
}

.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 10px 24px;
  text-align: center;
  background: #f8fafc;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: #667eea;
  background: #f0f4ff;
}

.upload-icon {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 0.9rem;
  color: #94a3b8;
}

.file-input {
  display: none;
}

.controls-section {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

.control-group {
  background: #f8fafc;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.control-label {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  display: block;
}

.grid-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.input-group {
  flex: 1;
}

.input-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 4px;
  display: block;
}

.number-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
}

.number-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.preview-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-canvas {
  max-width: 100%;
  display: block;
}

.preview-placeholder {
  text-align: center;
  color: #94a3b8;
  padding: 48px;
}

.preview-placeholder-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.message {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
}

.message.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.message.success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.message.info {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff80;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .controls-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .grid-controls {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .main-content {
    padding: 20px;
  }
}
</style>
