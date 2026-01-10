export default async function handler(req, res) {
  const { method, query, body } = req;

  // 1. الجزء المسؤول عن التحقق (لإصلاح Verification Failed)
  if (method === 'GET') {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    // تأكد أن verify123 هو نفسه الموجود في لوحة تحكم Meta
    if (mode === 'subscribe' && token === 'verify123') {
      console.log("✅ Webhook Verified Successfully!");
      return res.status(200).send(challenge);
    }
    console.error("❌ Verification Failed: Token Mismatch");
    return res.status(403).end();
  }

  // 2. الجزء المسؤول عن الرد التلقائي على المتصل
  if (method === 'POST') {
    // إرسال استجابة سريعة لـ Meta بأننا استلمنا الطلب
    res.status(200).send('EVENT_RECEIVED');

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // إذا كانت هناك رسالة واردة (وليس مجرد تحديث حالة)
    if (message && message.from) {
      const customerPhone = message.from;
      const phoneId = "989354214252486"; 

      console.log(`📩 New message from: ${customerPhone}`);

      const headers = {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      };

      try {
        // أ: إرسال القالب (رابط المجموعة)
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
        console.log("✅ Template sent!");

      } catch (err) {
        console.error("❌ Error sending message:", err);
      }
    }
    return;
  }
}
