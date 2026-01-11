export default async function handler(req, res) {
  // 1️⃣ التحقق من Webhook (GET)
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === 'verify123') {
      console.log("✅ Webhook verified successfully");
      return res.status(200).send(challenge);
    }

    console.warn("❌ Webhook verification failed");
    return res.status(403).send("Verification failed");
  }

  // 2️⃣ استقبال رسالة من واتساب (POST)
  if (req.method === 'POST') {
    try {
      const entry = req.body?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (!message || !message.from) {
        console.log("ℹ️ EVENT_RECEIVED بدون رسالة");
        return res.status(200).send("EVENT_RECEIVED بدون رسالة");
      }

      const customerPhone = message.from;
      const phoneId = "947925008394263"; // ✅ تأكد أنه صحيح من Meta
      const token = process.env.WHATSAPP_TOKEN;

      if (!token) {
        console.error("❌ WHATSAPP_TOKEN غير موجود في Vercel");
        return res.status(500).send("Token missing");
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      // 3️⃣ إرسال رسالة نصية
      const textResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: customerPhone,
          type: "text",
          text: {
            body: "🌺 مرحباً بكم معنا 🌺\n\nرابط المجموعة الخاصة:\n👉 https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH"
          }
        })
      });

      const textResult = await textResponse.json();
      console.log("📨 تم إرسال الرسالة:", textResult);

      // 4️⃣ إرسال أوديو
      const audioResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
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

      const audioResult = await audioResponse.json();
      console.log("🔊 تم إرسال الأوديو:", audioResult);

      // 5️⃣ النتيجة النهائية
      return res.status(200).send(`✅ تم إرسال رسالة وأوديو إلى ${customerPhone}`);

    } catch (error) {
      console.error("❌ خطأ أثناء المعالجة:", error);
      return res.status(500).send("Internal Server Error");
    }
  }

  // 6️⃣ طريقة غير مدعومة
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).send("❌ Method Not Allowed");
}
