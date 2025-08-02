import { computed, ref } from "vue";

export function useImageCanvas() {
  const currentImage = ref(null);
  const canvas = ref(null);
  const ctx = ref(null);
  const rows = ref(2);
  const cols = ref(2);

  const canvasReady = computed(() => currentImage.value && canvas.value && ctx.value);

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        currentImage.value = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  function createCanvas(container) {
    if (canvas.value) {
      canvas.value.remove();
    }

    canvas.value = document.createElement("canvas");
    canvas.value.className = "preview-canvas";
    ctx.value = canvas.value.getContext("2d");

    const maxDisplaySize = 800;
    const scale = Math.min(
      maxDisplaySize / currentImage.value.width,
      maxDisplaySize / currentImage.value.height,
      1
    );

    canvas.value.width = currentImage.value.width * scale;
    canvas.value.height = currentImage.value.height * scale;

    container.innerHTML = "";
    container.appendChild(canvas.value);
  }

  function updatePreview() {
    if (!canvasReady.value) {
      return;
    }

    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.value.drawImage(currentImage.value, 0, 0, canvas.value.width, canvas.value.height);

    drawGrid();
  }

  function drawGrid() {
    if (!canvasReady.value) {
      return;
    }

    const width = canvas.value.width;
    const height = canvas.value.height;

    ctx.value.strokeStyle = "#667eea";
    ctx.value.lineWidth = 2;
    ctx.value.setLineDash([5, 5]);

    for (let i = 1; i < cols.value; i++) {
      const x = (width / cols.value) * i;
      ctx.value.beginPath();
      ctx.value.moveTo(x, 0);
      ctx.value.lineTo(x, height);
      ctx.value.stroke();
    }

    for (let i = 1; i < rows.value; i++) {
      const y = (height / rows.value) * i;
      ctx.value.beginPath();
      ctx.value.moveTo(0, y);
      ctx.value.lineTo(width, y);
      ctx.value.stroke();
    }

    ctx.value.setLineDash([]);
  }

  function clearCanvas() {
    currentImage.value = null;
    canvas.value = null;
    ctx.value = null;
  }

  return {
    currentImage,
    canvas,
    rows,
    cols,
    canvasReady,
    loadImage,
    createCanvas,
    updatePreview,
    clearCanvas,
  };
}
