await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "messaging_product": "whatsapp",
    "to": customerPhone,
    "type": "template",
    "template": {
      "name": "welcome_with_links",
      "language": { "code": "ar" }
    }
  })
});
