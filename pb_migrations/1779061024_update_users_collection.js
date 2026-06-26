migrate((db) => {
  const users = $app.dao().findCollectionByNameOrId("users");

  users.schema.addField(new SchemaField({
    "system": false,
    "id": "users_displayName",
    "name": "displayName",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }));

  users.schema.addField(new SchemaField({
    "system": false,
    "id": "users_bio",
    "name": "bio",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }));

  users.schema.addField(new SchemaField({
    "system": false,
    "id": "users_website",
    "name": "website",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }));

  users.schema.addField(new SchemaField({
    "system": false,
    "id": "users_avatarUrl",
    "name": "avatarUrl",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }));

  users.schema.addField(new SchemaField({
    "system": false,
    "id": "users_verified",
    "name": "verified",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }));

  return $app.dao().saveCollection(users);
}, (db) => {
  const users = $app.dao().findCollectionByNameOrId("users");
  users.schema.removeField("users_displayName");
  users.schema.removeField("users_bio");
  users.schema.removeField("users_website");
  users.schema.removeField("users_avatarUrl");
  users.schema.removeField("users_verified");
  return $app.dao().saveCollection(users);
});
