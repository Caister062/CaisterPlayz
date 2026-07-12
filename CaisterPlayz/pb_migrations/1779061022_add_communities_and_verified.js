/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // 1. Add verified field to cplayz_users
  try {
    const usersCol = app.findCollectionByNameOrId("cplayz_users");
    usersCol.fields.add(new BoolField({
      name: "verified",
      required: false,
    }));
    app.save(usersCol);
  } catch (e) {
    console.log("Error adding verified field to cplayz_users:", e);
  }

  // 2. Add communityId field to cplayz_posts
  try {
    const postsCol = app.findCollectionByNameOrId("cplayz_posts");
    postsCol.fields.add(new TextField({
      name: "communityId",
      required: false,
    }));
    app.save(postsCol);
  } catch (e) {
    console.log("Error adding communityId field to cplayz_posts:", e);
  }

  // 3. Create cplayz_communities collection
  const communitiesCol = new Collection({
    id: "pbc_communities",
    name: "cplayz_communities",
    type: "base",
    system: false,
    fields: [
      {
        id: "text3208210256",
        name: "id",
        type: "text",
        primaryKey: true,
        required: true,
        autogeneratePattern: "[a-z0-9]{15}",
        pattern: "^[a-z0-9]+$"
      },
      {
        id: "text1110001111",
        name: "name",
        type: "text",
        required: true
      },
      {
        id: "text1110001112",
        name: "description",
        type: "text",
        required: false
      },
      {
        id: "text1110001113",
        name: "avatarUrl",
        type: "text",
        required: false
      },
      {
        id: "text1110001114",
        name: "createdBy",
        type: "text",
        required: true
      },
      {
        id: "json1110001115",
        name: "members",
        type: "json",
        required: false
      }
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "createdBy = @request.headers.x_user_id",
    deleteRule: "createdBy = @request.headers.x_user_id"
  });
  return app.save(communitiesCol);
}, (app) => {
  // Rollback communities collection
  try {
    const communitiesCol = app.findCollectionByNameOrId("cplayz_communities");
    app.delete(communitiesCol);
  } catch (e) {}

  // Rollback verified field from cplayz_users
  try {
    const usersCol = app.findCollectionByNameOrId("cplayz_users");
    usersCol.fields.removeField("verified");
    app.save(usersCol);
  } catch (e) {}

  // Rollback communityId field from cplayz_posts
  try {
    const postsCol = app.findCollectionByNameOrId("cplayz_posts");
    postsCol.fields.removeField("communityId");
    app.save(postsCol);
  } catch (e) {}
});
