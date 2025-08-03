import { computed, ref } from 'vue';

export function useTokenLayout() {
  const tokenSize = ref('medium');

  const tokenSizes = {
    small: { height: 120, name: 'Small (12cm)' },
    medium: { height: 180, name: 'Medium (18cm)' },
    high: { height: 240, name: 'High (24cm)' }
  };

  const PAGE_WIDTH_MM = 210;
  const PAGE_HEIGHT_MM = 297;
  const PAGE_MARGIN_MM = 40;
  const STANDING_WHITE_SPACE_MM = 40;
  const FOLD_GAP_MM = 4;
  const GRID_GAP_MM = 4;

  const pageSize = { width: PAGE_WIDTH_MM, height: PAGE_HEIGHT_MM };

  const tokenDimensions = computed(() => {
    const tokenHeight = tokenSizes[tokenSize.value].height;
    const tokenWidth = tokenHeight;
    return { width: tokenWidth, height: tokenHeight };
  });

  const tokenUnitDimensions = computed(() => {
    const tokenDims = tokenDimensions.value;
    const unitWidth = tokenDims.width;
    const unitHeight =
      STANDING_WHITE_SPACE_MM +
      tokenDims.height +
      FOLD_GAP_MM +
      tokenDims.height +
      STANDING_WHITE_SPACE_MM;
    return { width: unitWidth, height: unitHeight };
  });

  const sheetLayout = computed(() => {
    const tokenDims = tokenDimensions.value;
    const unitDims = tokenUnitDimensions.value;

    const availableWidth = PAGE_WIDTH_MM - PAGE_MARGIN_MM * 2;
    const availableHeight = PAGE_HEIGHT_MM - PAGE_MARGIN_MM * 2;

    const tokensPerRow = Math.floor(
      (availableWidth + GRID_GAP_MM) / (unitDims.width + GRID_GAP_MM)
    );
    const maxRows = Math.floor(
      (availableHeight + GRID_GAP_MM) / (unitDims.height + GRID_GAP_MM)
    );

    if (tokensPerRow === 0 || maxRows === 0) {
      throw new Error('Token size too large for A4 page size');
    }

    const tokensPerPage = tokensPerRow * maxRows;

    return {
      pageSize,
      tokenDims,
      unitDims,
      tokensPerRow,
      maxRows,
      tokensPerPage,
      pageMargin: PAGE_MARGIN_MM,
      standingWhiteSpace: STANDING_WHITE_SPACE_MM,
      foldGap: FOLD_GAP_MM,
      gridGap: GRID_GAP_MM,
      availableWidth,
      availableHeight
    };
  });

  function updateTokenSize(newSize) {
    tokenSize.value = newSize;
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
    tokenSizes,
    tokenDimensions,
    sheetLayout,
    updateTokenSize,
    calculateTotalPages
  };
}
