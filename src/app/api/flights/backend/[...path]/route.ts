import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";

/**
 * Universal Server-Side API Proxy Catch-all Route Handler for Flight APIs.
 *
 * Route: /api/flights/backend/[...path]
 *
 * Proxies browser requests to the external Flight API backend:
 * https://stagingflightapi.etravos.in/...
 *
 * Forwards HTTP method, headers (including Authorization Bearer token),
 * query parameters, and body. Eliminates browser CORS issues.
 */

const FLIGHT_API_TARGET_URL =
  process.env.FLIGHT_API_BASE_URL || "https://stagingflightapi.etravos.in";

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path ? path.join("/") : "";
  const searchParams = request.nextUrl.search;
  const targetUrl = `${FLIGHT_API_TARGET_URL}/${pathString}${searchParams}`;

  if (process.env.NODE_ENV === "development") {
    console.log("[FLIGHT API PROXY] Method:", request.method);
    console.log("[FLIGHT API PROXY] Target URL:", targetUrl);
  }

  // Extract headers to forward
  const incomingHeaders = request.headers;
  const headersToForward: Record<string, string> = {
    "content-type": incomingHeaders.get("content-type") || "application/json",
    accept: incomingHeaders.get("accept") || "application/json",
  };

  const authHeader = incomingHeaders.get("authorization");
  if (authHeader) {
    headersToForward["authorization"] = authHeader;
    if (process.env.NODE_ENV === "development") {
      console.log("[FLIGHT API PROXY] Forwarding Authorization header: present");
    }
  } else if (process.env.NODE_ENV === "development") {
    console.log("[FLIGHT API PROXY] Forwarding Authorization header: none");
  }

  // Parse request body for methods that support it
  let bodyData: unknown = undefined;
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      bodyData = await request.json();
    } catch {
      // Body might be empty or not JSON
    }
  }

  try {
    const apiResponse = await axios({
      method: request.method,
      url: targetUrl,
      headers: headersToForward,
      data: bodyData,
      timeout: 30000,
      validateStatus: () => true, // Pass through all HTTP status codes
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[FLIGHT API PROXY] Response status:", apiResponse.status);
    }

    const contentType =
      typeof apiResponse.headers["content-type"] === "string"
        ? apiResponse.headers["content-type"]
        : "application/json";

    return NextResponse.json(apiResponse.data, {
      status: apiResponse.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error: unknown) {
    console.error("[FLIGHT API PROXY] Backend proxy request failed");

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 502;
      const data = error.response?.data || {
        error: error.message || "Bad gateway: failed to reach Flight API backend",
      };
      console.error("[FLIGHT API PROXY] Axios error:", error.message, "Status:", status);
      return NextResponse.json(data, { status });
    }

    return NextResponse.json(
      { error: "Internal server proxy error for Flight API" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, context);
}
