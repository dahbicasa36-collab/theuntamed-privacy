export default async function handler(req, res) {
  // ===== 1️⃣ التحقق من Meta (Webhook Verification) =====
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // نفس التوكن اللي حاط فـ Meta
    const VERIFY_TOKEN = "verify123";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook Verified by Meta");
      return res.status(200).send(challenge);
    } else {
      console.log("❌ Verification Failed");
      return res.status(403).send("Forbidden");
    }
  }

  // ===== 2️⃣ استقبال رسائل واتساب والرد عليها =====
  if (req.method === "POST") {
    try {
      console.log("📩 Incoming Webhook Event:");
      console.log(JSON.stringify(req.body, null, 2));

      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const from = messages[0].from; // رقم المرسل

        console.log("📞 Message from:", from);

        // ===== رسالة الرد =====
        const replyText = `
🌺 مرحباً بكم معنا 🌺

سوف أترك لكم رابط مجموعة واتساب الخاصة التي تتوفر على جميع المعلومات 👇👇👇

🔒 المرجو الدخول إلى المجموعة، فهي خاصة وآمنة ولا يظهر فيها رقمك الشخصي.
داخل المجموعة سيتم وضع رابط محاضرة شرح العمل بالتفصيل 👇👇

👉 رابط المجموعة:
https://chat.whatsapp.com/FvfkX4uo7UbKVxoFP9KILH

🎧 الصوت التوضيحي لشرح الفكرة:
https://theuntamed-privacy.vercel.app/audio01.mp3

— فريق The Untamed
        `;

        // ===== إرسال الرد عبر WhatsApp Cloud API =====
        const PHONE_NUMBER_ID = "989354214252486"; // Phone Number ID ديالك
        const ACCESS_TOKEN = "ضع_التوكن_النهائي_هنا"; // Permanent Access Token

        const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: {
              body: replyText,
            },
          }),
        });

        const data = await response.json();
        console.log("✅ Message sent:", data);
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("❌ Error handling webhook:", error);
      return res.status(500).send("ERROR");
    }
  }

  // ===== 3️⃣ أي طلب آخر =====
  return res.status(200).send("Webhook is working ✅");
}
