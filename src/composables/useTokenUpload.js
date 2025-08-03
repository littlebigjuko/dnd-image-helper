import { ref } from 'vue';

export function useTokenUpload() {
  const tokenImages = ref([]);
  const isUploading = ref(false);

  function validateFile(file) {
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];
    const maxSize = 100 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      return {
        isValid: false,
        message: `${file.name}: Please use JPEG, PNG, or WebP format`
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        message: `${file.name}: File too large (max 100MB)`
      };
    }

    return { isValid: true };
  }

  function loadTokenImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const qualityMultiplier = 4;
          canvas.width = img.naturalWidth * qualityMultiplier;
          canvas.height = img.naturalHeight * qualityMultiplier;

          ctx.scale(qualityMultiplier, qualityMultiplier);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.textRenderingOptimization = 'optimizeQuality';

          ctx.drawImage(img, 0, 0);

          const enhancedImg = new Image();
          enhancedImg.onload = () => {
            resolve({
              image: enhancedImg,
              name: file.name.replace(/\.[^/.]+$/, ''),
              id: Date.now() + Math.random(),
              originalWidth: img.naturalWidth,
              originalHeight: img.naturalHeight,
              enhancedWidth: canvas.width,
              enhancedHeight: canvas.height
            });
          };
          enhancedImg.src = canvas.toDataURL('image/png', 1.0);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function processFiles(files, showMessage) {
    const validFiles = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        showMessage(validation.message, 'error');
      }
    }

    if (validFiles.length === 0) {
      return false;
    }

    if (tokenImages.value.length + validFiles.length > 50) {
      showMessage(
        'Maximum 50 tokens allowed. Some files were skipped.',
        'error'
      );
      validFiles.splice(50 - tokenImages.value.length);
    }

    isUploading.value = true;

    try {
      const images = await Promise.all(
        validFiles.map((file) => loadTokenImage(file))
      );
      tokenImages.value.push(...images);
      showMessage(`${images.length} token(s) added successfully`, 'success');
      return true;
    } catch (error) {
      showMessage('Failed to load some images', 'error');
      console.error('Image loading error:', error);
      return false;
    } finally {
      isUploading.value = false;
    }
  }

  function removeToken(index, showMessage) {
    tokenImages.value.splice(index, 1);
    showMessage('Token removed', 'info');
  }

  function clearTokens() {
    tokenImages.value = [];
  }

  return {
    tokenImages,
    isUploading,
    processFiles,
    removeToken,
    clearTokens
  };
}
