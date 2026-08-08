import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";

/**
 * Universal Server-Side API Proxy Catch-all Route Handler.
 *
 * Route: /api/backend/[...path]
 *
 * Proxies browser requests (HTTPS) to the external General API backend server (HTTP):
 * http://46.62.206.214:1621/...
 *
 * Forwards HTTP method, headers (including Authorization token), query parameters, and body.
 * Eliminates browser Mixed Content errors.
 */

const GENERAL_API_TARGET_URL =
  process.env.GENERAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://46.62.206.214:1621";

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path ? path.join("/") : "";
  const searchParams = request.nextUrl.search;
  const targetUrl = `${GENERAL_API_TARGET_URL}/${pathString}${searchParams}`;

  console.log("[API PROXY DEBUG] Incoming request:", request.method, request.nextUrl.pathname);
  console.log("[API PROXY DEBUG] Client endpoint:", `/${pathString}${searchParams}`);
  console.log("[API PROXY DEBUG] Backend target:", targetUrl);
  console.log("[API PROXY DEBUG] Method:", request.method);

  // Extract headers to forward
  const incomingHeaders = request.headers;
  const headersToForward: Record<string, string> = {
    "content-type": incomingHeaders.get("content-type") || "application/json",
    accept: incomingHeaders.get("accept") || "application/json",
  };

  const authHeader = incomingHeaders.get("authorization");
  if (authHeader) {
    headersToForward["authorization"] = authHeader;
    console.log("[API PROXY DEBUG] Forwarding Authorization header: present");
  } else {
    console.log("[API PROXY DEBUG] Forwarding Authorization header: none");
  }

  // Parse request body for methods that support it
  let bodyData: unknown = undefined;
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      bodyData = await request.json();
    } catch {
      // Body might be empty or unparseable JSON
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

    console.log("[API PROXY DEBUG] Response status:", apiResponse.status);

    const contentType = typeof apiResponse.headers["content-type"] === "string" 
      ? apiResponse.headers["content-type"] 
      : "application/json";

    return NextResponse.json(apiResponse.data, {
      status: apiResponse.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error: unknown) {
    console.error("[API PROXY DEBUG] Backend proxy request failed");

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 502;
      const data = error.response?.data || {
        error: error.message || "Bad gateway: failed to reach backend API server",
      };
      console.error("[API PROXY DEBUG] Axios error:", error.message, "Status:", status);
      return NextResponse.json(data, { status });
    }

    return NextResponse.json(
      { error: "Internal server proxy error" },
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
