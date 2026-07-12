/// <reference path="../pb_data/types.d.ts" />

/**
 * Auto-creates cplayz_blocks and cplayz_reports collections
 * if they don't already exist. Runs on every PocketBase startup.
 */
onBootstrap((e) => {
    e.next();

    // ── cplayz_blocks ──
    try {
        $app.findCollectionByNameOrId("cplayz_blocks");
        // Collection already exists — nothing to do
    } catch (_) {
        try {
            const blocks = new Collection({
                name: "cplayz_blocks",
                type: "base",
                fields: [
                    {
                        name: "blockerId",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "blockedId",
                        type: "text",
                        required: true,
                    },
                ],
                indexes: [
                    "CREATE UNIQUE INDEX `idx_blocks_unique` ON `cplayz_blocks` (`blockerId`, `blockedId`)"
                ],
                listRule: "",
                viewRule: "",
                createRule: "",
                updateRule: null,
                deleteRule: "",
            });
            $app.save(blocks);
            console.log("[SETUP] Created cplayz_blocks collection");
        } catch (err) {
            console.log("[SETUP] Failed to create cplayz_blocks:", String(err));
        }
    }

    // ── cplayz_reports ──
    try {
        $app.findCollectionByNameOrId("cplayz_reports");
        // Collection already exists — nothing to do
    } catch (_) {
        try {
            const reports = new Collection({
                name: "cplayz_reports",
                type: "base",
                fields: [
                    {
                        name: "reporterId",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "reportedUserId",
                        type: "text",
                        required: false,
                    },
                    {
                        name: "postId",
                        type: "text",
                        required: false,
                    },
                    {
                        name: "reason",
                        type: "text",
                        required: true,
                    },
                    {
                        name: "details",
                        type: "text",
                        required: false,
                    },
                    {
                        name: "type",
                        type: "text",
                        required: false,
                    },
                    {
                        name: "status",
                        type: "text",
                        required: false,
                    },
                ],
                listRule: null,
                viewRule: null,
                createRule: "",
                updateRule: null,
                deleteRule: null,
            });
            $app.save(reports);
            console.log("[SETUP] Created cplayz_reports collection");
        } catch (err) {
            console.log("[SETUP] Failed to create cplayz_reports:", String(err));
        }
    }
});
