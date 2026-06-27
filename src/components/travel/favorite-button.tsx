"use client";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useBusCompareStore } from "@/store/bus-compare-store";

interface FavoriteButtonProps {
  busId: string;
  className?: string;
}

export function FavoriteButton({ busId, className }: FavoriteButtonProps) {
  const { favorites, toggleFavorite } = useBusCompareStore();
  const isFav = favorites.includes(busId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(busId);
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        isFav
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600",
        className
      )}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn("h-4 w-4", isFav && "fill-red-500")}
      />
    </button>
  );
}
