import { create } from "zustand";
import type { Booking } from "@/types";

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;

  loadBookings: () => void;
  setCurrentBooking: (booking: Booking | null) => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
}

const mockBookings: Booking[] = [
  {
    id: "bk-001",
    userId: "usr-001",
    type: "flight",
    status: "confirmed",
    itemId: "fl-001",
    bookingDate: "2026-06-10",
    travelDate: "2026-07-15",
    travelers: [
      { firstName: "Alex", lastName: "Johnson", age: 34, type: "adult" },
      { firstName: "Sam", lastName: "Johnson", age: 32, type: "adult" },
    ],
    totalAmount: 1290,
    currency: "USD",
    paymentStatus: "paid",
    cancellationPolicy: "Free cancellation until July 10, 2026",
  },
  {
    id: "bk-002",
    userId: "usr-001",
    type: "hotel",
    status: "pending",
    itemId: "ht-001",
    bookingDate: "2026-06-12",
    travelDate: "2026-08-01",
    travelers: [
      { firstName: "Alex", lastName: "Johnson", age: 34, type: "adult" },
    ],
    totalAmount: 1600,
    currency: "USD",
    paymentStatus: "pending",
    cancellationPolicy: "Free cancellation up to 48 hours before check-in",
  },
];

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,

  loadBookings: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ bookings: mockBookings, isLoading: false });
    }, 500);
  },

  setCurrentBooking: (booking) => set({ currentBooking: booking }),

  addBooking: (booking) =>
    set((state) => ({
      bookings: [...state.bookings, booking],
    })),

  cancelBooking: (bookingId) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b
      ),
    })),
}));
