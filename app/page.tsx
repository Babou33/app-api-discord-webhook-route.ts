import { RestaurantOrderForm } from "@/components/restaurant-order-form"
import { Button } from "@/components/ui/button"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function Home() {
  const authCookie = cookies().get("auth")

  if (!authCookie || !authCookie.value) {
    console.log("Home: User not authenticated, redirecting to login")
    redirect("/login")
  }

  const { username, role } = JSON.parse(authCookie.value)

  async function logout() {
    "use server"
    console.log("Logging out user")
    cookies().set("auth", "", { expires: new Date(0) })
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 relative">
      {/* Background logo */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Noodles_5-etucnsAnFxBghHG2RFH5kvZK8jPOvt.png")',
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-8 text-center flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-amber-800">Commande Delight</h1>
            <p className="text-lg text-amber-700">
              Bienvenue, {username} ({role})
            </p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline">
              Se déconnecter
            </Button>
          </form>
        </header>

        <div className="max-w-md mx-auto bg-white/40 rounded-lg shadow-lg p-6">
          <RestaurantOrderForm />
        </div>

        <footer className="mt-8 text-center text-amber-700 text-sm">
          <p>© {new Date().getFullYear()} Commande Delight - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  )
}

