/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/test-discord", (c) => {
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1520862944530006047/38StQo5E6_rXkCs4hCfJFRL4aze9FdhUf--Bind6JJnwdM6DrtXEtT6zeqHRv4tpzO6e";

    try {
        const payload = JSON.stringify({
            content: "[LOCAL TEST] Checking if $http.send works in PB v0.26.6!",
            username: "CaisterPlayz System",
            avatar_url: "https://caister062.github.io/CaisterPlayz/assets/logo-Cp.png"
        });

        console.log("Sending payload:", payload);

        const res = $http.send({
            url: DISCORD_WEBHOOK_URL,
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/json" }
        });
        
        console.log("Discord status:", res.statusCode);
        return c.json(200, { status: res.statusCode, raw: res.raw });
    } catch (err) {
        console.log("Error:", err);
        return c.json(500, { error: err.toString() });
    }
});
