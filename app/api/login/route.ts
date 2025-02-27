import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { users } from "@/lib/users"

export async function POST(request: Request) {
  console.log("Login API called")
  const { username, password } = await request.json()
  console.log("Received credentials:", { username, password })

  const user = users.find((u) => u.username === username && u.password === password)

  if (user) {
    console.log("Valid credentials, setting cookie")
    cookies().set("auth", JSON.stringify({ username: user.username, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600, // 1 hour
    })
    return NextResponse.json({ success: true, role: user.role })
  } else {
    console.log("Invalid credentials")
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  }
}

