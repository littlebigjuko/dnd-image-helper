import { ref } from 'vue';

const PREVIEW_SCALE = 8;
const GRID_LINE_WIDTH = 1;
const CUT_LINE_COLOR = '#333333';
const FOLD_LINE_COLOR = '#666666';
const CUT_LINE_DASH = [];
const FOLD_LINE_DASH = [3, 2];
const REGISTRATION_MARK_SIZE = 3;
const REGISTRATION_MARK_OFFSET = 5;

export function useTokenPreview() {
  const canvas = ref(null);
  const isGeneratingPreview = ref(false);

  function createCanvas(layout, containerWidth = 600) {
    const canvasElement = document.createElement('canvas');
    canvasElement.className = 'preview-canvas';
    const ctx = canvasElement.getContext('2d');

    const devicePixelRatio = window.devicePixelRatio || 1;
    const qualityMultiplier = 4;
    const aspectRatio = layout.pageSize.height / layout.pageSize.width;
    const maxWidth = Math.min(containerWidth - 32, 600);
    const displayWidth = maxWidth;
    const displayHeight = displayWidth * aspectRatio;

    canvasElement.width = displayWidth * devicePixelRatio * qualityMultiplier;
    canvasElement.height = displayHeight * devicePixelRatio * qualityMultiplier;

    canvasElement.style.width = `${displayWidth}px`;
    canvasElement.style.height = `${displayHeight}px`;
    canvasElement.style.maxWidth = '100%';

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.textRenderingOptimization = 'optimizeQuality';

    const scale =
      (displayWidth / layout.pageSize.width) *
      devicePixelRatio *
      qualityMultiplier;
    ctx.scale(scale, scale);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, layout.pageSize.width, layout.pageSize.height);

    return { canvasElement, ctx };
  }

  function drawTokenImage(ctx, image, x, y, width, height, isFlipped) {
    ctx.save();

    const padding = 2;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    const scale = Math.min(drawWidth / image.width, drawHeight / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    const drawX = x + padding + (drawWidth - scaledWidth) / 2;
    const drawY = y + padding + (drawHeight - scaledHeight) / 2;

    if (isFlipped) {
      ctx.translate(drawX + scaledWidth / 2, drawY + scaledHeight / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(
        image,
        -scaledWidth / 2,
        -scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );
    } else {
      ctx.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);
    }

    ctx.restore();
  }

  function drawRegistrationMarks(ctx, pageSize) {
    ctx.strokeStyle = CUT_LINE_COLOR;
    ctx.lineWidth = GRID_LINE_WIDTH;
    ctx.setLineDash(CUT_LINE_DASH);

    const markSize = REGISTRATION_MARK_SIZE;
    const offset = REGISTRATION_MARK_OFFSET;

    const corners = [
      { x: offset, y: offset },
      { x: pageSize.width - offset, y: offset },
      { x: offset, y: pageSize.height - offset },
      { x: pageSize.width - offset, y: pageSize.height - offset }
    ];

    corners.forEach((corner) => {
      ctx.beginPath();
      ctx.moveTo(corner.x - markSize, corner.y);
      ctx.lineTo(corner.x + markSize, corner.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(corner.x, corner.y - markSize);
      ctx.lineTo(corner.x, corner.y + markSize);
      ctx.stroke();
    });
  }

  function drawGridLines(ctx, layout) {
    const {
      pageSize,
      pageMargin,
      unitDims,
      tokenDims,
      tokensPerRow,
      maxRows,
      gridGap,
      standingWhiteSpace,
      foldGap
    } = layout;

    ctx.lineWidth = GRID_LINE_WIDTH;

    ctx.strokeStyle = CUT_LINE_COLOR;
    ctx.setLineDash(CUT_LINE_DASH);

    for (let row = 0; row <= maxRows; row++) {
      for (let col = 0; col <= tokensPerRow; col++) {
        const unitX = pageMargin + col * (unitDims.width + gridGap);
        const unitY = pageMargin + row * (unitDims.height + gridGap);

        if (row < maxRows) {
          ctx.beginPath();
          ctx.moveTo(unitX, unitY);
          ctx.lineTo(unitX + unitDims.width, unitY);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(unitX, unitY + unitDims.height);
          ctx.lineTo(unitX + unitDims.width, unitY + unitDims.height);
          ctx.stroke();
        }

        if (col < tokensPerRow) {
          ctx.beginPath();
          ctx.moveTo(unitX, unitY);
          ctx.lineTo(unitX, unitY + unitDims.height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(unitX + unitDims.width, unitY);
          ctx.lineTo(unitX + unitDims.width, unitY + unitDims.height);
          ctx.stroke();
        }
      }
    }

    ctx.strokeStyle = FOLD_LINE_COLOR;
    ctx.setLineDash(FOLD_LINE_DASH);

    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < tokensPerRow; col++) {
        const unitX = pageMargin + col * (unitDims.width + gridGap);
        const unitY = pageMargin + row * (unitDims.height + gridGap);

        const foldLineY = unitY + standingWhiteSpace + tokenDims.height;
        ctx.beginPath();
        ctx.moveTo(unitX, foldLineY);
        ctx.lineTo(unitX + unitDims.width, foldLineY);
        ctx.stroke();
      }
    }

    ctx.setLineDash([]);

    drawRegistrationMarks(ctx, pageSize);
  }

  function renderTokenSheet(ctx, layout, tokens, pageIndex) {
    const {
      pageSize,
      pageMargin,
      unitDims,
      tokenDims,
      tokensPerRow,
      maxRows,
      gridGap,
      standingWhiteSpace,
      foldGap
    } = layout;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, pageSize.width, pageSize.height);

    drawGridLines(ctx, layout);

    tokens.forEach((token, index) => {
      const col = index % tokensPerRow;
      const row = Math.floor(index / tokensPerRow);

      if (row >= maxRows) return;

      const unitX = pageMargin + col * (unitDims.width + gridGap);
      const unitY = pageMargin + row * (unitDims.height + gridGap);

      const flippedY = unitY + standingWhiteSpace;
      const originalY = flippedY + tokenDims.height + foldGap;

      drawTokenImage(
        ctx,
        token.image,
        unitX,
        flippedY,
        tokenDims.width,
        tokenDims.height,
        true
      );
      drawTokenImage(
        ctx,
        token.image,
        unitX,
        originalY,
        tokenDims.width,
        tokenDims.height,
        false
      );
    });
  }

  function generatePreview(layout, tokens, container) {
    if (tokens.length === 0) {
      container.innerHTML = `
        <div class="preview-placeholder">
          <div class="preview-placeholder-icon">🎯</div>
          <div>Upload token images to see the sheet preview</div>
        </div>
      `;
      return;
    }

    try {
      isGeneratingPreview.value = true;

      if (canvas.value) {
        canvas.value.remove();
      }

      const containerWidth = container.offsetWidth || 600;
      const { canvasElement, ctx } = createCanvas(layout, containerWidth);
      canvas.value = canvasElement;

      renderTokenSheet(ctx, layout, tokens.slice(0, layout.tokensPerPage), 0);

      container.innerHTML = '';
      container.appendChild(canvasElement);
    } catch (error) {
      console.error('Preview generation error:', error);
      container.innerHTML = `
        <div class="preview-placeholder">
          <div class="preview-placeholder-icon">⚠️</div>
          <div>Error generating preview: ${error.message}</div>
        </div>
      `;
    } finally {
      isGeneratingPreview.value = false;
    }
  }

  return {
    canvas,
    isGeneratingPreview,
    generatePreview,
    renderTokenSheet
  };
}
