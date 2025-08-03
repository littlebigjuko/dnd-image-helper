import { computed, ref } from 'vue';

export function useTokenLayout() {
  const tokenSize = ref('medium');
  const perforationEdges = ref(false);

  const tokenSizes = {
    small: { height: 45, name: 'Small (4.5cm)' },
    medium: { height: 60, name: 'Medium (6cm)' },
    high: { height: 90, name: 'High (9cm)' }
  };

  // Extra bottom white space for standee legs by size (mm)
  const LEG_SPACE = { small: 7.5, medium: 10, high: 15 };

  // Panel aspect ratio: width : height (portrait)
  const ASPECT = 2 / 3; // 2:3 works for your portraits

  // A4 landscape
  const PAGE = { width: 297, height: 210 };
  const MARGIN = 10; // mm
  const GRID_GAP = 0; // mm
  const FOLD_GAP = 0; // mm
  const WHITE = 0; // mm

  const tokenDimensions = computed(() => {
    const h = tokenSizes[tokenSize.value].height;
    const w = Math.round(h * ASPECT); // portrait width (2:3)
    return { width: w, height: h };
  });

  const tokenUnitDimensions = computed(() => {
    const t = tokenDimensions.value;
    const leg = LEG_SPACE[tokenSize.value]; // bottom white for standee base
    return {
      width: t.width,
      height: WHITE + t.height + FOLD_GAP + t.height + leg
    };
  });

  const sheetLayout = computed(() => {
    const t = tokenDimensions.value;
    const u = tokenUnitDimensions.value;

    const availW = PAGE.width - MARGIN * 2;
    const availH = PAGE.height - MARGIN * 2;

    const perRow = Math.floor((availW + GRID_GAP) / (u.width + GRID_GAP));
    const rows = Math.floor((availH + GRID_GAP) / (u.height + GRID_GAP));
    if (perRow < 1 || rows < 1) throw new Error('Token size too large for A4');

    const leg = LEG_SPACE[tokenSize.value];

    return {
      pageSize: PAGE,
      tokenDims: t,
      unitDims: u,
      tokensPerRow: perRow,
      maxRows: rows,
      tokensPerPage: perRow * rows,
      pageMargin: MARGIN,
      standingWhiteSpace: WHITE,
      legSpace: leg,
      foldGap: FOLD_GAP,
      gridGap: GRID_GAP,
      perforationEdges: perforationEdges.value
    };
  });

  return { tokenSize, perforationEdges, tokenDimensions, sheetLayout };
}
