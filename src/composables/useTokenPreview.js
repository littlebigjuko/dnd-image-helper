import { ref } from 'vue';

const GRID_LINE_WIDTH = 1;
const CUT_LINE_COLOR = '#333333';
const FOLD_LINE_COLOR = '#666666';
const CUT_LINE_DASH = [6, 3];
const FOLD_LINE_DASH = [3, 2];

// Perforation dots (in mm)
const DOT_RADIUS = 0.6;
const DOT_SPACING = 5;
const PANEL_OVERLAP_MM = 1.2; // stronger overlap at fold to remove any visible seam

export function useTokenPreview() {
  const canvas = ref(null);

  function createCanvas(layout, containerWidth = 600) {
    const el = document.createElement('canvas');
    el.className = 'preview-canvas';
    const ctx = el.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const quality = 4;

    // Layout is in mm. We scale so that 1 layout mm maps consistently on screen.
    const aspect = layout.pageSize.height / layout.pageSize.width;
    const displayW = Math.min((containerWidth || 600) - 32, 600);
    const displayH = displayW * aspect;

    el.width = Math.max(1, Math.floor(displayW * dpr * quality));
    el.height = Math.max(1, Math.floor(displayH * dpr * quality));
    el.style.width = `${displayW}px`;
    el.style.height = `${displayH}px`;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scale = (displayW / layout.pageSize.width) * dpr * quality;
    ctx.scale(scale, scale);

    // White page background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, layout.pageSize.width, layout.pageSize.height);

    return { el, ctx };
  }

  // Draw image with CSS-like "cover" behavior, optionally rotated 180°
  function drawImageCover(ctx, img, x, y, w, h, rotate180 = false) {
    const s = Math.max(w / img.width, h / img.height);
    const sw = w / s;
    const sh = h / s;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;

    ctx.save();
    if (rotate180) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    }
    ctx.restore();
  }

  // Single shared dashed grid + internal separators + fold lines
  function drawGrid(ctx, L) {
    const {
      pageMargin,
      unitDims,
      tokenDims,
      tokensPerRow,
      maxRows,
      gridGap,
      standingWhiteSpace
    } = L;

    const x0 = pageMargin;
    const y0 = pageMargin;
    const gridW = tokensPerRow * unitDims.width + (tokensPerRow - 1) * gridGap;
    const gridH = maxRows * unitDims.height + (maxRows - 1) * gridGap;

    ctx.lineWidth = GRID_LINE_WIDTH;

    // Outer cut rectangle
    ctx.strokeStyle = CUT_LINE_COLOR;
    ctx.setLineDash(CUT_LINE_DASH);
    ctx.strokeRect(x0, y0, gridW, gridH);

    // Inner vertical separators
    for (let c = 1; c < tokensPerRow; c++) {
      const x = x0 + c * unitDims.width + (c - 1) * gridGap;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.lineTo(x, y0 + gridH);
      ctx.stroke();
    }

    // Inner horizontal separators
    for (let r = 1; r < maxRows; r++) {
      const y = y0 + r * unitDims.height + (r - 1) * gridGap;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + gridW, y);
      ctx.stroke();
    }

    // Fold line across center of each unit
    ctx.strokeStyle = FOLD_LINE_COLOR;
    ctx.setLineDash(FOLD_LINE_DASH);
    for (let r = 0; r < maxRows; r++) {
      const yFold =
        y0 +
        r * (unitDims.height + gridGap) +
        standingWhiteSpace +
        tokenDims.height;
      ctx.beginPath();
      ctx.moveTo(x0, yFold);
      ctx.lineTo(x0 + gridW, yFold);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  function drawPerforationDots(ctx, L) {
    const { pageMargin, unitDims, tokensPerRow, maxRows, gridGap } = L;
    ctx.save();
    ctx.fillStyle = '#000';

    for (let r = 0; r < maxRows; r++) {
      for (let c = 0; c < tokensPerRow; c++) {
        const ux = pageMargin + c * (unitDims.width + gridGap);
        const uy = pageMargin + r * (unitDims.height + gridGap);
        const xL = ux + 1; // 1mm inset
        const xR = ux + unitDims.width - 1;
        const yStart = uy + 2;
        const yEnd = uy + unitDims.height - 2;

        for (let y = yStart; y <= yEnd; y += DOT_SPACING) {
          ctx.beginPath();
          ctx.arc(xL, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(xR, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  function renderTokenSheet(ctx, L, tokens /* pageIndex not used here */) {
    // Clear page
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, L.pageSize.width, L.pageSize.height);

    // Draw tokens
    tokens.forEach((t, i) => {
      const col = i % L.tokensPerRow;
      const row = Math.floor(i / L.tokensPerRow);
      if (row >= L.maxRows) return;

      const ux = L.pageMargin + col * (L.unitDims.width + L.gridGap);
      const uy = L.pageMargin + row * (L.unitDims.height + L.gridGap);

      const topY = uy + L.standingWhiteSpace; // flipped
      const bottomY = topY + L.tokenDims.height + L.foldGap; // upright

      // draw with a tiny overlap so the two halves meet without a gap
      drawImageCover(
        ctx,
        t.image,
        ux,
        topY,
        L.tokenDims.width,
        L.tokenDims.height + PANEL_OVERLAP_MM,
        true
      );
      drawImageCover(
        ctx,
        t.image,
        ux,
        bottomY - PANEL_OVERLAP_MM,
        L.tokenDims.width,
        L.tokenDims.height + PANEL_OVERLAP_MM,
        false
      );
    });
    if (L.perforationEdges) drawPerforationDots(ctx, L);
    drawGrid(ctx, L);
  }

  function generatePreview(layout, tokens, containerEl) {
    if (!layout || !tokens?.length || !containerEl) return;

    // Reset previous canvas
    if (canvas.value) {
      try {
        canvas.value.remove();
      } catch {}
      canvas.value = null;
    }

    const { el, ctx } = createCanvas(layout, containerEl.offsetWidth || 600);
    canvas.value = el;

    // Only render up to one page’s worth of tokens
    const batch = tokens.slice(0, layout.tokensPerPage ?? tokens.length);
    renderTokenSheet(ctx, layout, batch, 0);

    containerEl.innerHTML = '';
    containerEl.appendChild(el);
  }

  return {
    canvas,
    generatePreview,
    renderTokenSheet
  };
}
