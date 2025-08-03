import { jsPDF } from 'jspdf';
import { ref } from 'vue';

// Canvas target sizes at ~300 DPI for A4
const A4_WIDTH_300DPI = 2480; // px
const A4_HEIGHT_300DPI = 3508; // px

export function useTokenPdfGeneration() {
  const isGenerating = ref(false);

  function createTokenSheetsPDF(layout, tokenImages, renderTokenSheet) {
    const { pageSize } = layout; // in mm
    const isLandscape = pageSize.width > pageSize.height;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pageSize.width, pageSize.height],
      compress: false
    });

    const totalPages = Math.ceil(tokenImages.length / layout.tokensPerPage);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) pdf.addPage([pageSize.width, pageSize.height]);

      const startIndex = pageIndex * layout.tokensPerPage;
      const endIndex = Math.min(
        startIndex + layout.tokensPerPage,
        tokenImages.length
      );
      const pageTokens = tokenImages.slice(startIndex, endIndex);

      // Prepare a temporary canvas to render at high resolution
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      tempCanvas.width = isLandscape ? A4_HEIGHT_300DPI : A4_WIDTH_300DPI;
      tempCanvas.height = isLandscape ? A4_WIDTH_300DPI : A4_HEIGHT_300DPI;

      const targetW = tempCanvas.width;
      const targetH = tempCanvas.height;
      const scaleX = targetW / pageSize.width; // px per mm
      const scaleY = targetH / pageSize.height; // px per mm
      const finalScale = Math.min(scaleX, scaleY);

      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.textRenderingOptimization = 'optimizeQuality';
      tempCtx.scale(finalScale, finalScale);

      renderTokenSheet(tempCtx, layout, pageTokens, pageIndex);

      const imgData = tempCanvas.toDataURL('image/png');
      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        pageSize.width,
        pageSize.height,
        '',
        'NONE'
      );
    }

    return pdf;
  }

  function generateTokenSheets(
    layout,
    tokenImages,
    renderTokenSheet,
    showMessage
  ) {
    if (tokenImages.length === 0) {
      showMessage && showMessage('Please upload token images first', 'error');
      return Promise.resolve(false);
    }

    isGenerating.value = true;

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const pdf = createTokenSheetsPDF(
            layout,
            tokenImages,
            renderTokenSheet
          );
          const ts = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
          pdf.save(`token-sheets-${ts}.pdf`);
          showMessage &&
            showMessage('Token sheets generated successfully!', 'success');
          resolve(true);
        } catch (error) {
          console.error('PDF generation error:', error);
          showMessage &&
            showMessage(
              'Failed to generate token sheets. Please try again.',
              'error'
            );
          resolve(false);
        } finally {
          isGenerating.value = false;
        }
      }, 50);
    });
  }

  return { isGenerating, generateTokenSheets };
}
