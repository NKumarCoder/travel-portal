import { create } from "zustand";
import { persist } from "zustand/middleware";
import { debugLog } from "@/lib/debug";
import type { Seat, BusBoardingPoint, Bus, BusSeatLayout } from "@/types";

// ============================================================
// Traveller & Booking Types
// ============================================================

export type BookingStep = "search" | "seats" | "travellers" | "review" | "payment" | "confirmation";

export interface MockBookingResult {
  bookingId: string;
  pnr: string;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  createdAt: string;
}

export interface TravellerInfo {
  fullName: string;
  age: string;
  gender: "male" | "female" | "other" | "";
  nationality: string;
  idType: string;
  idNumber: string;
  seatNo: string;
}

export interface ContactInfo {
  mobile: string;
  email: string;
  countryCode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface GSTInfo {
  gstNumber: string;
  companyName: string;
  companyAddress: string;
}

// ============================================================
// Store Interface
// ============================================================

interface BusBookingState {
  // Modal state
  isSeatModalOpen: boolean;
  seatModalBus: Bus | null;

  // Search context
  traceId: string | null;
  tripKey: string | null;
  selectedBusData: Bus | null;

  // Seat selection
  busId: string | null;
  selectedSeats: Seat[];
  boardingPoint: BusBoardingPoint | null;
  droppingPoint: BusBoardingPoint | null;
  maxSeats: number;
  seatLayout: BusSeatLayout | null;

  // Traveller details
  travellers: TravellerInfo[];
  contactInfo: ContactInfo;
  emergencyContact: EmergencyContact;
  gstInfo: GSTInfo;
  bookingNotes: string;
  showReview: boolean;

  // Booking flow
  currentStep: BookingStep;
  couponCode: string | null;
  couponDiscount: number;
  walletDeduction: number;
  bookingResult: MockBookingResult | null;

  // Seat selection actions
  setBusId: (id: string) => void;
  setTraceId: (id: string) => void;
  setTripKey: (key: string) => void;
  setSelectedBusData: (bus: Bus | null) => void;
  setSeatLayout: (layout: BusSeatLayout | null) => void;
  openSeatModal: (bus: Bus) => void;
  closeSeatModal: () => void;
  toggleSeat: (seat: Seat) => void;
  removeSeat: (seatNo: string) => void;
  clearSeats: () => void;
  setBoardingPoint: (point: BusBoardingPoint | null) => void;
  setDroppingPoint: (point: BusBoardingPoint | null) => void;

  // Traveller actions
  initTravellers: () => void;
  updateTraveller: (index: number, data: Partial<TravellerInfo>) => void;
  setContactInfo: (data: Partial<ContactInfo>) => void;
  setEmergencyContact: (data: Partial<EmergencyContact>) => void;
  setGSTInfo: (data: Partial<GSTInfo>) => void;
  setBookingNotes: (notes: string) => void;
  setShowReview: (show: boolean) => void;

  // Booking flow actions
  setCurrentStep: (step: BookingStep) => void;
  applyCouponDiscount: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setWalletDeduction: (amount: number) => void;
  createMockBooking: () => MockBookingResult;

  // Reset
  resetBooking: () => void;
  resetTravellerForms: () => void;

  // Computed values
  getBaseFare: () => number;
  getTaxes: () => number;
  getConvenienceFee: () => number;
  getTotalAmount: () => number;
  getFinalPayable: () => number;
  isValid: () => boolean;
  isTravellerFormValid: () => boolean;
  isContactValid: () => boolean;
}

// ============================================================
// Initial State
// ============================================================

const initialContactInfo: ContactInfo = {
  mobile: "",
  email: "",
  countryCode: "+91",
};

const initialEmergencyContact: EmergencyContact = {
  name: "",
  relationship: "",
  phone: "",
};

const initialGSTInfo: GSTInfo = {
  gstNumber: "",
  companyName: "",
  companyAddress: "",
};

function createEmptyTraveller(seatNo: string): TravellerInfo {
  return {
    fullName: "",
    age: "",
    gender: "",
    nationality: "",
    idType: "",
    idNumber: "",
    seatNo,
  };
}

// ============================================================
// Store
// ============================================================

export const useBusBookingStore = create<BusBookingState>()(
  persist(
    (set, get) => ({
      // Modal state
      isSeatModalOpen: false,
      seatModalBus: null,

      // Search context
      traceId: null,
      tripKey: null,
      selectedBusData: null,

      // Seat selection state
      busId: null,
      selectedSeats: [],
      boardingPoint: null,
      droppingPoint: null,
      maxSeats: 6,
      seatLayout: null,

      // Traveller state
      travellers: [],
      contactInfo: initialContactInfo,
      emergencyContact: initialEmergencyContact,
      gstInfo: initialGSTInfo,
      bookingNotes: "",
      showReview: false,

      // Booking flow state
      currentStep: "search" as BookingStep,
      couponCode: null,
      couponDiscount: 0,
      walletDeduction: 0,
      bookingResult: null,

      // Seat selection actions
      setBusId: (id) => {
        debugLog("BOOKING_STORE_UPDATED", { action: "setBusId", busId: id });
        set({ busId: id });
      },

      setTraceId: (id) => {
        debugLog("BOOKING_STORE_UPDATED", { action: "setTraceId", traceId: id });
        set({ traceId: id });
      },

      setTripKey: (key) => {
        debugLog("BOOKING_STORE_UPDATED", { action: "setTripKey", tripKey: key });
        set({ tripKey: key });
      },

      setSelectedBusData: (bus) => {
        set({ selectedBusData: bus });
      },

      setSeatLayout: (layout) => {
        set({ seatLayout: layout });
      },

      openSeatModal: (bus) => {
        debugLog("SEAT_MODAL_OPENED", { busId: bus.id, operator: bus.operator });
        set({
          isSeatModalOpen: true,
          seatModalBus: bus,
          selectedBusData: bus,
          busId: bus.id,
          selectedSeats: [],
          boardingPoint: null,
          droppingPoint: null,
          seatLayout: null,
        });
      },

      closeSeatModal: () => {
        debugLog("SEAT_MODAL_CLOSED");
        set({ isSeatModalOpen: false });
      },

      toggleSeat: (seat) =>
        set((state) => {
          const exists = state.selectedSeats.find((s) => s.seatNo === seat.seatNo);
          if (exists) {
            const updated = state.selectedSeats.filter((s) => s.seatNo !== seat.seatNo);
            debugLog("BOOKING_STORE_UPDATED", { action: "removeSeat", seatNo: seat.seatNo, totalSelected: updated.length });
            return { selectedSeats: updated };
          }
          if (state.selectedSeats.length >= state.maxSeats) {
            debugLog("SEAT_LIMIT_REACHED", { maxSeats: state.maxSeats }, "warn");
            return state;
          }
          const updated = [...state.selectedSeats, seat];
          debugLog("BOOKING_STORE_UPDATED", { action: "addSeat", seatNo: seat.seatNo, totalSelected: updated.length });
          return { selectedSeats: updated };
        }),

      removeSeat: (seatNo) =>
        set((state) => ({
          selectedSeats: state.selectedSeats.filter((s) => s.seatNo !== seatNo),
        })),

      clearSeats: () => set({ selectedSeats: [] }),

      setBoardingPoint: (point) => {
        debugLog("BOOKING_STORE_UPDATED", { action: "setBoardingPoint", point: point?.name || null });
        set({ boardingPoint: point });
      },
      setDroppingPoint: (point) => {
        debugLog("BOOKING_STORE_UPDATED", { action: "setDroppingPoint", point: point?.name || null });
        set({ droppingPoint: point });
      },

      // Traveller actions
      initTravellers: () =>
        set((state) => {
          const { selectedSeats, travellers } = state;
          // Preserve existing data where seat still matches
          const newTravellers = selectedSeats.map((seat) => {
            const existing = travellers.find((t) => t.seatNo === seat.seatNo);
            return existing || createEmptyTraveller(seat.seatNo);
          });
          return { travellers: newTravellers };
        }),

      updateTraveller: (index, data) =>
        set((state) => {
          const updated = [...state.travellers];
          if (updated[index]) {
            updated[index] = { ...updated[index], ...data };
          }
          return { travellers: updated };
        }),

      setContactInfo: (data) =>
        set((state) => ({
          contactInfo: { ...state.contactInfo, ...data },
        })),

      setEmergencyContact: (data) =>
        set((state) => ({
          emergencyContact: { ...state.emergencyContact, ...data },
        })),

      setGSTInfo: (data) =>
        set((state) => ({
          gstInfo: { ...state.gstInfo, ...data },
        })),

      setBookingNotes: (notes) => set({ bookingNotes: notes }),
      setShowReview: (show) => set({ showReview: show }),

      // Booking flow actions
      setCurrentStep: (step) => {
        debugLog("BOOKING_STEP_CHANGED", { step });
        set({ currentStep: step });
      },

      applyCouponDiscount: (code, discount) => {
        debugLog("COUPON_APPLIED_TO_STORE", { code, discount }, "success");
        set({ couponCode: code, couponDiscount: discount });
      },

      removeCoupon: () => {
        debugLog("COUPON_REMOVED");
        set({ couponCode: null, couponDiscount: 0 });
      },

      setWalletDeduction: (amount) => {
        debugLog("WALLET_DEDUCTION_SET", { amount });
        set({ walletDeduction: amount });
      },

      createMockBooking: () => {
        const bookingId = `NXV${Date.now().toString(36).toUpperCase()}`;
        const pnr = `TRV${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${Math.floor(Math.random() * 99999).toString().padStart(5, "0")}`;
        const result: MockBookingResult = {
          bookingId,
          pnr,
          status: "CONFIRMED",
          createdAt: new Date().toISOString(),
        };
        debugLog("MOCK_BOOKING_CREATED", result, "success");
        set({ bookingResult: result, currentStep: "confirmation" });
        return result;
      },

      // Reset
      resetBooking: () =>
        set({
          isSeatModalOpen: false,
          seatModalBus: null,
          traceId: null,
          tripKey: null,
          selectedBusData: null,
          busId: null,
          selectedSeats: [],
          boardingPoint: null,
          droppingPoint: null,
          seatLayout: null,
          travellers: [],
          contactInfo: initialContactInfo,
          emergencyContact: initialEmergencyContact,
          gstInfo: initialGSTInfo,
          bookingNotes: "",
          showReview: false,
          currentStep: "search" as BookingStep,
          couponCode: null,
          couponDiscount: 0,
          walletDeduction: 0,
          bookingResult: null,
        }),

      resetTravellerForms: () =>
        set((state) => ({
          travellers: state.selectedSeats.map((s) => createEmptyTraveller(s.seatNo)),
          contactInfo: initialContactInfo,
          emergencyContact: initialEmergencyContact,
          gstInfo: initialGSTInfo,
          bookingNotes: "",
          showReview: false,
        })),

      // Computed values
      getBaseFare: () => {
        const { selectedSeats } = get();
        return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
      },

      getTaxes: () => {
        const baseFare = get().getBaseFare();
        return Math.round(baseFare * 0.05);
      },

      getConvenienceFee: () => {
        const { selectedSeats } = get();
        return selectedSeats.length * 25;
      },

      getTotalAmount: () => {
        return get().getBaseFare() + get().getTaxes() + get().getConvenienceFee();
      },

      getFinalPayable: () => {
        const total = get().getTotalAmount();
        const { couponDiscount, walletDeduction } = get();
        return Math.max(0, total - couponDiscount - walletDeduction);
      },

      isValid: () => {
        const { selectedSeats, boardingPoint, droppingPoint } = get();
        return selectedSeats.length > 0 && boardingPoint !== null && droppingPoint !== null;
      },

      isTravellerFormValid: () => {
        const { travellers } = get();
        if (travellers.length === 0) return false;
        return travellers.every(
          (t) =>
            t.fullName.trim().length >= 2 &&
            t.age.trim() !== "" &&
            parseInt(t.age) > 0 &&
            parseInt(t.age) <= 120 &&
            t.gender !== ""
        );
      },

      isContactValid: () => {
        const { contactInfo } = get();
        const phoneRegex = /^[6-9]\d{9}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
          phoneRegex.test(contactInfo.mobile) &&
          emailRegex.test(contactInfo.email)
        );
      },
    }),
    {
      name: "bus-booking-store",
      partialize: (state) => ({
        traceId: state.traceId,
        tripKey: state.tripKey,
        selectedBusData: state.selectedBusData,
        busId: state.busId,
        selectedSeats: state.selectedSeats,
        boardingPoint: state.boardingPoint,
        droppingPoint: state.droppingPoint,
        seatLayout: state.seatLayout,
        travellers: state.travellers,
        contactInfo: state.contactInfo,
        emergencyContact: state.emergencyContact,
        gstInfo: state.gstInfo,
        bookingNotes: state.bookingNotes,
        currentStep: state.currentStep,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        walletDeduction: state.walletDeduction,
        bookingResult: state.bookingResult,
      }),
    }
  )
);
