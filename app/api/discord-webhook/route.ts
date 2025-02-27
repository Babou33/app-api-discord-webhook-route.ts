import { NextResponse } from "next/server"
import { verifyKey } from "discord-interactions"

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

export async function POST(request: Request) {
  console.log("Received POST request")

  const signature = request.headers.get("x-signature-ed25519")
  const timestamp = request.headers.get("x-signature-timestamp")
  const body = await request.text()

  console.log("Headers:", request.headers)
  console.log("Body:", body)

  if (!signature || !timestamp || !DISCORD_PUBLIC_KEY) {
    console.error("Missing required headers or environment variables")
    return NextResponse.json({ error: "Missing required headers or environment variables" }, { status: 401 })
  }

  const isValidRequest = verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY)

  if (!isValidRequest) {
    console.error("Invalid request signature")
    return NextResponse.json({ error: "Invalid request signature" }, { status: 401 })
  }

  try {
    const payload = JSON.parse(body)
    console.log("Parsed payload:", payload)

    // Respond to PING
    if (payload.type === 1) {
      console.log("Responding to PING")
      return NextResponse.json({ type: 1 })
    }

    // Handle button click
    if (payload.type === 3 && payload.data.custom_id === "process_order") {
      console.log("Processing order")
      const messageId = payload.message.id
      const channelId = payload.channel_id

      // Update the message to "En cours de traitement"
      const processingEmbed = {
        ...payload.message.embeds[0],
        color: 15105570, // Orange
        fields: payload.message.embeds[0].fields.map((field) =>
          field.name === "📊 Statut" ? { ...field, value: "En cours de traitement" } : field,
        ),
      }

      const processingResponse = await fetch(
        `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            embeds: [processingEmbed],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 3,
                    label: "Marquer comme traitée",
                    custom_id: "mark_as_processed",
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!processingResponse.ok) {
        throw new Error(`Failed to update message: ${processingResponse.status}`)
      }

      return NextResponse.json({
        type: 4,
        data: {
          content: "La commande est en cours de traitement.",
          flags: 64, // Ephemeral flag
        },
      })
    }

    if (payload.type === 3 && payload.data.custom_id === "mark_as_processed") {
      console.log("Marking order as processed")
      const messageId = payload.message.id
      const channelId = payload.channel_id

      // Update the message to "Traitée"
      const processedEmbed = {
        ...payload.message.embeds[0],
        color: 5763719, // Green
        fields: payload.message.embeds[0].fields.map((field) =>
          field.name === "📊 Statut" ? { ...field, value: "Traitée" } : field,
        ),
      }

      const processedResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [processedEmbed],
          components: [], // Remove all buttons
        }),
      })

      if (!processedResponse.ok) {
        throw new Error(`Failed to update message: ${processedResponse.status}`)
      }

      return NextResponse.json({
        type: 4,
        data: {
          content: "La commande a été marquée comme traitée.",
          flags: 64, // Ephemeral flag
        },
      })
    }

    // For all other types of requests
    console.log("Received non-PING request")
    return NextResponse.json({ message: "Received" })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Error processing request" }, { status: 400 })
  }
}

export async function GET() {
  return new NextResponse("Discord webhook endpoint is running", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}

