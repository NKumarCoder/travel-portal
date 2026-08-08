import { create } from "zustand";

export type HotelSortOption =
  | "recommended"
  | "price_low"
  | "price_high"
  | "rating"
  | "stars";

export interface HotelFilterState {
  priceRange: [number, number];
  starRating: number[];
  propertyTypes: string[];
  amenities: string[];
  guestReviewScore: number | null;
  freeCancellationOnly: boolean;
  sortBy: HotelSortOption;

  setPriceRange: (range: [number, number]) => void;
  toggleStarRating: (star: number) => void;
  togglePropertyType: (type: string) => void;
  toggleAmenity: (amenity: string) => void;
  setGuestReviewScore: (score: number | null) => void;
  setFreeCancellationOnly: (val: boolean) => void;
  setSortBy: (sortBy: HotelSortOption) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const initialFilterState = {
  priceRange: [0, 1000] as [number, number],
  starRating: [],
  propertyTypes: [],
  amenities: [],
  guestReviewScore: null,
  freeCancellationOnly: false,
  sortBy: "recommended" as HotelSortOption,
};

export const useHotelFilterStore = create<HotelFilterState>((set, get) => ({
  ...initialFilterState,

  setPriceRange: (priceRange) => set({ priceRange }),

  toggleStarRating: (star) =>
    set((state) => ({
      starRating: state.starRating.includes(star)
        ? state.starRating.filter((s) => s !== star)
        : [...state.starRating, star],
    })),

  togglePropertyType: (type) =>
    set((state) => ({
      propertyTypes: state.propertyTypes.includes(type)
        ? state.propertyTypes.filter((t) => t !== type)
        : [...state.propertyTypes, type],
    })),

  toggleAmenity: (amenity) =>
    set((state) => ({
      amenities: state.amenities.includes(amenity)
        ? state.amenities.filter((a) => a !== amenity)
        : [...state.amenities, amenity],
    })),

  setGuestReviewScore: (score) => set({ guestReviewScore: score }),

  setFreeCancellationOnly: (freeCancellationOnly) =>
    set({ freeCancellationOnly }),

  setSortBy: (sortBy) => set({ sortBy }),

  resetFilters: () =>
    set({
      priceRange: [0, 1000],
      starRating: [],
      propertyTypes: [],
      amenities: [],
      guestReviewScore: null,
      freeCancellationOnly: false,
      sortBy: "recommended",
    }),

  hasActiveFilters: () => {
    const s = get();
    return (
      s.priceRange[0] > 0 ||
      s.priceRange[1] < 1000 ||
      s.starRating.length > 0 ||
      s.propertyTypes.length > 0 ||
      s.amenities.length > 0 ||
      s.guestReviewScore !== null ||
      s.freeCancellationOnly ||
      s.sortBy !== "recommended"
    );
  },
}));
