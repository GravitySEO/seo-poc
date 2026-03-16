import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const backlinks = await getCollection('backlinks')

    const filter: Record<string, unknown> = {}
    if (platform) filter.platform = platform
    if (status) filter.status = status

    const total = await backlinks.countDocuments(filter)
    const items = await backlinks
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Backlinks list error:', error)
    return NextResponse.json({ error: 'Failed to fetch backlinks' }, { status: 500 })
  }
}
