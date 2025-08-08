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
              <div class="shared-standee-metadata">
                <div class="metadata-row">
                  <label>Type:</label>
                  <select
                    :value="t.combatType || 'none'"
                    @change="
                      updateStandeeMetadataValue(
                        t.id,
                        'combatType',
                        $event.target.value
                      )
                    "
                    class="metadata-select"
                  >
                    <option value="none">None</option>
                    <option value="melee">Melee</option>
                    <option value="ranged">Ranged</option>
                  </select>
                </div>
                <div class="metadata-row">
                  <label class="metadata-checkbox-label">
                    <input
                      type="checkbox"
                      :checked="t.isBoss || false"
                      @change="
                        updateStandeeMetadataValue(
                          t.id,
                          'isBoss',
                          $event.target.checked
                        )
                      "
                    />
                    Boss
                  </label>
                </div>
                <div class="metadata-row" v-if="t.duplicateNumber > 1">
                  <span class="duplicate-indicator"
                    >Copy #{{ t.duplicateNumber }}</span
                  >
                </div>
              </div>
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

          <!-- Batch Metadata Operations -->
          <div class="shared-control-group" v-if="standeeImages.length > 0">
            <label class="shared-control-label">Batch Operations</label>
            <div class="batch-metadata-controls">
              <div class="batch-control-row">
                <label>Apply to All:</label>
                <select v-model="batchCombatType" class="batch-select">
                  <option value="none">None</option>
                  <option value="melee">Melee</option>
                  <option value="ranged">Ranged</option>
                </select>
                <button @click="applyBatchCombatType" class="batch-btn">
                  Set Type
                </button>
              </div>
              <div class="batch-control-row">
                <button @click="applyBatchBossStatus(true)" class="batch-btn">
                  Mark All Boss
                </button>
                <button @click="applyBatchBossStatus(false)" class="batch-btn">
                  Clear All Boss
                </button>
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
import { useStandeeMetadata } from '../composables/useStandeeMetadata';
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
const {
  enhanceStandeeWithMetadata,
  updateStandeeMetadata,
  applyMetadataToAll,
  assignDuplicateNumbers,
  clearHashCache
} = useStandeeMetadata();

const uploadAreaRef = ref(null);
const previewRef = ref(null);
const batchCombatType = ref('none');

function updateStandeeMetadataValue(standeeId, key, value) {
  standeeImages.value = updateStandeeMetadata(standeeImages.value, standeeId, {
    [key]: value
  });
}

function applyBatchCombatType() {
  standeeImages.value = applyMetadataToAll(standeeImages.value, {
    combatType: batchCombatType.value
  });
}

function applyBatchBossStatus(isBoss) {
  standeeImages.value = applyMetadataToAll(standeeImages.value, { isBoss });
}

async function onFiles(files) {
  const ok = await processFiles(files);

  if (ok) {
    await enhanceAllStandeesWithMetadata();
    drawPreview();
  }
}

async function enhanceAllStandeesWithMetadata() {
  const enhanced = [];
  for (const standee of standeeImages.value) {
    const enhancedStandee = await enhanceStandeeWithMetadata(standee, enhanced);
    enhanced.push(enhancedStandee);
  }

  const withCorrectDuplicateNumbers = assignDuplicateNumbers(enhanced);
  standeeImages.value.splice(
    0,
    standeeImages.value.length,
    ...withCorrectDuplicateNumbers
  );
}

async function enhanceSingleStandee(standeeIndex) {
  const standee = standeeImages.value[standeeIndex];
  if (!standee || standee.imageHash) return;

  const enhancedStandee = await enhanceStandeeWithMetadata(
    standee,
    standeeImages.value.slice(0, standeeIndex)
  );

  standeeImages.value.splice(standeeIndex, 1, enhancedStandee);

  const withCorrectDuplicateNumbers = assignDuplicateNumbers(
    standeeImages.value
  );
  standeeImages.value.splice(
    0,
    standeeImages.value.length,
    ...withCorrectDuplicateNumbers
  );
}

async function remove(i) {
  removeStandee(i);
  await nextTick();
  drawPreview();
}

async function duplicate(id) {
  const success = duplicateStandee(id);

  if (success) {
    const withCorrectDuplicateNumbers = assignDuplicateNumbers(
      standeeImages.value
    );
    standeeImages.value.splice(
      0,
      standeeImages.value.length,
      ...withCorrectDuplicateNumbers
    );
    drawPreview();
  }
}

function drawPreview() {
  if (standeeImages.value.length === 0) {
    if (previewRef.value) {
      previewRef.value.resetContainer();
    }
    return;
  }

  const container = previewRef.value.getContainer();
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
  clearHashCache();
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

.shared-standee-metadata {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 12px;
}

.metadata-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.metadata-row:last-child {
  margin-bottom: 0;
}

.metadata-row label {
  font-weight: 500;
  color: #495057;
  margin-right: 8px;
}

.metadata-select {
  padding: 2px 4px;
  border: 1px solid #ced4da;
  border-radius: 3px;
  font-size: 11px;
  background: white;
}

.metadata-checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.metadata-checkbox-label input[type='checkbox'] {
  margin: 0;
}

.duplicate-indicator {
  font-size: 10px;
  color: #6c757d;
  font-style: italic;
}

.batch-metadata-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.batch-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-control-row label {
  font-weight: 500;
  color: #495057;
  min-width: 80px;
}

.batch-select {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 12px;
}

.batch-btn {
  padding: 4px 8px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.batch-btn:hover {
  background: #0056b3;
}
</style>
