"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
})

export default function LoginPage() {
  const [error, setError] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitting form with values:", values)
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok && data.success) {
        console.log("Login successful, redirecting...")
        window.location.href = "/"
      } else {
        console.error("Login failed:", data.message)
        setError(data.message || "Nom d'utilisateur ou mot de passe incorrect")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Une erreur est survenue lors de la connexion")
    }
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
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">Commande Delight</h1>
          <p className="text-lg text-amber-700">Connectez-vous pour accéder au formulaire de commande</p>
        </header>

        <div className="max-w-md mx-auto">
          <Card className="bg-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-amber-800">Connexion</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-900 font-semibold">Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input placeholder="Entrez votre nom d'utilisateur" {...field} className="bg-white/70" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-900 font-semibold">Mot de passe</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Entrez votre mot de passe"
                            {...field}
                            className="bg-white/70"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    Se connecter
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-8 text-center text-amber-700 text-sm">
          <p>© {new Date().getFullYear()} Commande Delight - Tous droits réservés</p>
        </footer>
      </div>
    </div>
  )
}

