/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // Apple requires working report and block actions. The frontend already calls
  // cplayz_reports and cplayz_blocks, so create those collections if missing.

  try {
    app.findCollectionByNameOrId("cplayz_blocks");
  } catch (e) {
    const blocksCol = new Collection({
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
      listRule: "blockerId = @request.headers.x_user_id",
      viewRule: "blockerId = @request.headers.x_user_id",
      createRule: "blockerId = @request.headers.x_user_id && blockedId != @request.headers.x_user_id",
      updateRule: "blockerId = @request.headers.x_user_id",
      deleteRule: "blockerId = @request.headers.x_user_id"
    });

    app.save(blocksCol);
  }

  try {
    app.findCollectionByNameOrId("cplayz_reports");
  } catch (e) {
    const reportsCol = new Collection({
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
      listRule: "reporterId = @request.headers.x_user_id",
      viewRule: "reporterId = @request.headers.x_user_id",
      createRule: "reporterId = @request.headers.x_user_id",
      updateRule: null,
      deleteRule: null
    });

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
