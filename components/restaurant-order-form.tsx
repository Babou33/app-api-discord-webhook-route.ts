"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Send, Check, AlertCircle, Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  nomEntreprise: z.string().min(2, {
    message: "Le nom de l'entreprise doit contenir au moins 2 caractères.",
  }),
  numeroTelephone: z.string().min(1, {
    message: "Le numéro de téléphone est requis.",
  }),
  horaireDisponibiliteDebut: z.string().refine(
    (time) => {
      const [hours, minutes] = time.split(":").map(Number)
      return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
    },
    {
      message: "Veuillez entrer un horaire valide au format 24h (ex: 14:30).",
    },
  ),
  horaireDisponibiliteFin: z.string().refine(
    (time) => {
      const [hours, minutes] = time.split(":").map(Number)
      return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60
    },
    {
      message: "Veuillez entrer un horaire valide au format 24h (ex: 14:30).",
    },
  ),
  menus: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().min(0, "La quantité ne peut pas être négative"),
      }),
    )
    .refine((menus) => menus.some((menu) => menu.quantity > 0), {
      message: "Veuillez sélectionner au moins un menu.",
    }),
  informationsSupplementaires: z.string().optional(),
})

const menus = [
  { id: "classique", name: "Le classique", description: "1 Burger + 1 coca + 1 cookie", price: 12.99 },
  {
    id: "fraicheur",
    name: "Fraicheur Légère",
    description: "1 salade césar + 1 oasis + 1 tarte au citron",
    price: 14.99,
  },
  {
    id: "delight",
    name: "Le Delight",
    description: "1 planche de charcuterie + 1 caramel macchiato + 1 charlotte aux fraises",
    price: 18.99,
  },
  { id: "gourmand", name: "Le Gourmand", description: "1 Croque Monsieur + 1 Jus d'ananas + 1 Brownie", price: 15.99 },
  {
    id: "festin",
    name: "Le festin",
    description: "1 Pizza Jambon + 1 Frite patate douce + 2 Pain perdu + 3 Limonade",
    price: 24.99,
  },
]

export function RestaurantOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomEntreprise: "",
      numeroTelephone: "",
      horaireDisponibiliteDebut: "",
      horaireDisponibiliteFin: "",
      menus: menus.map((menu) => ({ id: menu.id, quantity: 0 })),
      informationsSupplementaires: "",
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "menus",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSuccess(false)
    setError(null)

    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Une erreur est survenue lors de l'envoi de la commande.")
        return
      }

      setSuccess(true)
      form.reset()
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>Votre commande a été envoyée avec succès !</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="nomEntreprise"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-900 font-semibold">Nom de l'entreprise</FormLabel>
              <FormControl>
                <Input placeholder="Nom de l'entreprise" {...field} className="bg-white/70" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numeroTelephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-900 font-semibold">Numéro de téléphone</FormLabel>
              <FormControl>
                <Input placeholder="Numéro de téléphone" {...field} className="bg-white/70" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="horaireDisponibiliteDebut"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-amber-900 font-semibold">Disponibilité début</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="HH:MM" {...field} className="bg-white/70" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horaireDisponibiliteFin"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-amber-900 font-semibold">Disponibilité fin</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="HH:MM" {...field} className="bg-white/70" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel className="text-amber-900 font-semibold">Menus</FormLabel>
          <p className="text-sm text-amber-700 mb-2">
            Indiquez le nombre de menus que vous souhaitez commander pour chaque type :
          </p>
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`menus.${index}.quantity`}
              render={({ field: quantityField }) => (
                <FormItem className="flex items-center space-x-3 space-y-0 mb-2">
                  <FormLabel className="flex-grow cursor-pointer">
                    <span className="font-semibold text-amber-900">{menus[index].name}</span>
                    <br />
                    <span className="text-sm text-emerald-700">{menus[index].description}</span>
                    <br />
                    <span className="text-sm text-amber-600">{menus[index].price.toFixed(2)}$</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() => quantityField.onChange(Math.max(0, quantityField.value - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        {...quantityField}
                        className="h-8 w-16 rounded-none text-center bg-white/70"
                        onChange={(e) => quantityField.onChange(Number.parseInt(e.target.value) || 0)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => quantityField.onChange(quantityField.value + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
          <FormMessage>{form.formState.errors.menus?.message}</FormMessage>
        </div>

        <FormField
          control={form.control}
          name="informationsSupplementaires"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-amber-900 font-semibold">Informations supplémentaires</FormLabel>
              <FormControl>
                <Textarea placeholder="Informations supplémentaires" {...field} className="bg-white/70" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
          {isSubmitting ? (
            <>Envoi en cours...</>
          ) : (
            <>
              Envoyer la commande <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

