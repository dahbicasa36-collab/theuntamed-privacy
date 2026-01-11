export default async function handler(req, res) {
  // 1. التحقق من Webhook
  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (token === 'verify123') {
      return res.status(200).send(challenge);
    }
    return res.status(403).end();
  }

  // 2. معالجة الرسالة بناءً على النموذج (JSON) الذي أرسلته
  if (req.method === 'POST') {
    res.status(200).send('EVENT_RECEIVED');

    // استخراج الرقم من المسار الصحيح في النموذج: value.messages[0].from
    const messageData = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = messageData?.messages?.[0];

    if (message && message.from) {
      const customerPhone = message.from;
      const phoneId = "989354214252486"; // رقم ID الخاص بك من ميتا
      const token = process.env.WHATSAPP_TOKEN;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // أ: إرسال رابط المجموعة (نص عادي)
        await fetch(`https://graph.facebook.com/v24.0/${phoneId}/messages`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            "messaging_product": "whatsapp",
            "to": customerPhone,
            "type": "text",
            "text": { "body": "أهلاً بك! هذا هو رابط المجموعة: https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH" }
          })
        });

        // ب: إرسال الأوديو (ملف صوتي)
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

        console.log(`✅ تم الإرسال بنجاح إلى الرقم: ${customerPhone}`);
      } catch (err) {
        console.error("❌ فشل الإرسال:", err.message);
      }
    }
    return;
  }
}
