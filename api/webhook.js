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

  // ===== 2️⃣ استقبال رسائل واتساب (POST) =====
  if (req.method === "POST") {
    console.log("📩 Incoming Webhook Event:");
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).send("EVENT_RECEIVED");
  }

  // ===== 3️⃣ أي طلب آخر (اختبار يدوي) =====
  return res.status(200).send("Webhook is working ✅");
}
