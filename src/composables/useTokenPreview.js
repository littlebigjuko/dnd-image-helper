import { ref } from "vue";

export function useTokenPreview() {
  const canvas = ref(null);
  const isGeneratingPreview = ref(false);

  function createCanvas(layout) {
    const canvasElement = document.createElement("canvas");
    canvasElement.className = "preview-canvas";
    const ctx = canvasElement.getContext("2d");

    const scale = 2;
    canvasElement.width = layout.pageSize.width * scale;
    canvasElement.height = layout.pageSize.height * scale;
    canvasElement.style.width = `${Math.min(layout.pageSize.width * 2, 600)}px`;
    canvasElement.style.height = `${Math.min(layout.pageSize.height * 2, 800)}px`;

    ctx.scale(scale, scale);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, layout.pageSize.width, layout.pageSize.height);

    return { canvasElement, ctx };
  }

  function drawToken(ctx, image, x, y, cellWidth, cellHeight, rotated) {
    ctx.save();

    const padding = 2;
    const drawWidth = cellWidth - padding * 2;
    const drawHeight = cellHeight - padding * 2;

    const scale = Math.min(drawWidth / image.width, drawHeight / image.height);
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    const drawX = x + padding + (drawWidth - scaledWidth) / 2;
    const drawY = y + padding + (drawHeight - scaledHeight) / 2;

    if (rotated) {
      ctx.translate(drawX + scaledWidth / 2, drawY + scaledHeight / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(image, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    } else {
      ctx.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);
    }

    ctx.restore();
  }

  function drawDashedLines(ctx, layout) {
    const { pageSize, margin, cellWidth, cellHeight, tokensPerRow } = layout;

    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);

    ctx.beginPath();
    ctx.moveTo(margin, pageSize.height / 2);
    ctx.lineTo(pageSize.width - margin, pageSize.height / 2);
    ctx.stroke();

    for (let i = 1; i < tokensPerRow; i++) {
      const x = margin + i * cellWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, pageSize.height - margin);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  function renderTokenSheet(ctx, layout, tokens, pageIndex) {
    const { margin, cellWidth, cellHeight, tokensPerRow, pageSize } = layout;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, pageSize.width, pageSize.height);

    drawDashedLines(ctx, layout);

    tokens.forEach((token, index) => {
      const col = index % tokensPerRow;
      const row = Math.floor(index / tokensPerRow);

      const x = margin + col * cellWidth;
      const topY = margin + row * cellHeight;
      const bottomY = margin + pageSize.height / 2 + row * cellHeight;

      drawToken(ctx, token.image, x, topY, cellWidth, cellHeight, false);
      drawToken(ctx, token.image, x, bottomY, cellWidth, cellHeight, true);
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

      const { canvasElement, ctx } = createCanvas(layout);
      canvas.value = canvasElement;

      renderTokenSheet(ctx, layout, tokens.slice(0, layout.tokensPerPage), 0);

      container.innerHTML = "";
      container.appendChild(canvasElement);
    } catch (error) {
      console.error("Preview generation error:", error);
    } finally {
      isGeneratingPreview.value = false;
    }
  }

  return {
    canvas,
    isGeneratingPreview,
    generatePreview,
    renderTokenSheet,
  };
}
