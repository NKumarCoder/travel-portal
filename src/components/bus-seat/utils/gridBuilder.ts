/**
 * Grid Builder
 *
 * Computes CSS Grid dimensions from seat coordinate metadata.
 * Generates grid-template-columns and grid-template-rows dynamically.
 *
 * The grid is the single source of truth for seat positioning.
 * Never manually position seats — always derive from x, y, width, height.
 */

export interface GridDimensions {
  /** Total columns in the grid */
  cols: number;
  /** Total rows in the grid */
  rows: number;
  /** CSS grid-template-columns value */
  templateColumns: string;
  /** CSS grid-template-rows value */
  templateRows: string;
}

export interface SeatGridPlacement {
  /** CSS grid-column-start (1-indexed) */
  colStart: number;
  /** CSS grid-row-start (1-indexed) */
  rowStart: number;
  /** CSS grid-column span */
  colSpan: number;
  /** CSS grid-row span */
  rowSpan: number;
}

/**
 * Compute grid dimensions from seat coordinates.
 * Accounts for seats that span multiple cells.
 *
 * @param seats - Array of seat coordinate data
 * @param cellSize - Base cell size in pixels (default 72px)
 */
export function computeGridDimensions(
  seats: Array<{ x: number; y: number; width: number; height: number }>,
  cellSize: number = 72
): GridDimensions {
  if (seats.length === 0) {
    return { cols: 0, rows: 0, templateColumns: "", templateRows: "" };
  }

  // Find maximum extent (considering spans)
  let maxCol = 0;
  let maxRow = 0;

  for (const seat of seats) {
    const endCol = seat.x + seat.width;
    const endRow = seat.y + seat.height;
    if (endCol > maxCol) maxCol = endCol;
    if (endRow > maxRow) maxRow = endRow;
  }

  return {
    cols: maxCol,
    rows: maxRow,
    templateColumns: `repeat(${maxCol}, ${cellSize}px)`,
    templateRows: `repeat(${maxRow}, ${cellSize}px)`,
  };
}

/**
 * Convert a seat's API coordinates to CSS Grid placement properties.
 * API coordinates are 0-indexed; CSS Grid is 1-indexed.
 */
export function getSeatGridPlacement(seat: {
  x: number;
  y: number;
  width: number;
  height: number;
}): SeatGridPlacement {
  return {
    colStart: seat.x + 1, // CSS Grid is 1-indexed
    rowStart: seat.y + 1,
    colSpan: Math.max(1, seat.width),
    rowSpan: Math.max(1, seat.height),
  };
}

/**
 * Compute a responsive cell size based on container width and grid columns.
 * Ensures seats don't overflow on smaller screens.
 *
 * @param containerWidth - Available container width in pixels
 * @param cols - Number of grid columns
 * @param minSize - Minimum cell size (default 44px for touch targets)
 * @param maxSize - Maximum cell size (default 72px)
 * @param gap - Gap between cells in pixels (default 4)
 */
export function computeResponsiveCellSize(
  containerWidth: number,
  cols: number,
  minSize: number = 44,
  maxSize: number = 72,
  gap: number = 4
): number {
  if (cols === 0) return maxSize;
  const available = containerWidth - gap * (cols - 1);
  const computed = Math.floor(available / cols);
  return Math.max(minSize, Math.min(maxSize, computed));
}
