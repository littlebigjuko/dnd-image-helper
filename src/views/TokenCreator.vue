<template>
  <div class="shared-main-content">
    <div class="shared-desktop-layout">
      <!-- Left: controls -->
      <div class="shared-controls-column">
        <!-- Upload -->
        <div class="shared-upload-section">
          <div
            class="shared-upload-area"
            @click="tokenFileInputRef?.click()"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
            @drop.prevent="onDrop"
            :class="{ dragover: isDragOver }"
          >
            <div class="shared-upload-icon">🎯</div>
            <div class="shared-upload-text">Drop images or click to browse</div>
            <div class="shared-upload-hint">JPEG, PNG, WebP (max 5MB each)</div>
          </div>
          <input
            type="file"
            ref="tokenFileInputRef"
            class="shared-file-input"
            accept="image/*"
            multiple
            @change="onFiles($event.target.files)"
          />
        </div>

        <!-- List -->
        <div class="shared-token-list-section">
          <label class="shared-control-label">
            Selected Tokens (<span>{{ tokenImages.length }}</span
            >)
          </label>
          <div class="shared-token-list">
            <div
              v-if="tokenImages.length === 0"
              class="shared-token-list-empty"
            >
              No tokens uploaded yet
            </div>
            <div
              v-else
              class="shared-token-item"
              v-for="(t, i) in tokenImages"
              :key="t.id"
            >
              <button class="shared-token-item-remove" @click="remove(i)">
                ×
              </button>
              <img :src="t.image.src" :alt="t.name" />
              <div class="shared-token-item-name">{{ t.name }}</div>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="shared-controls-section">
          <div class="shared-control-group">
            <label class="shared-control-label">Token Settings</label>
            <div class="shared-token-controls">
              <div class="shared-input-group">
                <label class="shared-input-label">Token Size</label>
                <select v-model="tokenSize" class="shared-size-select">
                  <option value="small">Small (4.5cm height)</option>
                  <option value="medium">Medium (6cm height)</option>
                  <option value="high">High (9cm height)</option>
                </select>
              </div>
              <div class="shared-input-group">
                <label style="display: flex; align-items: center; gap: 8px">
                  <input type="checkbox" v-model="perforationEdges" />
                  <span>Edge perforation dots</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="shared-control-group">
            <label class="shared-control-label">Actions</label>
            <div class="shared-action-buttons">
              <button
                class="shared-btn shared-btn-primary"
                :disabled="tokenImages.length === 0"
                @click="exportPDF"
              >
                📄 Generate Token Sheets
              </button>
              <button class="shared-btn shared-btn-secondary" @click="resetAll">
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: preview -->
      <div class="shared-preview-column">
        <div class="shared-preview-section">
          <div class="shared-preview-container" ref="previewRef">
            <div class="shared-preview-placeholder">
              <div class="shared-preview-placeholder-icon">🎯</div>
              <div>Upload images to see the sheet preview</div>
            </div>
          </div>
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

const { tokenImages, processFiles, removeToken, clearTokens } =
  useTokenUpload();
const { tokenSize, perforationEdges, sheetLayout } = useTokenLayout();
const { generatePreview, renderTokenSheet } = useTokenPreview();
const { generateTokenSheets } = useTokenPdfGeneration();

const tokenFileInputRef = ref(null);
const previewRef = ref(null);
const isDragOver = ref(false);

async function onFiles(files) {
  const ok = await processFiles(files);
  if (ok) drawPreview();
}

async function onDrop(e) {
  isDragOver.value = false;
  if (e.dataTransfer?.files?.length) await onFiles(e.dataTransfer.files);
}

function remove(i) {
  removeToken(i);
  drawPreview();
}

function drawPreview() {
  if (tokenImages.value.length === 0) return;
  generatePreview(sheetLayout.value, tokenImages.value, previewRef.value);
}

async function exportPDF() {
  await generateTokenSheets(
    sheetLayout.value,
    tokenImages.value,
    renderTokenSheet
  );
}

function resetAll() {
  clearTokens();
  if (tokenFileInputRef.value) tokenFileInputRef.value.value = '';
  previewRef.value.innerHTML = `<div class="shared-preview-placeholder">
    <div class="shared-preview-placeholder-icon">🎯</div>
    <div>Upload images to see the sheet preview</div>
  </div>`;
}

watch([tokenImages, tokenSize, perforationEdges], () => {
  if (tokenImages.value.length) drawPreview();
});
</script>
