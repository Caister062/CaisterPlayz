migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  users.fields.add(new Field({ "name": "displayName", "type": "text" }));
  users.fields.add(new Field({ "name": "bio", "type": "text" }));
  users.fields.add(new Field({ "name": "website", "type": "text" }));
  users.fields.add(new Field({ "name": "avatarUrl", "type": "text" }));
  users.fields.add(new Field({ "name": "verified", "type": "bool" }));
  app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  users.fields.removeByName("displayName");
  users.fields.removeByName("bio");
  users.fields.removeByName("website");
  users.fields.removeByName("avatarUrl");
  users.fields.removeByName("verified");
  app.save(users);
});