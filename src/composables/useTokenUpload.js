import { ref } from 'vue';

export function useTokenUpload() {
  const tokenImages = ref([]);
  const isUploading = ref(false);

  function validate(file) {
    const okType = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ].includes(file.type);
    if (!okType) return `${file.name}: Please use JPEG, PNG, or WebP`;
    if (file.size > 5 * 1024 * 1024)
      return `${file.name}: File too large (max 5MB)`;
    return null;
  }

  function load(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = (e) => {
        const img = new Image();
        img.onload = () =>
          res({
            image: img,
            name: file.name.replace(/\.[^/.]+$/, ''),
            id: Date.now() + Math.random()
          });
        img.onerror = rej;
        img.src = e.target.result;
      };
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  async function processFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return false;

    const accepted = [];
    for (const f of list) {
      const err = validate(f);
      if (err) {
        console.warn(err);
        continue;
      }
      accepted.push(f);
    }
    if (!accepted.length) return false;
    if (tokenImages.value.length + accepted.length > 50)
      accepted.splice(50 - tokenImages.value.length);

    isUploading.value = true;
    try {
      const imgs = await Promise.all(accepted.map(load));
      tokenImages.value.push(...imgs);
      return true;
    } finally {
      isUploading.value = false;
    }
  }

  function removeToken(i) {
    tokenImages.value.splice(i, 1);
  }

  function duplicateToken(id) {
    if (tokenImages.value.length >= 50) {
      console.warn('Cannot duplicate: Maximum 50 tokens allowed');
      return false;
    }

    const tokenToDuplicate = tokenImages.value.find((token) => token.id === id);
    if (!tokenToDuplicate) {
      console.warn('Token not found for duplication');
      return false;
    }

    const generateDuplicateName = (originalName) => {
      const existingNames = tokenImages.value.map((token) => token.name);
      let counter = 2;
      let newName = `${originalName} (copy)`;

      while (existingNames.includes(newName)) {
        newName = `${originalName} (${counter})`;
        counter++;
      }

      return newName;
    };

    const duplicatedToken = {
      id: Date.now() + Math.random(),
      image: tokenToDuplicate.image,
      name: generateDuplicateName(tokenToDuplicate.name)
    };

    tokenImages.value.push(duplicatedToken);
    return true;
  }

  function clearTokens() {
    tokenImages.value = [];
  }

  return {
    tokenImages,
    isUploading,
    processFiles,
    removeToken,
    duplicateToken,
    clearTokens
  };
}
