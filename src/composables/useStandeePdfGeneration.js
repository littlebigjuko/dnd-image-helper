import { jsPDF } from 'jspdf';
import { ref } from 'vue';

export function useStandeePdfGeneration() {
  const isGenerating = ref(false);

  function createStandeeSheetsPDF(layout, standeeImages, renderStandeeSheet) {
    const { pageSize } = layout;
    const DPI = 300;
    const mmToPx = DPI / 25.4;
    const isPortraitLayout = pageSize.height > pageSize.width;
    const pdfW = Math.max(pageSize.width, pageSize.height);
    const pdfH = Math.min(pageSize.width, pageSize.height);

    const off = document.createElement('canvas');
    off.width = Math.round(pdfW * mmToPx);
    off.height = Math.round(pdfH * mmToPx);
    const ctx = off.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [pdfW, pdfH],
      compress: false
    });
    const totalPages = Math.ceil(standeeImages.length / layout.standeesPerPage);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) pdf.addPage([pdfW, pdfH], 'landscape');

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, off.width, off.height);

      ctx.setTransform(mmToPx, 0, 0, mmToPx, 0, 0);
      if (isPortraitLayout) {
        ctx.translate(pdfW, 0);
        ctx.rotate(Math.PI / 2);
      }
      ctx._pxScale = mmToPx;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, pageSize.width, pageSize.height);

      const startIndex = pageIndex * layout.standeesPerPage;
      const endIndex = Math.min(
        startIndex + layout.standeesPerPage,
        standeeImages.length
      );
      const pageStandees = standeeImages.slice(startIndex, endIndex);

      renderStandeeSheet(ctx, layout, pageStandees);

      const imgData = off.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH, '', 'NONE');
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
