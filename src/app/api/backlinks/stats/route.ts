import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function GET() {
  try {
    const backlinks = await getCollection('backlinks')

    const [total, active, broken, byPlatform] = await Promise.all([
      backlinks.countDocuments(),
      backlinks.countDocuments({ status: 'active' }),
      backlinks.countDocuments({ status: 'broken' }),
      backlinks
        .aggregate([
          { $group: { _id: '$platform', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
    ])

    return NextResponse.json({
      success: true,
      data: { total, active, broken, byPlatform },
    })
  } catch (error) {
    console.error('Backlink stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
