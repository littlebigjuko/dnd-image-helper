import { ref } from 'vue';

export function useStandeeUpload() {
  const standeeImages = ref([]);
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
    if (standeeImages.value.length + accepted.length > 50)
      accepted.splice(50 - standeeImages.value.length);

    isUploading.value = true;
    try {
      const imgs = await Promise.all(accepted.map(load));
      standeeImages.value.push(...imgs);
      return true;
    } finally {
      isUploading.value = false;
    }
  }

  function removeStandee(i) {
    standeeImages.value.splice(i, 1);
  }

  function duplicateStandee(id) {
    if (standeeImages.value.length >= 50) {
      console.warn('Cannot duplicate: Maximum 50 standees allowed');
      return false;
    }

    const standeeToDuplicate = standeeImages.value.find(
      (standee) => standee.id === id
    );
    if (!standeeToDuplicate) {
      console.warn('Standee not found for duplication');
      return false;
    }

    const generateDuplicateName = (originalName) => {
      const existingNames = standeeImages.value.map((standee) => standee.name);
      let counter = 2;
      let newName = `${originalName} (copy)`;

      while (existingNames.includes(newName)) {
        newName = `${originalName} (${counter})`;
        counter++;
      }

      return newName;
    };

    const duplicatedStandee = {
      id: Date.now() + Math.random(),
      image: standeeToDuplicate.image,
      name: generateDuplicateName(standeeToDuplicate.name),
      combatType: standeeToDuplicate.combatType || 'none',
      isBoss: standeeToDuplicate.isBoss || false,
      imageHash: standeeToDuplicate.imageHash,
      duplicateNumber: null
    };

    standeeImages.value.push(duplicatedStandee);
    return true;
  }

  function clearStandees() {
    standeeImages.value = [];
  }

  return {
    standeeImages,
    isUploading,
    processFiles,
    removeStandee,
    duplicateStandee,
    clearStandees
  };
}
