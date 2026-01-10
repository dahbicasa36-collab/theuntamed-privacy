export default async function handler(req, res) {

  // التحقق من Webhook
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === 'verify123') {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  // استقبال الرسائل
  if (req.method === 'POST') {
    res.status(200).send('EVENT_RECEIVED');

    const body = req.body;
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // خاص تكون رسالة واردة من رقم آخر (ماشي رقم البزنس)
    if (!message || !message.from) return;

    const phone_id = "989354214252486";
    const token = process.env.WHATSAPP_TOKEN;
    const to = message.from;

    try {
      // 1️⃣ إرسال القالب
      await fetch(`https://graph.facebook.com/v24.0/${phone_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "messaging_product": "whatsapp",
          "to": to,
          "type": "template",
          "template": {
            "name": "come_with_links",
            "language": { "code": "ar" },
            "components": [
              {
                "type": "body",
                "parameters": [
                  { "type": "text", "text": "https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH" },
                  { "type": "text", "text": "-" }
                ]
              }
            ]
          }
        })
      });

      // 2️⃣ إرسال الأوديو
      await fetch(`https://graph.facebook.com/v24.0/${phone_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "messaging_product": "whatsapp",
          "to": to,
          "type": "audio",
          "audio": {
            "link": "https://theuntamed-privacy.vercel.app/audio01.mp3"
          }
        })
      });

      console.log("✅ Template + Audio sent to:", to);

    } catch (err) {
      console.error("❌ Error sending message:", err);
    }
  }
}
