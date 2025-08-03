<template>
  <div class="main-content">
    <div ref="tokenMessageAreaRef"></div>

    <div class="upload-section">
      <div
        class="upload-area"
        ref="tokenUploadAreaRef"
        @click="tokenFileInputRef?.click()"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleTokenDrop"
        :class="{ dragover: isDragOver }"
      >
        <div class="upload-icon">🎯</div>
        <div class="upload-text">
          Drop your token images here or click to browse
        </div>
        <div class="upload-hint">
          Supports JPEG, PNG, WebP (max 5MB each, up to 50 tokens)
        </div>
      </div>
      <input
        type="file"
        ref="tokenFileInputRef"
        class="file-input"
        accept="image/*"
        multiple
        @change="handleTokenUpload($event.target.files)"
      />
    </div>

    <div class="token-list-section">
      <label class="control-label"
        >Selected Tokens (<span>{{ tokenImages.length }}</span
        >)</label
      >
      <div class="token-list" ref="tokenListRef">
        <div v-if="tokenImages.length === 0" class="token-list-empty">
          No tokens uploaded yet
        </div>
        <div
          v-else
          class="token-item"
          v-for="(token, index) in tokenImages"
          :key="index"
        >
          <button class="token-item-remove" @click="removeTokenItem(index)">
            ×
          </button>
          <img :src="token.image.src" :alt="token.name" />
          <div class="token-item-name">{{ token.name }}</div>
        </div>
      </div>
    </div>

    <div class="controls-section">
      <div class="control-group">
        <label class="control-label">Token Settings</label>
        <div class="token-controls">
          <div class="input-group">
            <label class="input-label">Token Size</label>
            <select
              ref="tokenSizeSelectRef"
              class="size-select"
              v-model="tokenSize"
            >
              <option value="small">Small (3cm height)</option>
              <option value="medium">Medium (4.5cm height)</option>
              <option value="high">High (6cm height)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Actions</label>
        <div class="action-buttons">
          <button
            ref="generateTokensBtnRef"
            class="btn btn-primary"
            :disabled="tokenImages.length === 0"
            @click="generateTokenPDF"
          >
            📄 Generate Token Sheets
          </button>
          <button
            ref="resetTokensBtnRef"
            class="btn btn-secondary"
            @click="resetTokenCreator"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <label class="control-label">Preview</label>
      <div class="preview-container" ref="tokenPreviewContainerRef">
        <div class="preview-placeholder">
          <div class="preview-placeholder-icon">🎯</div>
          <div>Upload token images to see the sheet preview</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTokenLayout } from '../composables/useTokenLayout';
import { useTokenPdfGeneration } from '../composables/useTokenPdfGeneration';
import { useTokenPreview } from '../composables/useTokenPreview';
import { useTokenUpload } from '../composables/useTokenUpload';

const tokenUploadAreaRef = ref(null);
const tokenFileInputRef = ref(null);
const tokenListRef = ref(null);
const tokenSizeSelectRef = ref(null);
const generateTokensBtnRef = ref(null);
const resetTokensBtnRef = ref(null);
const tokenPreviewContainerRef = ref(null);
const tokenMessageAreaRef = ref(null);

const isDragOver = ref(false);

const {
  tokenImages,
  isUploading,
  processFiles: processTokenFiles,
  removeToken,
  clearTokens
} = useTokenUpload();

const {
  tokenSize,
  tokenSizes,
  sheetLayout,
  updateTokenSize,
  calculateTotalPages
} = useTokenLayout();

const {
  canvas: tokenCanvas,
  generatePreview: generateTokenPreview,
  renderTokenSheet
} = useTokenPreview();

const { isGenerating: isTokenPdfGenerating, generateTokenSheets } =
  useTokenPdfGeneration();

function handleDragOver() {
  isDragOver.value = true;
}

function handleDragLeave() {
  isDragOver.value = false;
}

function showMessage(text, type) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = text;

  if (tokenMessageAreaRef.value) {
    tokenMessageAreaRef.value.appendChild(messageElement);
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
}

function clearMessages() {
  if (tokenMessageAreaRef.value) {
    tokenMessageAreaRef.value.innerHTML = '';
  }
}

async function handleTokenUpload(files) {
  const success = await processTokenFiles(files, (msg, type) =>
    showMessage(msg, type)
  );
  if (success) {
    updateTokenPreview();
  }
}

async function handleTokenDrop(event) {
  isDragOver.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    await handleTokenUpload(files);
  }
}

function removeTokenItem(index) {
  removeToken(index, (msg, type) => showMessage(msg, type));
  updateTokenPreview();
}

function updateTokenPreview() {
  if (!tokenPreviewContainerRef.value) {
    return;
  }

  try {
    generateTokenPreview(
      sheetLayout.value,
      tokenImages.value,
      tokenPreviewContainerRef.value
    );
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function generateTokenPDF() {
  await generateTokenSheets(
    sheetLayout.value,
    tokenImages.value,
    renderTokenSheet,
    (msg, type) => showMessage(msg, type)
  );
}

function resetTokenCreator() {
  clearTokens();
  clearMessages();
  tokenSize.value = 'medium';
  if (tokenFileInputRef.value) tokenFileInputRef.value.value = '';

  if (tokenPreviewContainerRef.value) {
    tokenPreviewContainerRef.value.innerHTML = `
      <div class="preview-placeholder">
        <div class="preview-placeholder-icon">🎯</div>
        <div>Upload token images to see the sheet preview</div>
      </div>
    `;
  }

  showMessage('Reset complete', 'info');
}

watch([tokenImages, tokenSize], () => {
  if (tokenImages.value.length > 0) {
    updateTokenPreview();
  }
});
</script>

<style scoped>
.main-content {
  padding: 32px;
}

.upload-section {
  margin-bottom: 32px;
}

.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 48px 24px;
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
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
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

.input-group {
  flex: 1;
}

.input-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 4px;
  display: block;
}

.action-buttons {
  display: flex;
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

.preview-section {
  margin-bottom: 32px;
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
  max-height: 600px;
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

.token-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.size-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.size-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.token-list-section {
  margin-bottom: 32px;
}

.token-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  min-height: 120px;
}

.token-item {
  position: relative;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  transition: all 0.2s ease;
}

.token-item:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.token-item img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.token-item-name {
  font-size: 0.875rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.token-item-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.token-item-remove:hover {
  background: #dc2626;
}

.token-list-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #94a3b8;
  padding: 32px;
  font-style: italic;
}

@media (max-width: 768px) {
  .controls-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .token-controls {
    flex-direction: column;
    gap: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .main-content {
    padding: 20px;
  }

  .token-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
}
</style>
