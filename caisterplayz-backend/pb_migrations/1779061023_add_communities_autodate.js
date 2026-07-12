/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId("cplayz_communities");
    
    // Add created field
    col.fields.add(new AutodateField({
      name: "created",
      onCreate: true,
      onUpdate: false,
    }));
    
    // Add updated field
    col.fields.add(new AutodateField({
      name: "updated",
      onCreate: true,
      onUpdate: true,
    }));
    
    return app.save(col);
  } catch (e) {
    console.log("Error adding autodate fields to cplayz_communities:", e);
    throw e;
  }
}, (app) => {
  try {
    const col = app.findCollectionByNameOrId("cplayz_communities");
    col.fields.removeField("created");
    col.fields.removeField("updated");
    return app.save(col);
  } catch (e) {
    console.log("Rollback failed:", e);
  }
});
