async function pollLogs() {
    let lastLength = 0;
    while (true) {
        try {
            const res = await fetch("https://caisterplayz-caisterplayz-backend.hf.space/api/logs");
            const data = await res.json();
            if (Array.isArray(data) && data.length > lastLength) {
                for (let i = lastLength; i < data.length; i++) {
                    console.log(data[i]);
                }
                lastLength = data.length;
            }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 2000));
    }
}
pollLogs();
