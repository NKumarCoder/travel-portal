"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Armchair, MapPin, CreditCard, Check } from "lucide-react";

export type BookingStepStatus = "completed" | "active" | "pending";

export interface StepConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: BookingStepStatus;
}

interface ProgressStepperProps {
  /** Number of seats selected (drives step 1 completion) */
  seatsSelected: number;
  /** Whether boarding AND dropping are selected (drives step 2 completion) */
  pointsSelected: boolean;
  className?: string;
}

/**
 * ProgressStepper — Horizontal 3-step booking progress indicator.
 *
 * Steps:
 * 1. Seat Selection — active initially, green when ≥1 seat selected
 * 2. Boarding / Dropping — active when step 1 done, green when both points selected
 * 3. Booking Info — active when step 2 done
 *
 * Each step: icon + title + description + connector line.
 * Smooth color transitions (300ms).
 */
export function ProgressStepper({ seatsSelected, pointsSelected, className }: ProgressStepperProps) {
  const step1Done = seatsSelected > 0;
  const step2Done = step1Done && pointsSelected;

  const steps: StepConfig[] = [
    {
      id: 1,
      title: "Select Seat",
      description: step1Done ? `${seatsSelected} seat${seatsSelected > 1 ? "s" : ""} chosen` : "Choose your seats",
      icon: <Armchair className="h-4 w-4" />,
      status: step1Done ? "completed" : "active",
    },
    {
      id: 2,
      title: "Boarding Point",
      description: step2Done ? "Points selected" : "Pick-up & drop-off",
      icon: <MapPin className="h-4 w-4" />,
      status: step2Done ? "completed" : step1Done ? "active" : "pending",
    },
    {
      id: 3,
      title: "Passenger Details",
      description: "Review & pay",
      icon: <CreditCard className="h-4 w-4" />,
      status: step2Done ? "active" : "pending",
    },
  ];

  return (
    <div className={cn("flex items-center justify-center gap-0", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <StepItem step={step} />
          {index < steps.length - 1 && <Connector status={steps[index + 1].status === "pending" ? "pending" : "done"} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function StepItem({ step }: { step: StepConfig }) {
  const isCompleted = step.status === "completed";
  const isActive = step.status === "active";

  return (
    <div className="flex items-center gap-1.5 px-2">
      {/* Circle icon */}
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300",
          isCompleted && "bg-emerald-500 text-white shadow-xs shadow-emerald-200",
          isActive && "bg-blue-600 text-white shadow-xs shadow-blue-200",
          step.status === "pending" && "bg-slate-800 text-slate-500 border border-slate-700"
        )}
      >
        {isCompleted ? <Check className="h-3 w-3" /> : step.icon}
      </div>

      {/* Text */}
      <div className="hidden sm:block">
        <p
          className={cn(
            "text-[10px] font-bold leading-tight transition-colors duration-300",
            isCompleted && "text-emerald-400",
            isActive && "text-blue-400",
            step.status === "pending" && "text-slate-400"
          )}
        >
          {step.title}
        </p>
        <p className="text-[9px] text-slate-400 leading-none mt-0.5">{step.description}</p>
      </div>
    </div>
  );
}

function Connector({ status }: { status: "done" | "pending" }) {
  return (
    <div
      className={cn(
        "h-[1.5px] w-5 transition-colors duration-300 sm:w-8",
        status === "done" ? "bg-emerald-400" : "bg-slate-700"
      )}
    />
  );
}
