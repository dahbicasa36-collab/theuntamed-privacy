export default async function handler(req, res) {
  // 1. معالجة طلب التحقق (GET) بطريقة حديثة تمنع تحذير DEP0169
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === 'verify123') {
      console.log("✅ Webhook Verified!");
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  // 2. معالجة الرسائل الواردة (POST)
  if (req.method === 'POST') {
    res.status(200).send('EVENT_RECEIVED');

    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message && message.from) {
      const customerPhone = message.from;
      const phoneId = "989354214252486";
      const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      };

      try {
        // إرسال الرابط
        await fetch(`https://graph.facebook.com/v24.0/${phoneId}/messages`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            "messaging_product": "whatsapp",
            "to": customerPhone,
            "type": "template",
            "template": {
              "name": "welcome_with_links",
              "language": { "code": "ar" },
              "components": [{
                "type": "body",
                "parameters": [
                  { "type": "text", "text": "https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH" },
                  { "type": "text", "text": "-" }
                ]
              }]
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
            "audio": { "link": "https://theuntamed-privacy.vercel.app/audio01.mp3" }
          })
        });

        console.log(`✅ Done: Link and Audio sent to ${customerPhone}`);
      } catch (err) {
        console.error("❌ Error:", err.message);
      }
    }
    return;
  }
}
