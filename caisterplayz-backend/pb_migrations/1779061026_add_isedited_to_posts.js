migrate((app) => {
  const posts = app.findCollectionByNameOrId("cplayz_posts");
  
  posts.fields.add(new Field({ 
    "name": "isEdited", 
    "type": "bool" 
  }));
  
  app.save(posts);
}, (app) => {
  const posts = app.findCollectionByNameOrId("cplayz_posts");
  
  posts.fields.removeByName("isEdited");
  
  app.save(posts);
});
