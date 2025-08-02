import { computed, ref } from "vue";

export function useTokenLayout() {
  const tokenSize = ref("medium");
  const pageSize = ref("letter");

  const tokenSizes = {
    small: { height: 30, name: "Small (3cm)" },
    medium: { height: 45, name: "Medium (4.5cm)" },
    big: { height: 60, name: "Big (6cm)" },
  };

  const pageSizes = {
    letter: { width: 216, height: 279, name: "Letter" },
    a4: { width: 210, height: 297, name: "A4" },
  };

  const tokenDimensions = computed(() => {
    const tokenHeight = tokenSizes[tokenSize.value].height;
    const aspectRatio = 1;
    const tokenWidth = tokenHeight * aspectRatio;
    return { width: tokenWidth, height: tokenHeight };
  });

  const sheetLayout = computed(() => {
    const selectedPageSize = pageSizes[pageSize.value];
    const tokenDims = tokenDimensions.value;
    const margin = 10;

    const availableWidth = selectedPageSize.width - margin * 2;
    const availableHeight = (selectedPageSize.height - margin * 2) / 2;

    const tokensPerRow = Math.floor(availableWidth / tokenDims.width);
    const maxRows = Math.floor(availableHeight / tokenDims.height);

    if (tokensPerRow === 0 || maxRows === 0) {
      throw new Error("Token size too large for selected page size");
    }

    const tokensPerPage = tokensPerRow * maxRows;
    const cellWidth = availableWidth / tokensPerRow;
    const cellHeight = availableHeight / maxRows;

    return {
      pageSize: selectedPageSize,
      tokenDims,
      tokensPerRow,
      tokensPerPage,
      cellWidth,
      cellHeight,
      margin,
      availableWidth,
      availableHeight,
    };
  });

  function updateTokenSize(newSize) {
    tokenSize.value = newSize;
  }

  function updatePageSize(newSize) {
    pageSize.value = newSize;
  }

  function calculateTotalPages(tokenCount) {
    try {
      return Math.ceil(tokenCount / sheetLayout.value.tokensPerPage);
    } catch (error) {
      return 0;
    }
  }

  return {
    tokenSize,
    pageSize,
    tokenSizes,
    pageSizes,
    tokenDimensions,
    sheetLayout,
    updateTokenSize,
    updatePageSize,
    calculateTotalPages,
  };
}
