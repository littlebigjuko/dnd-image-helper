import { jsPDF } from 'jspdf';
import { ref } from 'vue';

const PDF_RENDER_SCALE = 8;
const A4_WIDTH_300DPI = 2480;
const A4_HEIGHT_300DPI = 3508;

export function useTokenPdfGeneration() {
  const isGenerating = ref(false);

  function createTokenSheetsPDF(layout, tokenImages, renderTokenSheet) {
    const { pageSize } = layout;
    const pdf = new jsPDF({
      orientation: pageSize.width > pageSize.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pageSize.width, pageSize.height],
      compress: false
    });

    const totalPages = Math.ceil(tokenImages.length / layout.tokensPerPage);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage([pageSize.width, pageSize.height]);
      }

      const startIndex = pageIndex * layout.tokensPerPage;
      const endIndex = Math.min(
        startIndex + layout.tokensPerPage,
        tokenImages.length
      );
      const pageTokens = tokenImages.slice(startIndex, endIndex);

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      tempCanvas.width = A4_WIDTH_300DPI;
      tempCanvas.height = A4_HEIGHT_300DPI;

      const scaleX = A4_WIDTH_300DPI / pageSize.width;
      const scaleY = A4_HEIGHT_300DPI / pageSize.height;
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
      showMessage('Please upload token images first', 'error');
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

          const timestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/[:-]/g, '');
          pdf.save(`token-sheets-${timestamp}.pdf`);

          showMessage('Token sheets generated successfully!', 'success');
          resolve(true);
        } catch (error) {
          showMessage(
            'Failed to generate token sheets. Please try again.',
            'error'
          );
          console.error('PDF generation error:', error);
          resolve(false);
        } finally {
          isGenerating.value = false;
        }
      }, 100);
    });
  }

  return {
    isGenerating,
    generateTokenSheets
  };
}
