import { ref } from 'vue';

const GRID_LINE_WIDTH = 0.35;
const CUT_LINE_COLOR = '#333333';
const FOLD_LINE_COLOR = '#666666';
const CUT_LINE_DASH = [6, 3];
const FOLD_LINE_DASH = [3, 2];

// Perforation dots (in mm)
const DOT_RADIUS = 0.6;
const DOT_SPACING = 5;
const PANEL_OVERLAP_MM = 1.2; // stronger overlap at fold to remove any visible seam

export function useStandeePreview() {
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
      standeeDims,
      standeesPerRow,
      maxRows,
      gridGap,
      standingWhiteSpace
    } = L;

    const x0 = pageMargin;
    const y0 = pageMargin;
    const gridW =
      standeesPerRow * unitDims.width + (standeesPerRow - 1) * gridGap;
    const gridH = maxRows * unitDims.height + (maxRows - 1) * gridGap;

    ctx.lineWidth = GRID_LINE_WIDTH;

    // Outer cut rectangle
    ctx.strokeStyle = CUT_LINE_COLOR;
    ctx.setLineDash(CUT_LINE_DASH);
    ctx.strokeRect(x0, y0, gridW, gridH);

    // Use dotted style for internal guides and extend them across the whole page
    ctx.strokeStyle = FOLD_LINE_COLOR;
    ctx.setLineDash(FOLD_LINE_DASH);
    const prevCapSep = ctx.lineCap;
    ctx.lineCap = 'round';

    // Vertical guides at internal column boundaries (top → bottom of page)
    // Left outer vertical guide (full page height)
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, L.pageSize.height);
    ctx.stroke();
    for (let c = 1; c < standeesPerRow; c++) {
      const x = x0 + c * unitDims.width + (c - 1) * gridGap;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, L.pageSize.height);
      ctx.stroke();
    }
    // Right outer vertical guide (full page height)
    ctx.beginPath();
    ctx.moveTo(x0 + gridW, 0);
    ctx.lineTo(x0 + gridW, L.pageSize.height);
    ctx.stroke();

    // Horizontal guides at internal row boundaries (left → right edge of page)
    for (let r = 1; r < maxRows; r++) {
      let y = y0 + r * unitDims.height + (r - 1) * gridGap;

      const prevRowIsEven = (r - 1) % 2 === 0;
      if (prevRowIsEven) {
        y += standingWhiteSpace;
      }

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(L.pageSize.width, y);
      ctx.stroke();
    }

    ctx.lineCap = prevCapSep;
    ctx.setLineDash([]);
  }

  function drawPerforationDots(ctx, L) {
    const { pageMargin, unitDims, standeesPerRow, maxRows, gridGap } = L;
    ctx.save();
    ctx.fillStyle = '#000';

    for (let r = 0; r < maxRows; r++) {
      for (let c = 0; c < standeesPerRow; c++) {
        const ux = pageMargin + c * (unitDims.width + gridGap);
        const uy = pageMargin + r * (unitDims.height + gridGap);
        const xL = ux + 1;
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

  function drawStandeeNumber(ctx, x, y, number, size = 12) {
    const radius = size * 0.4;
    const fontSize = size * 0.6;
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number.toString(), x, y);

    ctx.restore();
  }

  function drawCombatTypeIcon(ctx, x, y, type, size = 12) {
    const iconSize = size * 0.8;

    ctx.save();
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    ctx.fillStyle = 'black';
    ctx.font = `${iconSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const icon = type === 'melee' ? '⚔️' : '🏹';
    ctx.fillText(icon, x, y);

    ctx.restore();
  }

  function drawBossIndicator(ctx, x, y, size = 12) {
    const iconSize = size;
    ctx.save();
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;

    ctx.fillStyle = '#8B4513';
    ctx.font = `${iconSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', x, y);

    ctx.restore();
  }

  function renderStandeeSheet(ctx, L, standees) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, L.pageSize.width, L.pageSize.height);

    standees.forEach((t, i) => {
      const col = i % L.standeesPerRow;
      const row = Math.floor(i / L.standeesPerRow);
      if (row >= L.maxRows) return;

      const ux = L.pageMargin + col * (L.unitDims.width + L.gridGap);
      const uy = L.pageMargin + row * (L.unitDims.height + L.gridGap);

      const isEvenRow = row % 2 === 0;

      if (isEvenRow) {
        const topY = uy + L.standingWhiteSpace;
        const bottomY = topY + L.standeeDims.height + L.foldGap;

        drawImageCover(
          ctx,
          t.image,
          ux,
          topY,
          L.standeeDims.width,
          L.standeeDims.height + PANEL_OVERLAP_MM,
          true
        );
        drawImageCover(
          ctx,
          t.image,
          ux,
          bottomY - PANEL_OVERLAP_MM,
          L.standeeDims.width,
          L.standeeDims.height + PANEL_OVERLAP_MM,
          false
        );
      } else {
        const topY = uy;
        const middleY = topY + L.legSpace;
        const bottomY = middleY + L.standeeDims.height + L.foldGap;

        drawImageCover(
          ctx,
          t.image,
          ux,
          middleY,
          L.standeeDims.width,
          L.standeeDims.height + PANEL_OVERLAP_MM,
          true
        );
        drawImageCover(
          ctx,
          t.image,
          ux,
          bottomY - PANEL_OVERLAP_MM,
          L.standeeDims.width,
          L.standeeDims.height + PANEL_OVERLAP_MM,
          false
        );
      }

      const legAreaY = isEvenRow
        ? uy + L.unitDims.height - L.legSpace / 2
        : uy + L.legSpace / 2;

      const legAreaHeight = L.legSpace;
      const indicatorSize = Math.min(
        legAreaHeight * 0.6,
        L.unitDims.width * 0.15
      );
      const indicatorSpacing = indicatorSize * 0.8;
      const visibleIndicators = [];
      if (t.duplicateNumber) {
        visibleIndicators.push('duplicate');
      }
      if (t.combatType && t.combatType !== 'none') {
        visibleIndicators.push('combat');
      }
      if (t.isBoss) {
        visibleIndicators.push('boss');
      }

      if (visibleIndicators.length > 0) {
        const totalIndicatorWidth =
          visibleIndicators.length * indicatorSize +
          (visibleIndicators.length - 1) * indicatorSpacing;
        const startX = ux + (L.unitDims.width - totalIndicatorWidth) / 2;

        let currentX = startX;

        visibleIndicators.forEach((type) => {
          if (type === 'duplicate') {
            drawStandeeNumber(
              ctx,
              currentX + indicatorSize / 2,
              legAreaY,
              t.duplicateNumber,
              indicatorSize
            );
          } else if (type === 'combat') {
            drawCombatTypeIcon(
              ctx,
              currentX + indicatorSize / 2,
              legAreaY,
              t.combatType,
              indicatorSize
            );
          } else if (type === 'boss') {
            drawBossIndicator(
              ctx,
              currentX + indicatorSize / 2,
              legAreaY,
              indicatorSize
            );
          }

          currentX += indicatorSize + indicatorSpacing;
        });
      }
    });
    if (L.perforationEdges) drawPerforationDots(ctx, L);
    drawGrid(ctx, L);
  }

  function generatePreview(layout, standees, containerEl) {
    if (!layout || !standees?.length || !containerEl) {
      return;
    }

    if (canvas.value) {
      try {
        canvas.value.remove();
      } catch {}
      canvas.value = null;
    }

    const { el, ctx } = createCanvas(layout, containerEl.offsetWidth || 600);
    canvas.value = el;

    const batch = standees.slice(0, layout.standeesPerPage ?? standees.length);
    renderStandeeSheet(ctx, layout, batch);

    containerEl.innerHTML = '';
    containerEl.appendChild(el);
  }

  return {
    canvas,
    generatePreview,
    renderStandeeSheet
  };
}
