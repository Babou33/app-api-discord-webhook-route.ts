import { NextResponse } from "next/server"

const menus = {
  classique: { name: "Le classique", description: "1 Burger + 1 coca + 1 cookie", price: 12.99 },
  fraicheur: { name: "Fraicheur Légère", description: "1 salade césar + 1 oasis + 1 tarte au citron", price: 14.99 },
  delight: {
    name: "Le Delight",
    description: "1 planche de charcuterie + 1 caramel macchiato + 1 charlotte aux fraises",
    price: 18.99,
  },
  gourmand: { name: "Le Gourmand", description: "1 Croque Monsieur + 1 Jus d'ananas + 1 Brownie", price: 15.99 },
  festin: {
    name: "Le festin",
    description: "1 Pizza Jambon + 1 Frite patate douce + 2 Pain perdu + 3 Limonade",
    price: 24.99,
  },
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    let totalPrice = 0
    const menuDescription = data.menus
      .filter((menu: { id: string; quantity: number }) => menu.quantity > 0)
      .map((menu: { id: string; quantity: number }) => {
        const menuInfo = menus[menu.id as keyof typeof menus] || { name: "Menu inconnu", description: "", price: 0 }
        const menuTotal = menuInfo.price * menu.quantity
        totalPrice += menuTotal
        return `• **${menuInfo.name}** (x${menu.quantity})\n  ${menuInfo.description}\n  Prix: ${menuTotal.toFixed(2)}$`
      })
      .join("\n\n")

    // Create a Discord embed
    const embed = {
      title: "🍽️ Nouvelle Commande Delight",
      color: 16776960, // Jaune
      fields: [
        {
          name: "🏢 Entreprise",
          value: data.nomEntreprise,
        },
        {
          name: "☎️ Téléphone",
          value: data.numeroTelephone,
        },
        {
          name: "🕒 Tranche horaire de disponibilité",
          value: `${data.horaireDisponibiliteDebut} - ${data.horaireDisponibiliteFin}`,
        },
        {
          name: "🍴 Menus commandés",
          value: menuDescription || "Aucun menu sélectionné",
        },
        {
          name: "💰 Prix total",
          value: `${totalPrice.toFixed(2)}$`,
        },
      ],
      footer: {
        text: "Commande Delight",
      },
      timestamp: new Date().toISOString(),
    }

    // Ajoutez les informations supplémentaires si elles existent
    if (data.informationsSupplementaires) {
      embed.fields.push({
        name: "📝 Informations supplémentaires",
        value: data.informationsSupplementaires,
      })
    }

    // Send to Discord webhook
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      throw new Error("URL du webhook Discord non configurée")
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erreur Discord:", errorText)
      throw new Error(`Erreur Discord: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Une erreur est survenue" },
      { status: 500 },
    )
  }
}

