import { BowArrow, Crown, Sword } from 'lucide-static';
import { ref } from 'vue';

const GRID_LINE_WIDTH = 0.35;
const CUT_LINE_COLOR = '#333333';
const FOLD_LINE_COLOR = '#666666';
const CUT_LINE_DASH = [6, 3];
const FOLD_LINE_DASH = [3, 2];
const PANEL_OVERLAP_MM = 0;

const MAX_CANVAS_SCALE = 6;
let lastRenderKey = null;

const iconCache = new Map();
const gridCache = new Map();
const panelCache = new Map();

const lucideIcons = {
  sword: Sword,
  crown: Crown,
  bow: BowArrow
};

function createIconImage(iconName, size = 24) {
  const cacheKey = `${iconName}-${size}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey);

  const svgString = lucideIcons[iconName];
  if (!svgString) throw new Error(`Unknown icon: ${iconName}`);

  const modifiedSvgString = svgString
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replace(/stroke-width="[^"]*"/, 'stroke-width="2"');

  const blob = new Blob([modifiedSvgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => URL.revokeObjectURL(url);
  img.src = url;
  iconCache.set(cacheKey, img);
  return img;
}

function coverRect(iw, ih, w, h) {
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  return { sx, sy, sw, sh };
}

function getPanelBitmap(img, w, h, pixelScale) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const key = `${img.src}|${w}x${h}|${iw}x${ih}|px=${pixelScale}`;
  if (panelCache.has(key)) return panelCache.get(key);
  const rect = coverRect(iw, ih, w, h);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w * pixelScale));
  c.height = Math.max(1, Math.round(h * pixelScale));
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, c.width, c.height);
  panelCache.set(key, c);
  return c;
}

function snapRect(ctx, x, y, w, h) {
  const px = ctx._pxScale || 1;
  return {
    x: Math.round(x * px) / px,
    y: Math.round(y * px) / px,
    w: Math.round(w * px) / px,
    h: Math.round(h * px) / px
  };
}

function blitPanelSnapped(ctx, bmp, dx, dy, dw, dh, rotate180) {
  ctx.save();
  if (rotate180) {
    ctx.translate(dx + dw / 2, dy + dh / 2);
    ctx.rotate(Math.PI);
    ctx.drawImage(bmp, -dw / 2, -dh / 2, dw, dh);
  } else {
    ctx.drawImage(bmp, dx, dy, dw, dh);
  }
  ctx.restore();
}

function drawGrid(ctx, L) {
  const { pageMargin, unitDims, standeesPerRow, maxRows, gridGap } = L;

  const x0 = pageMargin;
  const y0 = pageMargin;
  const gridW =
    standeesPerRow * unitDims.width + (standeesPerRow - 1) * gridGap;
  const gridH = maxRows * unitDims.height + (maxRows - 1) * gridGap;

  ctx.lineWidth = GRID_LINE_WIDTH;

  ctx.strokeStyle = CUT_LINE_COLOR;
  ctx.setLineDash(CUT_LINE_DASH);
  ctx.strokeRect(x0, y0, gridW, gridH);

  ctx.strokeStyle = FOLD_LINE_COLOR;
  ctx.setLineDash(FOLD_LINE_DASH);
  const prevLineCap = ctx.lineCap;
  ctx.lineCap = 'round';

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

  ctx.beginPath();
  ctx.moveTo(x0 + gridW, 0);
  ctx.lineTo(x0 + gridW, L.pageSize.height);
  ctx.stroke();

  for (let r = 1; r < maxRows; r++) {
    let y = y0 + r * unitDims.height + (r - 1) * gridGap;
    const prevRowIsEven = (r - 1) % 2 === 0;
    if (prevRowIsEven) y += L.standingWhiteSpace;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(L.pageSize.width, y);
    ctx.stroke();
  }

  ctx.lineCap = prevLineCap;
  ctx.setLineDash([]);
}

function getGridLayer(L, pixelScale) {
  const key = JSON.stringify({
    pw: L.pageSize.width,
    ph: L.pageSize.height,
    m: L.pageMargin,
    uw: L.unitDims.width,
    uh: L.unitDims.height,
    spr: L.standeesPerRow,
    mr: L.maxRows,
    gg: L.gridGap,
    ws: L.standingWhiteSpace,
    px: pixelScale
  });
  if (gridCache.has(key)) return gridCache.get(key);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.floor(L.pageSize.width * pixelScale));
  c.height = Math.max(1, Math.floor(L.pageSize.height * pixelScale));
  const g = c.getContext('2d');
  g.scale(pixelScale, pixelScale);
  drawGrid(g, L);
  gridCache.set(key, c);
  return c;
}

function drawStandeeNumber(ctx, x, y, number, size = 12, rowIndex = 0) {
  const radius = size * 0.4;
  const fontSize = size * 0.6;
  const invert = rowIndex % 2 === 1;

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

  if (invert) {
    ctx.translate(x, y);
    ctx.rotate(Math.PI);
    ctx.fillText(number.toString(), 0, 0);
  } else {
    ctx.fillText(number.toString(), x, y);
  }

  ctx.restore();
}

function drawIcon(ctx, img, x, y, size, invert) {
  if (invert) {
    ctx.translate(x, y);
    ctx.rotate(Math.PI);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  } else {
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  }
}

function drawCombatTypeIcon(
  ctx,
  x,
  y,
  type,
  size = 12,
  rowIndex = 0,
  rerender
) {
  const iconSize = size * 0.8;
  const invert = rowIndex % 2 === 1;

  try {
    const iconName = type === 'melee' ? 'sword' : 'bow';
    const iconImg = createIconImage(iconName, iconSize);

    if (!iconImg.complete) {
      iconImg.addEventListener(
        'load',
        () => {
          if (typeof rerender === 'function') rerender();
        },
        { once: true }
      );
      return;
    }

    ctx.save();
    drawIcon(ctx, iconImg, x, y, iconSize, invert);
    ctx.restore();
  } catch (error) {
    console.error('Failed to draw combat type icon:', error);
  }
}

function drawBossIndicator(ctx, x, y, size = 12, rowIndex = 0, rerender) {
  const iconSize = size;
  const invert = rowIndex % 2 === 1;

  try {
    const iconImg = createIconImage('crown', iconSize);

    if (!iconImg.complete) {
      iconImg.addEventListener(
        'load',
        () => {
          if (typeof rerender === 'function') rerender();
        },
        { once: true }
      );
      return;
    }

    ctx.save();
    drawIcon(ctx, iconImg, x, y, iconSize, invert);
    ctx.restore();
  } catch (error) {
    console.error('Failed to draw boss indicator:', error);
  }
}

export function useStandeePreview() {
  const canvas = ref(null);

  let rafScheduled = false;
  function scheduleRender(ctx, L, standees) {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;
      renderStandeeSheet(ctx, L, standees);
    });
  }

  function createCanvas(layout, containerWidth = 600) {
    const el = document.createElement('canvas');
    el.className = 'preview-canvas';
    const ctx = el.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const quality = 5;

    const aspect = layout.pageSize.height / layout.pageSize.width;
    const displayW = containerWidth || 600;
    const displayH = displayW * aspect;

    const rawScale = (displayW / layout.pageSize.width) * dpr * quality;
    const scale = Math.min(rawScale, MAX_CANVAS_SCALE);

    el.width = Math.max(1, Math.round(layout.pageSize.width * scale));
    el.height = Math.max(1, Math.round(layout.pageSize.height * scale));
    el.style.width = `${displayW}px`;
    el.style.height = `${displayH}px`;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx._pxScale = scale;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, layout.pageSize.width, layout.pageSize.height);

    return { el, ctx };
  }

  function renderStandeeSheet(ctx, L, standees) {
    const rerender = () => scheduleRender(ctx, L, standees);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, L.pageSize.width, L.pageSize.height);
    const px = ctx._pxScale || 1;

    const renderKey = JSON.stringify({
      pw: L.pageSize.width,
      ph: L.pageSize.height,
      pm: L.pageMargin,
      uw: L.unitDims.width,
      uh: L.unitDims.height,
      spr: L.standeesPerRow,
      mr: L.maxRows,
      gg: L.gridGap,
      ws: L.standingWhiteSpace,
      ls: L.legSpace,
      sdw: L.standeeDims.width,
      sdh: L.standeeDims.height,
      px
    });
    if (renderKey !== lastRenderKey) {
      panelCache.clear();
      gridCache.clear();
      lastRenderKey = renderKey;
    }

    standees.forEach((t, i) => {
      const col = i % L.standeesPerRow;
      const row = Math.floor(i / L.standeesPerRow);
      if (row >= L.maxRows) return;

      const ux = L.pageMargin + col * (L.unitDims.width + L.gridGap);
      const uy = L.pageMargin + row * (L.unitDims.height + L.gridGap);

      const isEvenRow = row % 2 === 0;
      const targetW = L.standeeDims.width;
      const targetH = L.standeeDims.height + PANEL_OVERLAP_MM;
      const bmp = getPanelBitmap(t.image, targetW, targetH, px);

      if (isEvenRow) {
        const topY = uy + L.standingWhiteSpace;
        const bottomY = topY + targetH + L.foldGap;
        const topRect = snapRect(ctx, ux, topY, targetW, targetH);
        const bottomRect = snapRect(
          ctx,
          ux,
          bottomY - PANEL_OVERLAP_MM,
          targetW,
          targetH
        );
        blitPanelSnapped(
          ctx,
          bmp,
          topRect.x,
          topRect.y,
          topRect.w,
          topRect.h,
          true
        );
        blitPanelSnapped(
          ctx,
          bmp,
          bottomRect.x,
          bottomRect.y,
          bottomRect.w,
          bottomRect.h,
          false
        );
      } else {
        const topY = uy;
        const middleY = topY + L.legSpace;
        const bottomY = middleY + targetH + L.foldGap;
        const midRect = snapRect(ctx, ux, middleY, targetW, targetH);
        const bottomRect = snapRect(
          ctx,
          ux,
          bottomY - PANEL_OVERLAP_MM,
          targetW,
          targetH
        );
        blitPanelSnapped(
          ctx,
          bmp,
          midRect.x,
          midRect.y,
          midRect.w,
          midRect.h,
          true
        );
        blitPanelSnapped(
          ctx,
          bmp,
          bottomRect.x,
          bottomRect.y,
          bottomRect.w,
          bottomRect.h,
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
      if (t.duplicateNumber) visibleIndicators.push('duplicate');
      if (t.combatType && t.combatType !== 'none')
        visibleIndicators.push('combat');
      if (t.isBoss) visibleIndicators.push('boss');

      if (visibleIndicators.length > 0) {
        const totalIndicatorWidth =
          visibleIndicators.length * indicatorSize +
          (visibleIndicators.length - 1) * indicatorSpacing;
        const startX = ux + (L.unitDims.width - totalIndicatorWidth) / 2;
        let currentX = startX;

        for (const type of visibleIndicators) {
          if (type === 'duplicate') {
            drawStandeeNumber(
              ctx,
              currentX + indicatorSize / 2,
              legAreaY,
              t.duplicateNumber,
              indicatorSize,
              row
            );
          } else if (type === 'combat') {
            drawCombatTypeIcon(
              ctx,
              currentX + indicatorSize / 2,
              legAreaY,
              t.combatType,
              indicatorSize,
              row,
              rerender
            );
          } else if (type === 'boss') {
            drawBossIndicator(
              ctx,
              currentX + indicatorSize / 2,
              legAreaY,
              indicatorSize,
              row,
              rerender
            );
          }
          currentX += indicatorSize + indicatorSpacing;
        }
      }
    });

    const gridLayer = getGridLayer(L, px);
    ctx.drawImage(gridLayer, 0, 0, L.pageSize.width, L.pageSize.height);
  }

  function generatePreview(layout, standees, containerEl) {
    if (!containerEl) return;
    if (!layout || !standees?.length) {
      if (canvas.value) canvas.value = null;
      return;
    }

    const { el, ctx } = createCanvas(layout, containerEl.clientWidth || 600);
    canvas.value = el;

    const batch = standees.slice(0, layout.standeesPerPage ?? standees.length);
    renderStandeeSheet(ctx, layout, batch);

    containerEl.replaceChildren(el);
  }

  return { canvas, generatePreview, renderStandeeSheet };
}
