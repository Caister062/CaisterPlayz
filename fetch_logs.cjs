const https = require('https');

https.get('https://huggingface.co/api/spaces/CaisterPlayz/caisterplayz-backend/logs', (res) => {
    let count = 0;
    res.on('data', (chunk) => {
        const text = chunk.toString();
        if (text.trim()) {
            console.log(text.trim());
            count++;
        }
        if (count > 20) {
            process.exit(0);
        }
    });
}).on('error', (err) => {
    console.error(err);
});
