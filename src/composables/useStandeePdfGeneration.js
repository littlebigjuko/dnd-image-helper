import { jsPDF } from 'jspdf';
import { ref } from 'vue';

// Canvas target sizes at ~300 DPI for A4
const A4_WIDTH_300DPI = 2480; // px
const A4_HEIGHT_300DPI = 3508; // px

export function useStandeePdfGeneration() {
  const isGenerating = ref(false);

  function createStandeeSheetsPDF(layout, standeeImages, renderStandeeSheet) {
    const { pageSize } = layout;
    const isLandscape = pageSize.width > pageSize.height;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pageSize.width, pageSize.height],
      compress: false
    });

    const totalPages = Math.ceil(standeeImages.length / layout.standeesPerPage);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) pdf.addPage([pageSize.width, pageSize.height]);

      const startIndex = pageIndex * layout.standeesPerPage;
      const endIndex = Math.min(
        startIndex + layout.standeesPerPage,
        standeeImages.length
      );
      const pageStandees = standeeImages.slice(startIndex, endIndex);

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      tempCanvas.width = isLandscape ? A4_HEIGHT_300DPI : A4_WIDTH_300DPI;
      tempCanvas.height = isLandscape ? A4_WIDTH_300DPI : A4_HEIGHT_300DPI;

      const targetW = tempCanvas.width;
      const targetH = tempCanvas.height;
      const scaleX = targetW / pageSize.width;
      const scaleY = targetH / pageSize.height;
      const finalScale = Math.min(scaleX, scaleY);

      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.textRenderingOptimization = 'optimizeQuality';
      tempCtx.scale(finalScale, finalScale);

      renderStandeeSheet(tempCtx, layout, pageStandees);

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

  function generateStandeeSheets(
    layout,
    standeeImages,
    renderStandeeSheet,
    showMessage
  ) {
    if (standeeImages.length === 0) {
      showMessage && showMessage('Please upload standee images first', 'error');
      return Promise.resolve(false);
    }

    isGenerating.value = true;

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const pdf = createStandeeSheetsPDF(
            layout,
            standeeImages,
            renderStandeeSheet
          );
          const ts = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
          pdf.save(`standee-sheets-${ts}.pdf`);
          showMessage &&
            showMessage('Standee sheets generated successfully!', 'success');
          resolve(true);
        } catch (error) {
          console.error('PDF generation error:', error);
          showMessage &&
            showMessage(
              'Failed to generate standee sheets. Please try again.',
              'error'
            );
          resolve(false);
        } finally {
          isGenerating.value = false;
        }
      }, 50);
    });
  }

  return { isGenerating, generateStandeeSheets };
}
