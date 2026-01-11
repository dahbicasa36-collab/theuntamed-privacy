export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send(req.query['hub.challenge']);
  }

  if (req.method === 'POST') {
    res.status(200).send('EVENT_RECEIVED');
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message && message.from) {
      const customerPhone = message.from;
      const phoneId = "989354214252486"; 
      
      // إرسال رسالة نصية بسيطة (رابط المجموعة)
      await fetch(`https://graph.facebook.com/v24.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "messaging_product": "whatsapp",
          "to": customerPhone,
          "type": "text",
          "text": { "body": "أهلاً بك! هذا هو رابط المجموعة: https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH" }
        })
      });

      // إرسال الأوديو
      await fetch(`https://graph.facebook.com/v24.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "messaging_product": "whatsapp",
          "to": customerPhone,
          "type": "audio",
          "audio": { "link": "https://theuntamed-privacy.vercel.app/audio01.mp3" }
        })
      });
    }
    return;
  }
}
