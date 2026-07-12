const url = "https://discord.com/api/webhooks/1520862944530006047/38StQo5E6_rXkCs4hCfJFRL4aze9FdhUf--Bind6JJnwdM6DrtXEtT6zeqHRv4tpzO6e";
fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        content: "✅ **CaisterPlayz Backend is now successfully linked to this Discord Channel!**\nGet ready for unlimited instant notifications.",
        username: "CaisterPlayz System",
        avatar_url: "https://caister062.github.io/CaisterPlayz/assets/logo-Cp.png"
    })
}).then(r => console.log(r.status));
