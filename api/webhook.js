export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    if (searchParams.get('hub.verify_token') === 'verify123') {
      return res.status(200).send(searchParams.get('hub.challenge'));
    }
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    res.status(200).send('EVENT_RECEIVED');
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message && message.from) {
      const customerPhone = message.from;
      const phoneId = "989354214252486"; // معرف هاتفك من ميتا
      const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      };

      try {
        // 1. إرسال رابط المجموعة (كـ Template)
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

        // 2. إرسال الأوديو (كـ ملف صوتي حقيقي)
        // ملاحظة: تأكد أن ملف audio01.mp3 موجود في GitHub لديك
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

        console.log("✅ Success: Template and Audio sent!");
      } catch (err) {
        console.error("❌ Error:", err.message);
      }
    }
    return;
  }
}
