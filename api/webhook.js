export default async function handler(req, res) {
  const { method, query, body } = req;

  // 1. التحقق من Webhook (للعلامة الخضراء)
  if (method === 'GET') {
    if (query['hub.verify_token'] === 'verify123') {
      return res.status(200).send(query['hub.challenge']);
    }
    return res.status(403).end();
  }

  // 2. الرد التلقائي (الرابط + الأوديو)
  if (method === 'POST') {
    res.status(200).send('EVENT_RECEIVED'); // رد سريع لمنع التوقف

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message && message.from) {
      const customerPhone = message.from;
      const phoneId = "989354214252486"; 
      
      const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      };

      try {
        // أ: إرسال القالب (رابط المجموعة)
        const resTemplate = await fetch(`https://graph.facebook.com/v24.0/${phoneId}/messages`, {
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

        if (!resTemplate.ok) throw new Error('Template failed');

        // ب: إرسال الأوديو (بشكل منفصل لضمان الوصول)
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

        console.log(`✅ Success for ${customerPhone}`);

      } catch (err) {
        console.error("❌ Fetch Error:", err.message);
      }
    }
    return;
  }
}
