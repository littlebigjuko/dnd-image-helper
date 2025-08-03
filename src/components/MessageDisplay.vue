<template>
  <Transition name="message" appear>
    <div
      v-if="show"
      :class="['message-display', `message-display--${type}`]"
      @click="handleDismiss"
    >
      <div class="message-display__content">
        {{ message }}
      </div>
      <button
        class="message-display__close"
        @click.stop="handleDismiss"
        aria-label="Dismiss message"
      >
        ×
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['error', 'success', 'info'].includes(value)
  },
  show: {
    type: Boolean,
    default: false
  },
  autoHide: {
    type: Boolean,
    default: true
  },
  hideDelay: {
    type: Number,
    default: 3000
  }
});

const emit = defineEmits(['dismiss']);

let autoHideTimeout = null;

function handleDismiss() {
  clearAutoHideTimeout();
  emit('dismiss');
}

function clearAutoHideTimeout() {
  if (autoHideTimeout) {
    clearTimeout(autoHideTimeout);
    autoHideTimeout = null;
  }
}

function startAutoHideTimer() {
  if (props.autoHide && props.type === 'success') {
    autoHideTimeout = setTimeout(() => {
      handleDismiss();
    }, props.hideDelay);
  }
}

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      startAutoHideTimer();
    } else {
      clearAutoHideTimeout();
    }
  }
);

onMounted(() => {
  if (props.show) {
    startAutoHideTimer();
  }
});
</script>

<style scoped>
.message-display {
  position: fixed;
  bottom: 24px;
  left: 24px;
  right: 24px;
  z-index: 1000;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px 48px 16px 16px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-display__content {
  flex: 1;
  margin-right: 12px;
}

.message-display__close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-display__close:hover {
  opacity: 1;
}

.message-display--error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.message-display--success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.message-display--info {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

@media (max-width: 768px) {
  .message-display {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
}
</style>
