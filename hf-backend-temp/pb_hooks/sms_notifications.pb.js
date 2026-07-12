/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
    try {
        const notif = e.record;
        if (!notif) return;

        const type = notif.get("type");
        if (!type) return;

        // 👤 Get sender safely
        let senderName = "Someone";
        try {
            const senderId = String(notif.get("senderId") || "");
            if (senderId) {
                const sender = $app.findRecordById("users", senderId);
                senderName = String(sender.get("displayName") || "Someone");
            }
        } catch (err) { 
            console.log("Error finding sender:", err);
        }

        // 🧠 Build message
        let msg = null;
        switch (type) {
            case "boost": msg = senderName + " boosted your signal!"; break;
            case "echo": msg = senderName + " dropped an echo on your signal!"; break;
            case "relay": msg = senderName + " relayed your signal!"; break;
            case "connect": msg = senderName + " connected with your core!"; break;
            default: return;
        }

        // 📱 Send SMS via Vonage
        const ADMIN_PHONE = "16134625342";
        const API_KEY = "aa6ddb3c";
        const API_SECRET = "(tK(5fT)@Yp";

        const res = $http.send({
            url: "https://rest.nexmo.com/sms/json",
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "api_key=" + API_KEY
                + "&api_secret=" + encodeURIComponent(API_SECRET)
                + "&to=" + ADMIN_PHONE
                + "&from=14503640776"
                + "&text=" + encodeURIComponent("CaisterPlayz: " + msg)
        });

        console.log("SMS response:", res.raw);

    } catch (err) {
        console.log("SMS Hook Error:", err);
    }
}, "cplayz_notifications");

// ─── New User Joined → SMS to Admin ───
onRecordAfterCreateSuccess((e) => {
    try {
        const newUser = e.record;
        if (!newUser) return;

        const displayName = newUser.get("displayName") || "Unknown";
        const msg = "🎉 New user joined CaisterPlayz: " + displayName;

        const ADMIN_PHONE = "16134625342";
        const API_KEY = "aa6ddb3c";
        const API_SECRET = "(tK(5fT)@Yp";

        const res = $http.send({
            url: "https://rest.nexmo.com/sms/json",
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "api_key=" + API_KEY
                + "&api_secret=" + encodeURIComponent(API_SECRET)
                + "&to=" + ADMIN_PHONE
                + "&from=14503640776"
                + "&text=" + encodeURIComponent(msg)
        });

        console.log("New user SMS response:", res.raw);

    } catch (err) {
        console.log("New User SMS Hook Error:", err);
    }
}, "users");