import { NextResponse } from "next/server";
import axios from "axios";

/**
 * Server-Side Proxy Route Handler for User Login.
 *
 * Route: POST /api/auth/login
 *
 * Forwards login payload from browser (HTTPS) to external Login API (HTTP) server-side:
 * http://46.62.206.214:1678/api/v1.0/user/login
 *
 * Prevents browser Mixed Content errors in production.
 */

const LOGIN_API_TARGET_URL =
  process.env.LOGIN_API_BASE_URL ||
  process.env.NEXT_PUBLIC_LOGIN_API_BASE_URL ||
  "http://46.62.206.214:1678";

export async function POST(request: Request) {
  console.log("[LOGIN PROXY DEBUG] Request received at /api/auth/login");

  try {
    const body = await request.json();

    const targetEndpoint = `${LOGIN_API_TARGET_URL}/api/v1.0/user/login`;

    console.log("[LOGIN PROXY DEBUG] Forwarding login request to external API");
    console.log("[LOGIN PROXY DEBUG] External API URL:", targetEndpoint);

    const apiResponse = await axios.post(targetEndpoint, body, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    console.log("[LOGIN PROXY DEBUG] External API response status:", apiResponse.status);
    console.log("[LOGIN PROXY DEBUG] External API success:", !!apiResponse.data?.isSuccess);
    console.log("[LOGIN PROXY DEBUG] tokenId present:", !!apiResponse.data?.data?.tokenId);

    return NextResponse.json(apiResponse.data, { status: apiResponse.status });
  } catch (error: unknown) {
    console.error("[LOGIN PROXY DEBUG] Proxy request failed");

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || {
        isSuccess: false,
        message: error.message || "External Login API failed",
      };

      console.error("[LOGIN PROXY DEBUG] Status:", status);
      console.error("[LOGIN PROXY DEBUG] Error message:", error.message);

      return NextResponse.json(data, { status });
    }

    return NextResponse.json(
      {
        isSuccess: false,
        message: "Internal server proxy error during login",
      },
      { status: 500 }
    );
  }
}
