migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  
  // Update view and list rules to allow any authenticated user to see everyone
  users.listRule = "@request.auth.id != ''";
  users.viewRule = "@request.auth.id != ''";
  
  // Add typingTo field
  users.fields.add(new Field({ 
    "name": "typingTo", 
    "type": "text" 
  }));
  
  app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  
  users.listRule = "id = @request.auth.id";
  users.viewRule = null;
  
  users.fields.removeByName("typingTo");
  
  app.save(users);
});
