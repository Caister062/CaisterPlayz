migrate((app) => {
  const collection = app.findCollectionByNameOrId("cplayz_messages");
  
  collection.createRule = "@request.headers.x_user_id = senderId";
  collection.updateRule = "@request.headers.x_user_id = senderId || @request.headers.x_user_id = recipientId";
  
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("cplayz_messages");
  
  collection.createRule = null;
  collection.updateRule = null;
  
  app.save(collection);
});
