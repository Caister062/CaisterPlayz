const ADMIN_PHONE = "16134625342";
const API_KEY = "aa6ddb3c";
const API_SECRET = "(tK(5fT)@Yp";
const FROM = "CaisterApp";
const TEXT = "Test from CaisterPlayz debug script";

async function sendSMS() {
    console.log("Sending SMS...");
    try {
        const body = new URLSearchParams();
        body.append('api_key', API_KEY);
        body.append('api_secret', API_SECRET);
        body.append('to', ADMIN_PHONE);
        body.append('from', FROM);
        body.append('text', TEXT);

        const res = await fetch("https://rest.nexmo.com/sms/json", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: body.toString()
        });

        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

sendSMS();
