import type { SeatUIStatus } from "./seatStatusMapper";

/**
 * Seat Color Mapper
 *
 * Returns Tailwind class strings for each seat status.
 * Used by SeatCard to render the correct appearance.
 */

export interface SeatColors {
  bg: string;
  border: string;
  text: string;
  hoverBg: string;
  hoverBorder: string;
  shadow: string;
}

const COLOR_MAP: Record<SeatUIStatus, SeatColors> = {
  available: {
    bg: "bg-white",
    border: "border-green-400",
    text: "text-green-800",
    hoverBg: "hover:bg-green-50",
    hoverBorder: "hover:border-green-500",
    shadow: "hover:shadow-md hover:shadow-green-100",
  },
  booked: {
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-400",
    hoverBg: "",
    hoverBorder: "",
    shadow: "",
  },
  selected: {
    bg: "bg-blue-600",
    border: "border-blue-700",
    text: "text-white",
    hoverBg: "hover:bg-blue-700",
    hoverBorder: "hover:border-blue-800",
    shadow: "shadow-md shadow-blue-200",
  },
  ladies: {
    bg: "bg-pink-50",
    border: "border-pink-400",
    text: "text-pink-700",
    hoverBg: "hover:bg-pink-100",
    hoverBorder: "hover:border-pink-500",
    shadow: "hover:shadow-md hover:shadow-pink-100",
  },
  blocked: {
    bg: "bg-gray-200",
    border: "border-gray-400",
    text: "text-gray-500",
    hoverBg: "",
    hoverBorder: "",
    shadow: "",
  },
  partner_booked: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    text: "text-orange-700",
    hoverBg: "",
    hoverBorder: "",
    shadow: "",
  },
  reserved: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-700",
    hoverBg: "",
    hoverBorder: "",
    shadow: "",
  },
};

/**
 * Get color classes for a seat based on its current display status.
 */
export function getSeatColors(status: SeatUIStatus): SeatColors {
  return COLOR_MAP[status] || COLOR_MAP.blocked;
}
