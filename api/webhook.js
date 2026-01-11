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
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (message && message.from) {
      const customerPhone = message.from;
      // الرقم الجديد من صورتك الأخيرة
      const phoneId = "947925008394263"; 
      const token = process.env.WHATSAPP_TOKEN;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // إرسال النص (الرابط)
        await fetch(`https://graph.facebook.com/v24.0/${phoneId}/messages`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            "messaging_product": "whatsapp",
            "to": customerPhone,
            "type": "text",
            "text": { "body": "أهلاً بك! رابط المجموعة: https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH" }
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
        console.log("✅ Sent successfully!");
      } catch (err) {
        console.error("❌ Error:", err.message);
      }
    }
    return;
  }
}
