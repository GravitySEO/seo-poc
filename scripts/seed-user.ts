import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.')
  process.exit(1)
}

async function seedUser() {
  const client = new MongoClient(MONGODB_URI!)

  try {
    await client.connect()
    const db = client.db('gravity-seo')
    const users = db.collection('users')

    const existing = await users.findOne({ username: 'admin' })
    if (existing) {
      console.log('Admin user already exists. Updating password...')
      const passwordHash = await bcrypt.hash('admin123', 12)
      await users.updateOne({ username: 'admin' }, { $set: { passwordHash } })
      console.log('Password updated successfully.')
    } else {
      const passwordHash = await bcrypt.hash('admin123', 12)
      await users.insertOne({
        username: 'admin',
        passwordHash,
        createdAt: new Date(),
      })
      console.log('Admin user created successfully.')
    }

    // Create indexes
    await db.collection('posts').createIndex({ slug: 1 }, { unique: true })
    await db.collection('posts').createIndex({ status: 1, scheduledAt: 1 })
    await db.collection('posts').createIndex({ createdAt: -1 })
    await db.collection('keywords').createIndex({ keyword: 1 }, { unique: true })
    await db.collection('keywords').createIndex({ category: 1, status: 1 })
    await db.collection('backlinks').createIndex({ postId: 1 })
    await db.collection('backlinks').createIndex({ status: 1 })
    await db.collection('platformConfigs').createIndex({ platform: 1 }, { unique: true })
    await db.collection('activityLog').createIndex({ timestamp: -1 })

    console.log('Database indexes created successfully.')

    // Seed default platform configs
    const platformConfigs = db.collection('platformConfigs')
    const platforms = [
      // Blog platforms
      { platform: 'devto', displayName: 'Dev.to', type: 'blog' },
      { platform: 'medium', displayName: 'Medium', type: 'blog' },
      { platform: 'blogger', displayName: 'Blogger', type: 'blog' },
      { platform: 'wordpress', displayName: 'WordPress.com', type: 'blog' },
      { platform: 'hashnode', displayName: 'Hashnode', type: 'blog' },
      // Social media platforms
      { platform: 'twitter', displayName: 'Twitter / X', type: 'social' },
      { platform: 'facebook', displayName: 'Facebook', type: 'social' },
      { platform: 'instagram', displayName: 'Instagram', type: 'social' },
      { platform: 'linkedin', displayName: 'LinkedIn', type: 'social' },
    ]

    for (const p of platforms) {
      await platformConfigs.updateOne(
        { platform: p.platform },
        {
          $setOnInsert: {
            platform: p.platform,
            displayName: p.displayName,
            type: p.type,
            enabled: false,
            credentials: {},
            settings: { defaultTags: [], publishAs: 'public', addCanonicalUrl: true },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )
    }

    console.log('Platform configs seeded successfully.')
    console.log('\nLogin credentials:')
    console.log('  Username: admin')
    console.log('  Password: admin123')
  } catch (error) {
    console.error('Seed error:', error)
  } finally {
    await client.close()
  }
}

seedUser()
