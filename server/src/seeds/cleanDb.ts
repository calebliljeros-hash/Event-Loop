import db from '../config/connection.js';

export default async (collectionName: string) => {
  try {
    const collections = await db.db!.listCollections({
      name: collectionName,
    }).toArray();

    if (collections.length) {
      await db.dropCollection(collectionName);
    }
  } catch (err) {
    throw err;
  }
};
