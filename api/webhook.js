export default async function handler(req, res) {

  // التحقق من Webhook (Verification)
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    if (searchParams.get('hub.verify_token') === 'verify123') {
      return res.status(200).send(searchParams.get('hub.challenge'));
    }
    return res.status(403).end();
  }

  // استقبال الرسائل من واتساب
  if (req.method === 'POST') {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (message && message.from) {
      const customerPhone = message.from;

      const phoneId = "947925008394263"; // Phone Number ID
      const token = process.env.WHATSAPP_TOKEN;

      if (!token) {
        console.error("❌ WHATSAPP_TOKEN غير موجود في Environment Variables");
        return res.status(500).send("Token missing");
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // إرسال النص
        await fetch(`https://graph.facebook.com/v24.0/${phoneId}/messages`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            "messaging_product": "whatsapp",
            "to": customerPhone,
            "type": "text",
            "text": {
              "body": "🌺 مرحباً بكم معنا 🌺\n\nرابط المجموعة الخاصة:\n👉 https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH"
            }
          })
        });

        // إرسال الأوديو
        await fetch(`https://graph.facebook.com/v24.0/${phoneId}/messages`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            "messaging_product": "whatsapp",
            "to": customerPhone,
            "type": "audio",
            "audio": {
              "link": "https://theuntamed-privacy.vercel.app/audio01.mp3"
            }
          })
        });

        console.log("✅ Message + Audio sent successfully!");

      } catch (err) {
        console.error("❌ Error sending message:", err.message);
      }
    }

    // الرد على Meta بعد المعالجة
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).end();
}
