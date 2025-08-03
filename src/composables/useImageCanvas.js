import { computed, ref } from 'vue';

export function useImageCanvas() {
  const currentImage = ref(null);
  const canvas = ref(null);
  const ctx = ref(null);
  const rows = ref(2);
  const cols = ref(2);

  const canvasReady = computed(
    () => currentImage.value && canvas.value && ctx.value
  );

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        currentImage.value = img;
        resolve(img);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = src;
    });
  }

  function createCanvas(container) {
    if (!currentImage.value) {
      return;
    }

    if (canvas.value) {
      canvas.value.remove();
    }

    canvas.value = document.createElement('canvas');
    canvas.value.className = 'preview-canvas';
    ctx.value = canvas.value.getContext('2d');

    const getMaxDisplaySize = () => {
      if (window.innerWidth >= 1025) {
        return 1200;
      } else if (window.innerWidth >= 768) {
        return 800;
      } else {
        return 600;
      }
    };

    const maxDisplaySize = getMaxDisplaySize();
    const qualityMultiplier = 4;
    const scale = Math.min(
      maxDisplaySize / currentImage.value.width,
      maxDisplaySize / currentImage.value.height,
      1
    );

    const displayWidth = currentImage.value.width * scale;
    const displayHeight = currentImage.value.height * scale;

    canvas.value.width = displayWidth * qualityMultiplier;
    canvas.value.height = displayHeight * qualityMultiplier;
    canvas.value.style.width = `${displayWidth}px`;
    canvas.value.style.height = `${displayHeight}px`;

    container.innerHTML = '';
    container.appendChild(canvas.value);
  }

  function updatePreview() {
    if (!canvasReady.value) {
      return;
    }

    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.value.imageSmoothingEnabled = true;
    ctx.value.imageSmoothingQuality = 'high';
    ctx.value.textRenderingOptimization = 'optimizeQuality';
    ctx.value.drawImage(
      currentImage.value,
      0,
      0,
      canvas.value.width,
      canvas.value.height
    );

    drawGrid();
  }

  function drawGrid() {
    if (!canvasReady.value) {
      return;
    }

    const width = canvas.value.width;
    const height = canvas.value.height;
    const pieceWidth = width / cols.value;
    const pieceHeight = height / rows.value;

    const GRID_LINE_WIDTH = 1;
    const GRID_LINE_COLOR = '#CCCCCC';
    const CROP_MARK_LENGTH = 20;
    const CROP_MARK_COLOR = '#333333';

    ctx.value.save();
    ctx.value.lineWidth = GRID_LINE_WIDTH;
    ctx.value.strokeStyle = GRID_LINE_COLOR;
    ctx.value.setLineDash([2, 2]);
    ctx.value.imageSmoothingEnabled = true;
    ctx.value.imageSmoothingQuality = 'high';

    for (let i = 1; i < cols.value; i++) {
      const x = pieceWidth * i;
      ctx.value.beginPath();
      ctx.value.moveTo(x, 0);
      ctx.value.lineTo(x, height);
      ctx.value.stroke();
    }

    for (let i = 1; i < rows.value; i++) {
      const y = pieceHeight * i;
      ctx.value.beginPath();
      ctx.value.moveTo(0, y);
      ctx.value.lineTo(width, y);
      ctx.value.stroke();
    }

    ctx.value.restore();
    ctx.value.save();
    ctx.value.setLineDash([]);
    ctx.value.strokeStyle = CROP_MARK_COLOR;
    ctx.value.lineWidth = 2;
    ctx.value.imageSmoothingEnabled = true;
    ctx.value.imageSmoothingQuality = 'high';

    for (let row = 0; row < rows.value; row++) {
      for (let col = 0; col < cols.value; col++) {
        const x = col * pieceWidth;
        const y = row * pieceHeight;
        const markLength = CROP_MARK_LENGTH;

        ctx.value.beginPath();
        ctx.value.moveTo(x - markLength, y);
        ctx.value.lineTo(x, y);
        ctx.value.stroke();

        ctx.value.beginPath();
        ctx.value.moveTo(x, y - markLength);
        ctx.value.lineTo(x, y);
        ctx.value.stroke();

        ctx.value.beginPath();
        ctx.value.moveTo(x + pieceWidth, y);
        ctx.value.lineTo(x + pieceWidth + markLength, y);
        ctx.value.stroke();

        ctx.value.beginPath();
        ctx.value.moveTo(x + pieceWidth, y - markLength);
        ctx.value.lineTo(x + pieceWidth, y);
        ctx.value.stroke();

        ctx.value.beginPath();
        ctx.value.moveTo(x - markLength, y + pieceHeight);
        ctx.value.lineTo(x, y + pieceHeight);
        ctx.value.stroke();

        ctx.value.beginPath();
        ctx.value.moveTo(x, y + pieceHeight);
        ctx.value.lineTo(x, y + pieceHeight + markLength);
        ctx.value.stroke();

        ctx.value.beginPath();
        ctx.value.moveTo(x + pieceWidth, y + pieceHeight);
        ctx.value.lineTo(x + pieceWidth + markLength, y + pieceHeight);
        ctx.value.stroke();

        ctx.value.beginPath();
        ctx.value.moveTo(x + pieceWidth, y + pieceHeight);
        ctx.value.lineTo(x + pieceWidth, y + pieceHeight + markLength);
        ctx.value.stroke();
      }
    }
    ctx.value.restore();
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
    clearCanvas
  };
}
