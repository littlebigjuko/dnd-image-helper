import { computed, ref } from 'vue';

export function useStandeeLayout() {
  const standeeSize = ref('small');

  const standeeSizes = {
    small: { height: 30, name: 'Small (3cm)' },
    medium: { height: 45, name: 'Medium (4.5cm)' },
    large: { height: 60, name: 'Large (6cm)' },
    'very-large': { height: 85, name: 'Very Large (8.5cm)' },
    colossal: { height: 150, name: 'Colossal (15cm)' }
  };

  const LEG_SPACE = {
    small: 5,
    medium: 5,
    large: 10,
    'very-large': 15,
    colossal: 30
  };
  const ASPECT = 2 / 3;
  const PAGE = { width: 297, height: 210 };
  const MARGIN = 10;
  const GRID_GAP = 0;
  const FOLD_GAP = 0;
  const WHITE = 0;

  const standeeDimensions = computed(() => {
    const h = standeeSizes[standeeSize.value].height;
    const w = Math.round(h * ASPECT);
    return { width: w, height: h };
  });

  const standeeUnitDimensions = computed(() => {
    const t = standeeDimensions.value;
    const leg = LEG_SPACE[standeeSize.value];
    return {
      width: t.width,
      height: WHITE + t.height + FOLD_GAP + t.height + leg
    };
  });

  const sheetLayout = computed(() => {
    const t = standeeDimensions.value;
    const u = standeeUnitDimensions.value;

    const availW = PAGE.width - MARGIN * 2;
    const availH = PAGE.height - MARGIN * 2;

    const perRow = Math.floor((availW + GRID_GAP) / (u.width + GRID_GAP));
    const rows = Math.floor((availH + GRID_GAP) / (u.height + GRID_GAP));
    if (perRow < 1 || rows < 1)
      throw new Error('Standee size too large for A4');

    const leg = LEG_SPACE[standeeSize.value];

    return {
      pageSize: PAGE,
      standeeDims: t,
      unitDims: u,
      standeesPerRow: perRow,
      maxRows: rows,
      standeesPerPage: perRow * rows,
      pageMargin: MARGIN,
      standingWhiteSpace: WHITE,
      legSpace: leg,
      foldGap: FOLD_GAP,
      gridGap: GRID_GAP
    };
  });

  return { standeeSize, standeeDimensions, sheetLayout };
}
