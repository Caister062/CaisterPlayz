/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3642684019")

  // update collection data
  unmarshal({
    "deleteRule": ""
  }, collection)

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4166911607",
    "max": 0,
    "min": 0,
    "name": "username",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2047774360",
    "max": 0,
    "min": 0,
    "name": "photoURL",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "json2215181735",
    "maxSize": 0,
    "name": "followers",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "json1908379107",
    "maxSize": 0,
    "name": "following",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3642684019")

  // update collection data
  unmarshal({
    "deleteRule": null
  }, collection)

  // remove field
  collection.fields.removeById("text4166911607")

  // remove field
  collection.fields.removeById("text2047774360")

  // remove field
  collection.fields.removeById("json2215181735")

  // remove field
  collection.fields.removeById("json1908379107")

  return app.save(collection)
})
