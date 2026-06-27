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
      title: "Select Seats",
      description: step1Done ? `${seatsSelected} seat${seatsSelected > 1 ? "s" : ""} chosen` : "Choose your seats",
      icon: <Armchair className="h-4 w-4" />,
      status: step1Done ? "completed" : "active",
    },
    {
      id: 2,
      title: "Boarding & Drop",
      description: step2Done ? "Points selected" : "Pick-up & drop-off",
      icon: <MapPin className="h-4 w-4" />,
      status: step2Done ? "completed" : step1Done ? "active" : "pending",
    },
    {
      id: 3,
      title: "Confirm",
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
    <div className="flex items-center gap-2 px-3">
      {/* Circle icon */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300",
          isCompleted && "bg-green-500 text-white shadow-sm shadow-green-200",
          isActive && "bg-blue-600 text-white shadow-sm shadow-blue-200",
          step.status === "pending" && "bg-gray-200 text-gray-400"
        )}
      >
        {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.icon}
      </div>

      {/* Text */}
      <div className="hidden sm:block">
        <p
          className={cn(
            "text-[11px] font-semibold leading-tight transition-colors duration-300",
            isCompleted && "text-green-700",
            isActive && "text-blue-700",
            step.status === "pending" && "text-gray-400"
          )}
        >
          {step.title}
        </p>
        <p className="text-[10px] text-gray-400 leading-tight">{step.description}</p>
      </div>
    </div>
  );
}

function Connector({ status }: { status: "done" | "pending" }) {
  return (
    <div
      className={cn(
        "h-[2px] w-8 transition-colors duration-300 sm:w-12",
        status === "done" ? "bg-green-400" : "bg-gray-200"
      )}
    />
  );
}
