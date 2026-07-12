/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // Apple requires working report and block actions. The frontend already calls
  // cplayz_reports and cplayz_blocks, so create or update those collections.

  // Fix cplayz_blocks collection
  let blocksCol;
  try {
    blocksCol = app.findCollectionByNameOrId("cplayz_blocks");
  } catch (e) {
    blocksCol = new Collection({
      id: "pbc_cplayzblocks",
      name: "cplayz_blocks",
      type: "base",
      system: false,
      fields: [
        {
          id: "text_block_id",
          name: "id",
          type: "text",
          primaryKey: true,
          required: true,
          autogeneratePattern: "[a-z0-9]{15}",
          pattern: "^[a-z0-9]+$"
        },
        {
          id: "text_blocker_id",
          name: "blockerId",
          type: "text",
          required: true
        },
        {
          id: "text_blocked_id",
          name: "blockedId",
          type: "text",
          required: true
        }
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_cplayz_blocks_pair ON cplayz_blocks (blockerId, blockedId)"
      ],
      listRule: "blockerId = @request.auth.id",
      viewRule: "blockerId = @request.auth.id",
      createRule: "blockerId = @request.auth.id && blockedId != @request.auth.id",
      updateRule: "blockerId = @request.auth.id",
      deleteRule: "blockerId = @request.auth.id"
    });

    app.save(blocksCol);
  }

  // Update rules if collection already exists
  if (blocksCol && blocksCol.listRule && blocksCol.listRule.includes("@request.headers.x_user_id")) {
    blocksCol.listRule = "blockerId = @request.auth.id";
    blocksCol.viewRule = "blockerId = @request.auth.id";
    blocksCol.createRule = "blockerId = @request.auth.id && blockedId != @request.auth.id";
    blocksCol.updateRule = "blockerId = @request.auth.id";
    blocksCol.deleteRule = "blockerId = @request.auth.id";
    app.save(blocksCol);
  }

  // Fix cplayz_reports collection
  let reportsCol;
  try {
    reportsCol = app.findCollectionByNameOrId("cplayz_reports");
  } catch (e) {
    reportsCol = new Collection({
      id: "pbc_cplayzreports",
      name: "cplayz_reports",
      type: "base",
      system: false,
      fields: [
        {
          id: "text_report_id",
          name: "id",
          type: "text",
          primaryKey: true,
          required: true,
          autogeneratePattern: "[a-z0-9]{15}",
          pattern: "^[a-z0-9]+$"
        },
        {
          id: "text_reporter_id",
          name: "reporterId",
          type: "text",
          required: true
        },
        {
          id: "text_report_post",
          name: "postId",
          type: "text",
          required: false
        },
        {
          id: "text_report_user",
          name: "reportedUserId",
          type: "text",
          required: false
        },
        {
          id: "text_report_reason",
          name: "reason",
          type: "text",
          required: true
        },
        {
          id: "text_report_type",
          name: "type",
          type: "text",
          required: false
        },
        {
          id: "text_report_status",
          name: "status",
          type: "text",
          required: false
        }
      ],
      indexes: [
        "CREATE INDEX idx_cplayz_reports_reporter ON cplayz_reports (reporterId)",
        "CREATE INDEX idx_cplayz_reports_post ON cplayz_reports (postId)",
        "CREATE INDEX idx_cplayz_reports_user ON cplayz_reports (reportedUserId)"
      ],
      listRule: "reporterId = @request.auth.id",
      viewRule: "reporterId = @request.auth.id",
      createRule: "reporterId = @request.auth.id",
      updateRule: null,
      deleteRule: null
    });

    app.save(reportsCol);
  }

  // Update rules if collection already exists
  if (reportsCol && reportsCol.listRule && reportsCol.listRule.includes("@request.headers.x_user_id")) {
    reportsCol.listRule = "reporterId = @request.auth.id";
    reportsCol.viewRule = "reporterId = @request.auth.id";
    reportsCol.createRule = "reporterId = @request.auth.id";
    app.save(reportsCol);
  }
}, (app) => {
  try {
    const reportsCol = app.findCollectionByNameOrId("cplayz_reports");
    app.delete(reportsCol);
  } catch (e) {}

  try {
    const blocksCol = app.findCollectionByNameOrId("cplayz_blocks");
    app.delete(blocksCol);
  } catch (e) {}
});
