/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const commentsCollection = app.findCollectionByNameOrId("cplayz_comments");
    commentsCollection.fields.add(new TextField({
      name: "imageUrl",
      required: false,
    }));
    app.save(commentsCollection);
  } catch(e) {}
}, (app) => {
  try {
    const commentsCollection = app.findCollectionByNameOrId("cplayz_comments");
    commentsCollection.fields.removeField("imageUrl");
    app.save(commentsCollection);
  } catch(e) {}
})
