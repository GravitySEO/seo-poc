import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  try {
    const body = await request.json()
    const platformConfigs = await getCollection('platformConfigs')

    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (body.enabled !== undefined) updateData.enabled = body.enabled
    if (body.credentials) updateData.credentials = body.credentials
    if (body.settings) updateData.settings = body.settings

    const result = await platformConfigs.updateOne(
      { platform: params.platform },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Platform not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update platform error:', error)
    return NextResponse.json({ error: 'Failed to update platform' }, { status: 500 })
  }
}
