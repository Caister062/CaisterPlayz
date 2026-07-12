/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/test-discord", (c) => {
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1520862944530006047/38StQo5E6_rXkCs4hCfJFRL4aze9FdhUf--Bind6JJnwdM6DrtXEtT6zeqHRv4tpzO6e";

    try {
        const payload = JSON.stringify({
            content: "[HF BACKEND TEST] Testing $http.send outbound connection!",
            username: "CaisterPlayz System",
            avatar_url: "https://caister062.github.io/CaisterPlayz/assets/logo-Cp.png"
        });

        const DISCORD_WEBHOOK_URL = "https://corsproxy.io/?" + encodeURIComponent("https://discord.com/api/webhooks/1520862944530006047/38StQo5E6_rXkCs4hCfJFRL4aze9FdhUf--Bind6JJnwdM6DrtXEtT6zeqHRv4tpzO6e");

        const res = $http.send({
            url: DISCORD_WEBHOOK_URL,
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/json" },
            timeout: 10
        });
        
        return c.json(200, {
            success: true,
            status: res.statusCode,
            raw: res.raw
        });
    } catch (err) {
        return c.json(500, {
            success: false,
            error: err.toString(),
            message: "This means HuggingFace is blocking the connection or there is a Goja error!"
        });
    }
});
