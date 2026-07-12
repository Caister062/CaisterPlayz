/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const blocksCol = new Collection({
      id: "cplayz_blocks000",
      name: "cplayz_blocks",
      type: "base",
      system: false,
      fields: [
        {
          id: "text1110002221",
          name: "id",
          type: "text",
          primaryKey: true,
          required: true,
          autogeneratePattern: "[a-z0-9]{15}",
          pattern: "^[a-z0-9]+$"
        },
        {
          id: "text1110002222",
          name: "blockerId",
          type: "text",
          required: true
        },
        {
          id: "text1110002223",
          name: "blockedId",
          type: "text",
          required: true
        }
      ],
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "@request.auth.id != '' && @request.auth.id = blockerId",
      deleteRule: "@request.auth.id != '' && @request.auth.id = blockerId"
    });
    app.save(blocksCol);
  } catch (e) {}

  try {
    const bkmrkCol = new Collection({
      id: "cplayz_bookmarks00",
      name: "cplayz_bookmarks",
      type: "base",
      system: false,
      fields: [
        {
          id: "text1110003331",
          name: "id",
          type: "text",
          primaryKey: true,
          required: true,
          autogeneratePattern: "[a-z0-9]{15}",
          pattern: "^[a-z0-9]+$"
        },
        {
          id: "text1110003332",
          name: "userId",
          type: "text",
          required: true
        },
        {
          id: "text1110003333",
          name: "postId",
          type: "text",
          required: true
        }
      ],
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "@request.auth.id != '' && @request.auth.id = userId",
      deleteRule: "@request.auth.id != '' && @request.auth.id = userId"
    });
    app.save(bkmrkCol);
  } catch(e) {}

  try {
    const repCol = new Collection({
      id: "cplayz_reports000",
      name: "cplayz_reports",
      type: "base",
      system: false,
      fields: [
        {
          id: "text1110004441",
          name: "id",
          type: "text",
          primaryKey: true,
          required: true,
          autogeneratePattern: "[a-z0-9]{15}",
          pattern: "^[a-z0-9]+$"
        },
        {
          id: "text1110004442",
          name: "reporterId",
          type: "text",
          required: true
        },
        {
          id: "text1110004443",
          name: "postId",
          type: "text",
          required: true
        },
        {
          id: "text1110004444",
          name: "reason",
          type: "text",
          required: true
        }
      ],
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: null,
      deleteRule: null
    });
    app.save(repCol);
  } catch(e) {}

  try {
    const postsCollection = app.findCollectionByNameOrId("cplayz_posts");
    postsCollection.fields.add(new TextField({
      name: "videoUrl",
      required: false,
    }));
    app.save(postsCollection);
  } catch(e) {}

  try {
    const usersCollection = app.findCollectionByNameOrId("users");
    usersCollection.fields.add(new BoolField({
      name: "isOnline",
      required: false,
    }));
    usersCollection.fields.add(new TextField({
      name: "lastActive",
      required: false,
    }));
    app.save(usersCollection);
  } catch(e) {}
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("cplayz_blocks")); } catch(e) {}
  try { app.delete(app.findCollectionByNameOrId("cplayz_bookmarks")); } catch(e) {}
  try { app.delete(app.findCollectionByNameOrId("cplayz_reports")); } catch(e) {}

  try {
    const postsCollection = app.findCollectionByNameOrId("cplayz_posts");
    postsCollection.fields.removeField("videoUrl");
    app.save(postsCollection);
  } catch(e) {}

  try {
    const usersCollection = app.findCollectionByNameOrId("users");
    usersCollection.fields.removeField("isOnline");
    usersCollection.fields.removeField("lastActive");
    app.save(usersCollection);
  } catch(e) {}
})
