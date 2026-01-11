export async function POST(request) {
  try {
    const body = await request.json();

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message || !message.from) {
      return new Response('EVENT_RECEIVED', { status: 200 });
    }

    const customerPhone = message.from;
    const phoneId = "947925008394263"; // Phone Number ID ديالك

    await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: customerPhone,
        type: "template",
        template: {
          name: "welcome_with_links",
          language: { code: "ar" }
        }
      })
    });

    console.log("✅ Template sent successfully");
    return new Response('EVENT_RECEIVED', { status: 200 });

  } catch (error) {
    console.error("❌ Error:", error);
    return new Response('EVENT_RECEIVED', { status: 200 });
  }
}
