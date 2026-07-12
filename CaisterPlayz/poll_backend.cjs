async function test() {
    let updated = false;
    while (!updated) {
        try {
            const res = await fetch('https://caisterplayz-caisterplayz-backend.hf.space/api/test-email');
            const text = await res.text();
            console.log(new Date().toISOString(), res.status, text);
            
            if (!text.includes('<!DOCTYPE html>')) {
                console.log("Test endpoint reached! Here is the actual SMTP error:");
                console.log(text);
                updated = true;
            } else {
                await new Promise(r => setTimeout(r, 5000));
            }
        } catch(e) {
            console.log(e);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}
test();
