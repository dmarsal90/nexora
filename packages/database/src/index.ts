import mongoose from 'mongoose'

export * from './models.js'

export async function connectDatabase(uri: string) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 5_000,
  })
  return mongoose.connection
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}

export function databaseReady() {
  return mongoose.connection.readyState === 1
}
