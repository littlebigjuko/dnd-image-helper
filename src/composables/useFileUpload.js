import { ref } from "vue";

export function useFileUpload(onFileProcessed, showMessage) {
  const isDragOver = ref(false);
  const selectedFile = ref(null);

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 10 * 1024 * 1024;

  function validateFile(file) {
    if (!validTypes.includes(file.type)) {
      showMessage("Please upload an image file (JPEG, PNG, WebP, or GIF)", "error");
      return false;
    }

    if (file.size > maxSize) {
      showMessage("Image too large. Please use an image under 10MB", "error");
      return false;
    }

    return true;
  }

  function processFile(file) {
    if (!validateFile(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      selectedFile.value = file;
      onFileProcessed(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    isDragOver.value = true;
  }

  function handleDragLeave(e) {
    e.preventDefault();
    isDragOver.value = false;
  }

  function handleDrop(e) {
    e.preventDefault();
    isDragOver.value = false;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }

  function handleFileSelect(files) {
    const file = files[0];
    if (file) {
      processFile(file);
    }
  }

  function clearFile() {
    selectedFile.value = null;
  }

  return {
    isDragOver,
    selectedFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    clearFile,
  };
}
