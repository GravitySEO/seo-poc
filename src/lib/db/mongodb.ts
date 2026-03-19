import { MongoClient, Db } from 'mongodb'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(MONGODB_URI).connect()
    }
    return global._mongoClientPromise
  }

  return new MongoClient(MONGODB_URI).connect()
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db('gravity-seo')
}

export async function getCollection(name: string) {
  const db = await getDb()
  return db.collection(name)
}

export default { getDb, getCollection }
