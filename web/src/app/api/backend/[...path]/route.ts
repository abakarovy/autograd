import { NextRequest, NextResponse } from "next/server";

import { getServerApiUrl } from "@/lib/env";

export const runtime = "nodejs";

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const backend = getServerApiUrl();
  const path = pathSegments.map(encodeURIComponent).join("/");
  const target = `${backend}/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let res: Response;
  try {
    res = await fetch(target, init);
  } catch {
    return NextResponse.json(
      { detail: "Backend недоступен. Проверьте API_URL на Vercel." },
      { status: 502 },
    );
  }

  const outHeaders = new Headers();
  const resType = res.headers.get("content-type");
  if (resType) outHeaders.set("content-type", resType);
  const cache = res.headers.get("cache-control");
  if (cache) outHeaders.set("cache-control", cache);

  return new NextResponse(res.body, { status: res.status, headers: outHeaders });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxyRequest(req, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
