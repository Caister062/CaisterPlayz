migrate((app) => {
  // 1. Create cplayz_squads collection
  const squads = new Collection({
    id: "pbc_cplayzsquads1",
    name: "cplayz_squads",
    type: "base",
    system: false,
    listRule: "@request.headers.x_user_id != ''",
    viewRule: "@request.headers.x_user_id != ''",
    createRule: "@request.headers.x_user_id != ''",
    updateRule: "@request.headers.x_user_id != ''",
    deleteRule: "@request.headers.x_user_id = createdBy"
  });

  squads.fields.add(new TextField({
    name: "name",
    required: true
  }));
  squads.fields.add(new TextField({
    name: "avatarUrl",
    required: false
  }));
  squads.fields.add(new TextField({
    name: "createdBy",
    required: true
  }));
  squads.fields.add(new JSONField({
    name: "members",
    required: false
  }));

  app.save(squads);

  // 2. Modify cplayz_messages collection
  const messages = app.findCollectionByNameOrId("cplayz_messages");
  
  messages.fields.add(new TextField({ 
    name: "squadId", 
    required: false
  }));

  // Update messages rules to allow squad reads/writes
  messages.listRule = "@request.headers.x_user_id = senderId || @request.headers.x_user_id = recipientId || squadId != ''";
  messages.viewRule = "@request.headers.x_user_id = senderId || @request.headers.x_user_id = recipientId || squadId != ''";
  messages.createRule = "@request.headers.x_user_id = senderId";
  messages.updateRule = "@request.headers.x_user_id = senderId || @request.headers.x_user_id = recipientId";

  app.save(messages);

}, (app) => {
  // Revert changes
  const squads = app.findCollectionByNameOrId("cplayz_squads");
  if (squads) {
    app.delete(squads);
  }

  const messages = app.findCollectionByNameOrId("cplayz_messages");
  messages.fields.removeByName("squadId");
  messages.listRule = "@request.headers.x_user_id = senderId || @request.headers.x_user_id = recipientId";
  messages.viewRule = "@request.headers.x_user_id = senderId || @request.headers.x_user_id = recipientId";
  app.save(messages);
});
