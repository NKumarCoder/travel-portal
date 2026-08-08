"use client";

import React from "react";
import { Compass, Package, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ComingSoonServiceType = "Activities" | "Packages" | "AI Planner" | null;

interface ComingSoonModalProps {
  isOpen: boolean;
  service: ComingSoonServiceType;
  onClose: () => void;
}

const SERVICE_DETAILS = {
  Activities: {
    title: "Activities Coming Soon",
    description:
      "We're working on exciting experiences and activities to make your trips even better. Stay tuned!",
    icon: Compass,
  },
  Packages: {
    title: "Packages Coming Soon",
    description:
      "Curated travel packages are coming soon to TravelAI. We're working on something special for you.",
    icon: Package,
  },
  "AI Planner": {
    title: "AI Planner Coming Soon",
    description:
      "Your intelligent travel planning assistant is coming soon. Let AI help you plan your perfect journey.",
    icon: Sparkles,
  },
};

export function ComingSoonModal({ isOpen, service, onClose }: ComingSoonModalProps) {
  // ESC key listener for accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const details = SERVICE_DETAILS[service];
  const IconComponent = details.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in-50 duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="coming-soon-title"
    >
      <div className="relative w-full max-w-[440px] rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon Container */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-2xs">
          <IconComponent className="h-7 w-7" />
        </div>

        {/* Subtitle Badge */}
        <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 border border-emerald-200/90 px-3 py-0.5 rounded-full mb-2">
          Coming Soon
        </span>

        {/* Title */}
        <h2 id="coming-soon-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
          {details.title}
        </h2>

        {/* Description */}
        <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
          {details.description}
        </p>

        {/* Got It Primary CTA */}
        <Button
          onClick={onClose}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm h-11 rounded-xl shadow-md transition-all cursor-pointer"
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
