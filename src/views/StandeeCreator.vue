<template>
  <div class="shared-main-content">
    <div class="shared-desktop-layout">
      <!-- Left: controls -->
      <div class="shared-controls-column">
        <!-- Upload -->
        <FileUploadArea
          ref="uploadAreaRef"
          icon="🎯"
          upload-text="Drop images or click to browse"
          hint-text="JPEG, PNG, WebP (max 5MB each)"
          accept="image/*"
          :multiple="true"
          @files-selected="onFiles"
        />

        <!-- List -->
        <div class="shared-standee-list-section">
          <label class="shared-control-label">
            Selected Standees (<span>{{ standeeImages.length }}</span
            >)
          </label>
          <div class="shared-standee-list">
            <div
              v-if="standeeImages.length === 0"
              class="shared-standee-list-empty"
            >
              No standees uploaded yet
            </div>
            <div
              v-else
              class="shared-standee-item"
              v-for="(t, i) in standeeImages"
              :key="t.id"
            >
              <div class="shared-standee-actions">
                <button
                  class="shared-standee-duplicate"
                  @click="duplicate(t.id)"
                  title="Duplicate standee"
                >
                  +
                </button>
                <button
                  class="shared-standee-item-remove"
                  @click="remove(i)"
                  title="Remove standee"
                >
                  ×
                </button>
              </div>
              <img :src="t.image.src" :alt="t.name" />
              <div class="shared-standee-item-name">{{ t.name }}</div>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="shared-controls-section">
          <div class="shared-control-group">
            <label class="shared-control-label">Standee Settings</label>
            <div class="shared-standee-controls">
              <div class="shared-input-group">
                <label class="shared-input-label">Standee Size</label>
                <select v-model="standeeSize" class="shared-size-select">
                  <option value="small">Small (3cm height)</option>
                  <option value="medium">Medium (4.5cm height)</option>
                  <option value="large">Large (6cm height)</option>
                  <option value="very-large">Very Large (8.5cm height)</option>
                  <!-- <option value="colossal">Colossal (15cm height)</option> -->
                </select>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="shared-control-group">
            <label class="shared-control-label">Actions</label>
            <div class="shared-action-buttons">
              <button
                class="shared-btn shared-btn-primary"
                :disabled="standeeImages.length === 0"
                @click="exportPDF"
              >
                📄 Generate Standee Sheets
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
        <PreviewContainer
          ref="previewRef"
          placeholder-icon="🎯"
          placeholder-text="Upload images to see the sheet preview"
          :show-placeholder="standeeImages.length === 0"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import FileUploadArea from '../components/FileUploadArea.vue';
import PreviewContainer from '../components/PreviewContainer.vue';
import { useStandeeLayout } from '../composables/useStandeeLayout';
import { useStandeePdfGeneration } from '../composables/useStandeePdfGeneration';
import { useStandeePreview } from '../composables/useStandeePreview';
import { useStandeeUpload } from '../composables/useStandeeUpload';

const {
  standeeImages,
  processFiles,
  removeStandee,
  duplicateStandee,
  clearStandees
} = useStandeeUpload();
const { standeeSize, perforationEdges, sheetLayout } = useStandeeLayout();
const { generatePreview, renderStandeeSheet } = useStandeePreview();
const { generateStandeeSheets } = useStandeePdfGeneration();

const uploadAreaRef = ref(null);
const previewRef = ref(null);

async function onFiles(files) {
  console.log('onFiles called with', files.length, 'files');
  const ok = await processFiles(files);
  console.log('processFiles result:', ok);
  if (ok) {
    console.log('Calling drawPreview...');
    drawPreview();
  }
}

async function remove(i) {
  removeStandee(i);
  await nextTick();
  drawPreview();
}

function duplicate(id) {
  const success = duplicateStandee(id);
  if (success) {
    drawPreview();
  }
}

function drawPreview() {
  console.log('drawPreview called, standeeImages:', standeeImages.value.length);
  console.log('previewRef.value:', previewRef.value);

  if (standeeImages.value.length === 0) {
    if (previewRef.value) {
      previewRef.value.resetContainer();
    }
    return;
  }

  console.log('sheetLayout:', sheetLayout.value);
  const container = previewRef.value.getContainer();
  console.log('Preview container:', container);

  // Add CSS diagnostics
  if (container) {
    const containerStyle = window.getComputedStyle(container);
    console.log('Container computed styles:', {
      display: containerStyle.display,
      position: containerStyle.position,
      width: containerStyle.width,
      height: containerStyle.height,
      overflow: containerStyle.overflow,
      visibility: containerStyle.visibility,
      opacity: containerStyle.opacity,
      zIndex: containerStyle.zIndex
    });

    const rect = container.getBoundingClientRect();
    console.log('Container bounding rect:', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right
    });
  }

  generatePreview(sheetLayout.value, standeeImages.value, container);
}

async function exportPDF() {
  await generateStandeeSheets(
    sheetLayout.value,
    standeeImages.value,
    renderStandeeSheet
  );
}

function resetAll() {
  clearStandees();
  if (uploadAreaRef.value) uploadAreaRef.value.resetInput();
  if (previewRef.value) previewRef.value.resetContainer();
}

watch([standeeImages, standeeSize, perforationEdges], async () => {
  await nextTick();
  if (standeeImages.value.length) drawPreview();
});
</script>

<style scoped>
.shared-standee-actions {
  display: flex;
  gap: 4px;
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}

.shared-standee-duplicate,
.shared-standee-item-remove {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.shared-standee-duplicate {
  background: #28a745;
}

.shared-standee-duplicate:hover {
  background: #218838;
}

.shared-standee-item-remove {
  background: #dc3545;
}

.shared-standee-item-remove:hover {
  background: #c82333;
}

.shared-standee-item {
  position: relative;
}

.shared-size-select {
  min-width: 300px;
}

.shared-size-select {
  min-width: 300px;
}
</style>
