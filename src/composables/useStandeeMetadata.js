import CryptoJS from 'crypto-js';

export function useStandeeMetadata() {
  const defaultMetadata = {
    combatType: 'none',
    isBoss: false,
    duplicateNumber: 1,
    imageHash: null
  };

  const calculateImageHash = (imageFile) => {
    try {
      const src = imageFile.src || imageFile.dataUrl;
      return CryptoJS.SHA256(src).toString(CryptoJS.enc.Hex);
    } catch (error) {
      return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
  };

  const enhanceStandeeWithMetadata = (standee, existingStandees = []) => {
    const imageHash = calculateImageHash(standee.file || standee.image);

    const duplicateNumber = calculateDuplicateNumber(
      imageHash,
      existingStandees
    );

    return {
      ...standee,
      combatType: standee.combatType || defaultMetadata.combatType,
      isBoss: standee.isBoss || defaultMetadata.isBoss,
      duplicateNumber,
      imageHash
    };
  };

  const calculateDuplicateNumber = (imageHash, existingStandees) => {
    const duplicatesWithSameHash = existingStandees.filter(
      (standee) => standee.imageHash === imageHash
    );
    return duplicatesWithSameHash.length + 1;
  };

  const assignDuplicateNumbers = (standees) => {
    const hashCounts = {};

    return standees.map((standee) => {
      const hash = standee.imageHash;
      if (!hashCounts[hash]) {
        hashCounts[hash] = 0;
      }
      hashCounts[hash]++;

      return {
        ...standee,
        duplicateNumber: hashCounts[hash]
      };
    });
  };

  const applyMetadataToAll = (standees, metadata) => {
    return standees.map((standee) => ({
      ...standee,
      ...metadata
    }));
  };

  const updateStandeeMetadata = (standees, standeeId, updates) => {
    return standees.map((standee) =>
      standee.id === standeeId ? { ...standee, ...updates } : standee
    );
  };

  const getStandeesByType = (standees, combatType) => {
    return standees.filter((standee) => standee.combatType === combatType);
  };

  const getBossStandees = (standees) => {
    return standees.filter((standee) => standee.isBoss);
  };

  const getStandeeGroups = (standees) => {
    const groups = {};
    standees.forEach((standee) => {
      const key = standee.imageHash;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(standee);
    });
    return groups;
  };

  return {
    defaultMetadata,
    calculateImageHash,
    enhanceStandeeWithMetadata,
    calculateDuplicateNumber,
    assignDuplicateNumbers,
    applyMetadataToAll,
    updateStandeeMetadata,
    getStandeesByType,
    getBossStandees,
    getStandeeGroups
  };
}
