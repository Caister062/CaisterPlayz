routerAdd("GET", "/api/debug-pb", (c) => {
    try {
        const users = $app.findAllRecords("users", 1);
        if (users.length === 0) return c.json(200, { msg: "no users" });
        const user = users[0];
        const name1 = user.get("displayName");
        const name2 = user.getString("displayName");
        
        const found = $app.findRecordById("users", user.getId());
        const foundName = found.get("displayName");

        return c.json(200, { 
            id: user.getId(),
            name1,
            name2,
            foundName
        });
    } catch (e) {
        return c.json(500, { error: e.toString(), stack: e.stack });
    }
});
