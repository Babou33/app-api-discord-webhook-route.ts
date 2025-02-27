import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderNumber, newStatus } = await request.json()

    if (!orderNumber || !newStatus) {
      return NextResponse.json(
        { success: false, error: "Numéro de commande et nouveau statut requis" },
        { status: 400 },
      )
    }

    const embed = {
      title: `🔄 Mise à jour de la Commande #${orderNumber}`,
      color: 5793266, // Bleu
      fields: [
        {
          name: "📊 Nouveau Statut",
          value: newStatus,
        },
      ],
      footer: {
        text: `Commande Delight #${orderNumber}`,
      },
      timestamp: new Date().toISOString(),
    }

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

