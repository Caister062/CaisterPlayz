routerAdd("GET", "/api/test-email", (c) => {
    try {
        const message = new MailerMessage({
            from: {
                address: $app.settings().meta.senderAddress || "noreply@caisterplayz.com",
                name: $app.settings().meta.senderName || "CaisterPlayz",
            },
            to: [{address: "caismoretton@gmail.com"}],
            subject: "CaisterPlayz Backend Test",
            html: "<p>This is a test from the backend API.</p>",
        });

        $app.newMailClient().send(message);

        return c.json(200, { success: true, message: "Email sent successfully!" });
    } catch (err) {
        return c.json(500, { success: false, error: err.toString() });
    }
});
