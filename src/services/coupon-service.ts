import { USE_MOCK_DATA } from "./config";
import { debugLog } from "@/lib/debug";

// ============================================================
// Mock Coupon Engine
// ============================================================

export interface Coupon {
  code: string;
  description: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  maxDiscount?: number;
  minOrder: number;
  validUntil: string;
  applicableOn: ("bus" | "flight" | "hotel" | "activity" | "package")[];
}

export interface CouponResult {
  success: boolean;
  discount: number;
  updatedFare: number;
  message: string;
  coupon?: Coupon;
}

const MOCK_COUPONS: Coupon[] = [
  {
    code: "WELCOME100",
    description: "₹100 off on your first booking",
    discountType: "flat",
    discountValue: 100,
    minOrder: 500,
    validUntil: "2027-12-31",
    applicableOn: ["bus", "flight", "hotel", "activity", "package"],
  },
  {
    code: "BUS50",
    description: "₹50 off on bus bookings",
    discountType: "flat",
    discountValue: 50,
    minOrder: 300,
    validUntil: "2027-12-31",
    applicableOn: ["bus"],
  },
  {
    code: "SAVE200",
    description: "₹200 off on orders above ₹1500",
    discountType: "flat",
    discountValue: 200,
    minOrder: 1500,
    validUntil: "2027-12-31",
    applicableOn: ["bus", "flight", "hotel"],
  },
  {
    code: "TRAVEL10",
    description: "10% off (max ₹300)",
    discountType: "percentage",
    discountValue: 10,
    maxDiscount: 300,
    minOrder: 800,
    validUntil: "2027-12-31",
    applicableOn: ["bus", "flight"],
  },
  {
    code: "SUMMER25",
    description: "25% off on activities (max ₹500)",
    discountType: "percentage",
    discountValue: 25,
    maxDiscount: 500,
    minOrder: 1000,
    validUntil: "2027-08-31",
    applicableOn: ["activity", "package"],
  },
];

/**
 * Validate and apply a coupon code.
 */
export async function applyCoupon(
  code: string,
  orderAmount: number,
  bookingType: "bus" | "flight" | "hotel" | "activity" | "package" = "bus"
): Promise<CouponResult> {
  if (USE_MOCK_DATA) {
    await delay(500);
  }

  const upperCode = code.trim().toUpperCase();
  debugLog("COUPON_APPLIED", { code: upperCode, orderAmount, bookingType });

  const coupon = MOCK_COUPONS.find((c) => c.code === upperCode);

  if (!coupon) {
    debugLog("COUPON_INVALID", { code: upperCode }, "error");
    return {
      success: false,
      discount: 0,
      updatedFare: orderAmount,
      message: "Invalid coupon code. Please check and try again.",
    };
  }

  if (!coupon.applicableOn.includes(bookingType)) {
    return {
      success: false,
      discount: 0,
      updatedFare: orderAmount,
      message: `This coupon is not applicable on ${bookingType} bookings.`,
    };
  }

  if (orderAmount < coupon.minOrder) {
    return {
      success: false,
      discount: 0,
      updatedFare: orderAmount,
      message: `Minimum order amount is ₹${coupon.minOrder} for this coupon.`,
    };
  }

  let discount = 0;
  if (coupon.discountType === "flat") {
    discount = coupon.discountValue;
  } else {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  const updatedFare = orderAmount - discount;

  debugLog("COUPON_SUCCESS", { code: upperCode, discount, updatedFare }, "success");

  return {
    success: true,
    discount,
    updatedFare,
    message: `Coupon applied! You save ₹${discount}.`,
    coupon,
  };
}

/**
 * Get all available coupons for display.
 */
export async function getAvailableCoupons(
  bookingType: "bus" | "flight" | "hotel" | "activity" | "package" = "bus"
): Promise<Coupon[]> {
  if (USE_MOCK_DATA) {
    await delay(300);
  }
  return MOCK_COUPONS.filter((c) => c.applicableOn.includes(bookingType));
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
