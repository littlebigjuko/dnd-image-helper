import { jsPDF } from "jspdf";
import { ref } from "vue";

export function usePdfGeneration() {
  const isGenerating = ref(false);

  function generateImageSplitPDF(image, rows, cols, showMessage) {
    if (!image) {
      showMessage("Please upload an image first", "error");
      return;
    }

    isGenerating.value = true;

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const imgWidth = image.width;
          const imgHeight = image.height;
          const pieceWidth = imgWidth / cols;
          const pieceHeight = imgHeight / rows;

          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          tempCanvas.width = pieceWidth;
          tempCanvas.height = pieceHeight;

          let pdf = null;

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const isLandscape = pieceWidth > pieceHeight;

              if (row === 0 && col === 0) {
                pdf = new jsPDF({
                  orientation: isLandscape ? "landscape" : "portrait",
                  unit: "mm",
                  format: "a4",
                });
              } else {
                pdf.addPage("a4", isLandscape ? "landscape" : "portrait");
              }

              tempCtx.clearRect(0, 0, pieceWidth, pieceHeight);
              tempCtx.drawImage(
                image,
                col * pieceWidth,
                row * pieceHeight,
                pieceWidth,
                pieceHeight,
                0,
                0,
                pieceWidth,
                pieceHeight
              );

              const imgData = tempCanvas.toDataURL("image/jpeg", 0.92);

              const pageWidth = isLandscape ? 297 : 210;
              const pageHeight = isLandscape ? 210 : 297;
              const margin = 10;
              const availableWidth = pageWidth - margin * 2;
              const availableHeight = pageHeight - margin * 2;
              const aspectRatio = pieceWidth / pieceHeight;

              let finalWidth, finalHeight;
              if (aspectRatio > availableWidth / availableHeight) {
                finalWidth = availableWidth;
                finalHeight = availableWidth / aspectRatio;
              } else {
                finalHeight = availableHeight;
                finalWidth = availableHeight * aspectRatio;
              }

              const x = (pageWidth - finalWidth) / 2;
              const y = (pageHeight - finalHeight) / 2;

              pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);
            }
          }

          const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
          pdf.save(`image-split-${timestamp}.pdf`);

          showMessage("PDF generated successfully!", "success");
          resolve(true);
        } catch (error) {
          showMessage("Failed to generate PDF. Please try again.", "error");
          console.error("PDF generation error:", error);
          resolve(false);
        } finally {
          isGenerating.value = false;
        }
      }, 100);
    });
  }

  return {
    isGenerating,
    generateImageSplitPDF,
  };
}
