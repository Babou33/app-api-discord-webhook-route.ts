import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  console.log("Middleware called for path:", request.nextUrl.pathname)
  const authCookie = request.cookies.get("auth")
  console.log("Auth cookie value:", authCookie?.value)

  if (!authCookie?.value && request.nextUrl.pathname !== "/login") {
    console.log("No auth cookie, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (authCookie?.value && request.nextUrl.pathname === "/login") {
    console.log("Auth cookie present, redirecting to home")
    return NextResponse.redirect(new URL("/", request.url))
  }

  console.log("Proceeding with request")
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login"],
}

