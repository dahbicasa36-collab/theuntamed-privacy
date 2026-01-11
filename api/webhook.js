export default async function handler(req, res) {

  // ✅ Verification
  if (req.method === "GET") {
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    if (searchParams.get("hub.verify_token") === "verify123") {
      return res.status(200).send(searchParams.get("hub.challenge"));
    }
    return res.status(403).end();
  }

  // ✅ Webhook events
  if (req.method === "POST") {

    // ⛔ ردّ مباشرة على Meta
    res.status(200).send("EVENT_RECEIVED");

    try {
      // 🛑 تأكّد أن body موجود و JSON
      if (!req.body || typeof req.body !== "object") {
        console.log("⚠️ Body غير صالح، تم تجاهله");
        return;
      }

      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (!message || !message.from) {
        console.log("ℹ️ Event بدون رسالة");
        return;
      }

      const customerPhone = message.from;
      const phoneId = "947925008394263";

      const headers = {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      };

      // ✅ نص
      await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: customerPhone,
          type: "text",
          text: {
            body: "🌺 مرحباً بكم معنا 🌺\n\n👉 https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH"
          }
        })
      });

      // ✅ أوديو
      await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: customerPhone,
          type: "audio",
          audio: {
            link: "https://theuntamed-privacy.vercel.app/audio01.mp3"
          }
        })
      });

      console.log("✅ Message + Audio sent");

    } catch (err) {
      console.error("❌ خطأ أثناء المعالجة:", err);
    }

    return;
  }

  return res.status(405).end();
}
