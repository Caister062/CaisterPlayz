/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/test-event", (c) => {
    try {
        const adminCollection = $app.findCollectionByNameOrId("_superusers");
        const admin = new Record(adminCollection);
        admin.set("email", "test" + Math.random() + "@test.com");
        admin.setPassword("1234567890");
        $app.save(admin);
        return c.json(200, { success: true });
    } catch (err) {
        return c.json(500, { error: err.toString() });
    }
});

onModelAfterCreateSuccess((e) => {
    console.log("onModelAfterCreateSuccess FIRED!");
    console.log("e.record:", typeof e.record);
    console.log("e.model:", typeof e.model);
    console.log("e.record actually:", !!e.record);
    console.log("e.model actually:", !!e.model);
}, "_superusers");
