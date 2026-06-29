/// <reference path="../pb_data/types.d.ts" />

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1520862944530006047/38StQo5E6_rXkCs4hCfJFRL4aze9FdhUf--Bind6JJnwdM6DrtXEtT6zeqHRv4tpzO6e";

function sendToDiscord(content) {
    try {
        const payload = JSON.stringify({
            content: content,
            username: "CaisterPlayz System",
            avatar_url: "https://caister062.github.io/CaisterPlayz/assets/logo-Cp.png"
        });

        const res = $http.send({
            url: DISCORD_WEBHOOK_URL,
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/json" }
        });
        console.log("Discord status:", res.statusCode);
    } catch (err) {
        console.log("Discord err:", err);
    }
}

function handleNotification(e) {
    try {
        const notif = e.record;
        if (!notif) return;

        const type = notif.get("type");
        const recipientId = String(notif.get("recipientId") || "");
        const senderId = String(notif.get("senderId") || "");
        
        let recipientName = "Someone";
        try {
            if (recipientId) {
                const recipient = $app.findRecordById("users", recipientId);
                recipientName = String(recipient.get("displayName") || "Someone");
            }
        } catch(err) {}

        let senderName = "Someone";
        try {
            if (senderId) {
                const sender = $app.findRecordById("users", senderId);
                senderName = String(sender.get("displayName") || "Someone");
            }
        } catch (err) {}

        let msg = null;
        switch (type) {
            case "boost": msg = "[HYPE] **" + senderName + "** hyped **" + recipientName + "'s** drop!"; break;
            case "echo": msg = "[ECHO] **" + senderName + "** dropped an echo on **" + recipientName + "'s** signal!"; break;
            case "relay": msg = "[SHARE] **" + senderName + "** relayed **" + recipientName + "'s** signal!"; break;
            case "anchor": msg = "[PIN] **" + senderName + "** pinned **" + recipientName + "'s** drop!"; break;
            case "connect": msg = "[FOLLOW] **" + senderName + "** connected with **" + recipientName + "'s** core!"; break;
            default: return;
        }

        sendToDiscord(msg);

    } catch (err) {
        console.log("Error handling notif:", err);
    }
}

// Bind hook for v0.26.6
try {
    if (typeof onModelAfterCreateSuccess !== 'undefined') {
        onModelAfterCreateSuccess((e) => {
            handleNotification(e);
        }, "cplayz_notifications");
    } else if (typeof onRecordCreateRequest !== 'undefined') {
        onRecordCreateRequest((e) => {
            e.next();
            handleNotification(e);
        }, "cplayz_notifications");
    }
} catch (e) {
    console.log("Failed to bind notif hook:", e);
}

function handleNewUser(e) {
    try {
        const newUser = e.record;
        if (!newUser) return;

        const displayName = newUser.get("displayName") || "Unknown";
        const email = newUser.get("email") || "Unknown Email";
        
        const msg = "[NEW USER] **New user joined CaisterPlayz!**\nName: " + displayName + "\nEmail: " + email;
        sendToDiscord(msg);
    } catch (err) {
        console.log("Error handling new user:", err);
    }
}

try {
    if (typeof onModelAfterCreateSuccess !== 'undefined') {
        onModelAfterCreateSuccess(handleNewUser, "users");
    } else if (typeof onRecordCreateRequest !== 'undefined') {
        onRecordCreateRequest((e) => {
            e.next();
            handleNewUser(e);
        }, "users");
    }
} catch (e) {
    console.log("Failed to bind user hook:", e);
}
