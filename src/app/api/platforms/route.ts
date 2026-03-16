import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function GET() {
  try {
    const platformConfigs = await getCollection('platformConfigs')
    const configs = await platformConfigs.find().toArray()

    // Mask sensitive credentials
    const maskedConfigs = configs.map((config) => ({
      ...config,
      credentials: Object.fromEntries(
        Object.entries(config.credentials || {}).map(([key, value]) => [
          key,
          value ? '••••••••' : '',
        ])
      ),
      hasCredentials: Object.values(config.credentials || {}).some((v) => !!v),
    }))

    return NextResponse.json({ success: true, data: maskedConfigs })
  } catch (error) {
    console.error('Platforms list error:', error)
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 })
  }
}
