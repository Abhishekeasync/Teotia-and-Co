import type { BlogCardLayout } from './BlogCard';

type MosaicSlot = {
  layout: BlogCardLayout;
  /** Third (4) or two-thirds (8) of a 12-column row */
  lgSpan: 4 | 8;
};

/**
 * Zig-zag only (repeats every 4 posts):
 * Row A: 1/3 small + 2/3 large
 * Row B: 2/3 large + 1/3 small
 */
const MOSAIC_ROWS: MosaicSlot[][] = [
  [
    { layout: 'small', lgSpan: 4 },
    { layout: 'vertical', lgSpan: 8 },
  ],
  [
    { layout: 'vertical', lgSpan: 8 },
    { layout: 'small', lgSpan: 4 },
  ],
];

const FLAT_MOSAIC: MosaicSlot[] = MOSAIC_ROWS.flat();

export function getMosaicSlot(index: number): MosaicSlot {
  return FLAT_MOSAIC[index % FLAT_MOSAIC.length];
}

export function lgSpanClass(span: MosaicSlot['lgSpan']): string {
  return `blog-mosaic-span-${span}`;
}

export const BLOG_MOSAIC_BATCH_SIZE = FLAT_MOSAIC.length;
