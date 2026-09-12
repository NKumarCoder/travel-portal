import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { NormalizedFlightResult, PassengerCount, Airport } from "@/types";

export type FlightPaxType = "ADT" | "CHD" | "INF";

export interface FlightPassportInfo {
  passportNumber: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
}

export interface FlightPassengerInfo {
  id: string;
  paxType: FlightPaxType;
  paxIndex: number; // 1, 2...
  title: "Mr" | "Ms" | "Mrs" | "Master" | "Miss" | "";
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: "male" | "female" | "";
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string;
  passport?: FlightPassportInfo;
}

export interface FlightContactInfo {
  countryCode: string;
  mobile: string;
  email: string;
}

export interface FlightGSTInfo {
  enabled: boolean;
  gstNumber: string;
  companyName: string;
  gstEmail: string;
  gstMobile: string;
}

export interface FlightSSRSelection {
  baggage?: string;
  meal?: string;
  seat?: string;
}

export interface FlightSearchContext {
  tripType: "oneWay" | "roundTrip";
  fromAirport: Airport | null;
  toAirport: Airport | null;
  departDate: string;
  returnDate?: string;
  passengers: PassengerCount;
  travelClass: string;
  traceId?: string | null;
}

interface FlightBookingState {
  // Flight selections & context
  selectedOnwardFlight: NormalizedFlightResult | null;
  selectedReturnFlight: NormalizedFlightResult | null;
  searchContext: FlightSearchContext | null;

  // Form details
  passengers: FlightPassengerInfo[];
  contactInfo: FlightContactInfo;
  gstInfo: FlightGSTInfo;
  ssrSelections: Record<string, FlightSSRSelection>;
  agreeTerms: boolean;
  isSubmitting: boolean;

  // Actions
  initializeBooking: (
    onward: NormalizedFlightResult,
    ret: NormalizedFlightResult | null,
    context: FlightSearchContext
  ) => void;
  updatePassenger: (index: number, data: Partial<FlightPassengerInfo>) => void;
  updatePassengerPassport: (index: number, data: Partial<FlightPassportInfo>) => void;
  updateContactInfo: (data: Partial<FlightContactInfo>) => void;
  updateGSTInfo: (data: Partial<FlightGSTInfo>) => void;
  updateSSRSelection: (passengerId: string, data: Partial<FlightSSRSelection>) => void;
  setAgreeTerms: (agreed: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  resetBooking: () => void;

  // Computed checks
  isInternational: () => boolean;
  calculateTotalFare: () => {
    baseFare: number;
    taxes: number;
    extras: number;
    totalAmount: number;
  };
  validateAll: () => {
    isValid: boolean;
    errors: {
      contact?: Record<string, string>;
      passengers?: Record<number, Record<string, string>>;
      gst?: Record<string, string>;
      terms?: string;
    };
  };
}

const initialContactInfo: FlightContactInfo = {
  countryCode: "+91",
  mobile: "",
  email: "",
};

const initialGSTInfo: FlightGSTInfo = {
  enabled: false,
  gstNumber: "",
  companyName: "",
  gstEmail: "",
  gstMobile: "",
};

function createDefaultPassenger(
  paxType: FlightPaxType,
  paxIndex: number,
  isInternational: boolean
): FlightPassengerInfo {
  return {
    id: `${paxType.toLowerCase()}-${paxIndex}`,
    paxType,
    paxIndex,
    title: paxType === "ADT" ? "Mr" : "Master",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "male",
    dateOfBirth: "",
    nationality: "Indian",
    passport: isInternational
      ? {
          passportNumber: "",
          issuingCountry: "India",
          issueDate: "",
          expiryDate: "",
        }
      : undefined,
  };
}

export const useFlightBookingStore = create<FlightBookingState>()(
  persist(
    (set, get) => ({
      selectedOnwardFlight: null,
      selectedReturnFlight: null,
      searchContext: null,
      passengers: [],
      contactInfo: initialContactInfo,
      gstInfo: initialGSTInfo,
      ssrSelections: {},
      agreeTerms: false,
      isSubmitting: false,

      initializeBooking: (onward, ret, context) => {
        const isIntl =
          (context.fromAirport?.countryCode && context.fromAirport.countryCode !== "IN") ||
          (context.toAirport?.countryCode && context.toAirport.countryCode !== "IN");

        const passengersList: FlightPassengerInfo[] = [];

        // Adults
        for (let i = 1; i <= (context.passengers.adults || 1); i++) {
          passengersList.push(createDefaultPassenger("ADT", i, !!isIntl));
        }
        // Children
        for (let i = 1; i <= (context.passengers.children || 0); i++) {
          passengersList.push(createDefaultPassenger("CHD", i, !!isIntl));
        }
        // Infants
        for (let i = 1; i <= (context.passengers.infants || 0); i++) {
          passengersList.push(createDefaultPassenger("INF", i, !!isIntl));
        }

        set({
          selectedOnwardFlight: onward,
          selectedReturnFlight: ret,
          searchContext: context,
          passengers: passengersList,
          agreeTerms: false,
          isSubmitting: false,
        });
      },

      updatePassenger: (index, data) => {
        set((state) => {
          const next = [...state.passengers];
          if (next[index]) {
            next[index] = { ...next[index], ...data };
          }
          return { passengers: next };
        });
      },

      updatePassengerPassport: (index, data) => {
        set((state) => {
          const next = [...state.passengers];
          if (next[index]) {
            next[index] = {
              ...next[index],
              passport: {
                passportNumber: "",
                issuingCountry: "India",
                issueDate: "",
                expiryDate: "",
                ...(next[index].passport || {}),
                ...data,
              },
            };
          }
          return { passengers: next };
        });
      },

      updateContactInfo: (data) => {
        set((state) => ({
          contactInfo: { ...state.contactInfo, ...data },
        }));
      },

      updateGSTInfo: (data) => {
        set((state) => ({
          gstInfo: { ...state.gstInfo, ...data },
        }));
      },

      updateSSRSelection: (passengerId, data) => {
        set((state) => ({
          ssrSelections: {
            ...state.ssrSelections,
            [passengerId]: {
              ...(state.ssrSelections[passengerId] || {}),
              ...data,
            },
          },
        }));
      },

      setAgreeTerms: (agreeTerms) => set({ agreeTerms }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

      resetBooking: () =>
        set({
          selectedOnwardFlight: null,
          selectedReturnFlight: null,
          searchContext: null,
          passengers: [],
          contactInfo: initialContactInfo,
          gstInfo: initialGSTInfo,
          ssrSelections: {},
          agreeTerms: false,
          isSubmitting: false,
        }),

      isInternational: () => {
        const ctx = get().searchContext;
        if (!ctx) return false;
        return (
          (ctx.fromAirport?.countryCode && ctx.fromAirport.countryCode !== "IN") ||
          (ctx.toAirport?.countryCode && ctx.toAirport.countryCode !== "IN") ||
          false
        );
      },

      calculateTotalFare: () => {
        const { selectedOnwardFlight, selectedReturnFlight, ssrSelections } = get();

        let baseFare = 0;
        let taxes = 0;
        let totalFlightFare = 0;

        if (selectedOnwardFlight) {
          baseFare += selectedOnwardFlight.baseFare || selectedOnwardFlight.price * 0.75;
          taxes += selectedOnwardFlight.taxFare || selectedOnwardFlight.price * 0.25;
          totalFlightFare += selectedOnwardFlight.price;
        }

        if (selectedReturnFlight) {
          baseFare += selectedReturnFlight.baseFare || selectedReturnFlight.price * 0.75;
          taxes += selectedReturnFlight.taxFare || selectedReturnFlight.price * 0.25;
          totalFlightFare += selectedReturnFlight.price;
        }

        let extras = 0;
        Object.values(ssrSelections).forEach((ssr) => {
          if (ssr.baggage?.includes("₹")) {
            const match = ssr.baggage.match(/₹([\d,]+)/);
            if (match) extras += parseInt(match[1].replace(/,/g, ""), 10) || 0;
          }
          if (ssr.meal?.includes("₹")) {
            const match = ssr.meal.match(/₹([\d,]+)/);
            if (match) extras += parseInt(match[1].replace(/,/g, ""), 10) || 0;
          }
        });

        return {
          baseFare: Math.round(baseFare),
          taxes: Math.round(taxes),
          extras,
          totalAmount: Math.round(totalFlightFare + extras),
        };
      },

      validateAll: () => {
        const { contactInfo, passengers, gstInfo, agreeTerms, isInternational } = get();
        const errors: {
          contact?: Record<string, string>;
          passengers?: Record<number, Record<string, string>>;
          gst?: Record<string, string>;
          terms?: string;
        } = {};

        let isValid = true;

        // Contact validation
        const contactErrors: Record<string, string> = {};
        if (!contactInfo.mobile.trim()) {
          contactErrors.mobile = "Mobile number is required";
          isValid = false;
        } else if (!/^\d{8,12}$/.test(contactInfo.mobile.replace(/\D/g, ""))) {
          contactErrors.mobile = "Enter a valid mobile number";
          isValid = false;
        }

        if (!contactInfo.email.trim()) {
          contactErrors.email = "Email address is required";
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
          contactErrors.email = "Enter a valid email address";
          isValid = false;
        }

        if (Object.keys(contactErrors).length > 0) {
          errors.contact = contactErrors;
        }

        // Passenger validation
        const passengerErrors: Record<number, Record<string, string>> = {};
        const today = new Date();

        passengers.forEach((p, idx) => {
          const pErrors: Record<string, string> = {};

          if (!p.title) {
            pErrors.title = "Select title";
            isValid = false;
          }
          if (!p.firstName.trim()) {
            pErrors.firstName = "First name is required";
            isValid = false;
          } else if (p.firstName.trim().length < 2) {
            pErrors.firstName = "First name must be at least 2 characters";
            isValid = false;
          }
          if (!p.lastName.trim()) {
            pErrors.lastName = "Last name is required";
            isValid = false;
          } else if (p.lastName.trim().length < 2) {
            pErrors.lastName = "Last name must be at least 2 characters";
            isValid = false;
          }
          if (!p.gender) {
            pErrors.gender = "Select gender";
            isValid = false;
          }

          if (!p.dateOfBirth) {
            pErrors.dateOfBirth = "Date of birth is required";
            isValid = false;
          } else {
            const dob = new Date(p.dateOfBirth);
            if (isNaN(dob.getTime()) || dob > today) {
              pErrors.dateOfBirth = "Enter a valid past date of birth";
              isValid = false;
            } else {
              const ageYears =
                (today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
              if (p.paxType === "ADT" && ageYears < 12) {
                pErrors.dateOfBirth = "Adult passenger must be at least 12 years old";
                isValid = false;
              } else if (p.paxType === "CHD" && (ageYears < 2 || ageYears >= 12)) {
                pErrors.dateOfBirth = "Child must be between 2 and 11 years old";
                isValid = false;
              } else if (p.paxType === "INF" && ageYears >= 2) {
                pErrors.dateOfBirth = "Infant must be under 2 years old";
                isValid = false;
              }
            }
          }

          if (!p.nationality.trim()) {
            pErrors.nationality = "Select nationality";
            isValid = false;
          }

          // Passport validation for international flights
          if (isInternational() && p.passport) {
            if (!p.passport.passportNumber.trim()) {
              pErrors.passportNumber = "Passport number is required";
              isValid = false;
            }
            if (!p.passport.expiryDate) {
              pErrors.passportExpiry = "Passport expiry date is required";
              isValid = false;
            } else {
              const exp = new Date(p.passport.expiryDate);
              if (isNaN(exp.getTime()) || exp <= today) {
                pErrors.passportExpiry = "Passport must not be expired";
                isValid = false;
              }
            }
          }

          if (Object.keys(pErrors).length > 0) {
            passengerErrors[idx] = pErrors;
          }
        });

        if (Object.keys(passengerErrors).length > 0) {
          errors.passengers = passengerErrors;
        }

        // GST validation (only if enabled)
        if (gstInfo.enabled) {
          const gstErrors: Record<string, string> = {};
          if (!gstInfo.gstNumber.trim()) {
            gstErrors.gstNumber = "GST Number is required";
            isValid = false;
          } else if (
            !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(
              gstInfo.gstNumber.trim()
            ) &&
            gstInfo.gstNumber.trim().length < 15
          ) {
            gstErrors.gstNumber = "Enter a valid 15-character GSTIN";
            isValid = false;
          }

          if (!gstInfo.companyName.trim()) {
            gstErrors.companyName = "Company name is required";
            isValid = false;
          }

          if (gstInfo.gstEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gstInfo.gstEmail)) {
            gstErrors.gstEmail = "Enter a valid GST email";
            isValid = false;
          }

          if (Object.keys(gstErrors).length > 0) {
            errors.gst = gstErrors;
          }
        }

        // Terms agreement
        if (!agreeTerms) {
          errors.terms = "Please accept the Terms & Conditions and airline fare rules";
          isValid = false;
        }

        return { isValid, errors };
      },
    }),
    {
      name: "flight-booking-store",
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          if (typeof window === "undefined") return null;
          try {
            return sessionStorage.getItem(name);
          } catch {
            return null;
          }
        },
        setItem: (name: string, value: string) => {
          if (typeof window === "undefined") return;
          try {
            sessionStorage.setItem(name, value);
          } catch (e) {
            console.warn("Storage quota exceeded in flight-booking-store", e);
          }
        },
        removeItem: (name: string) => {
          if (typeof window === "undefined") return;
          try {
            sessionStorage.removeItem(name);
          } catch {}
        },
      })),
    }
  )
);
