import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function POST() {
  try {
    const backlinks = await getCollection('backlinks')
    const allBacklinks = await backlinks.find({ status: { $ne: 'removed' } }).toArray()

    let checked = 0
    let broken = 0

    for (const bl of allBacklinks) {
      try {
        const res = await fetch(bl.publishedUrl, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(10000),
        })

        const newStatus = res.ok ? 'active' : 'broken'
        if (!res.ok) broken++

        await backlinks.updateOne(
          { _id: bl._id },
          { $set: { status: newStatus, lastCheckedAt: new Date() } }
        )
        checked++
      } catch {
        await backlinks.updateOne(
          { _id: bl._id },
          { $set: { status: 'broken', lastCheckedAt: new Date() } }
        )
        broken++
        checked++
      }
    }

    // Log activity
    const activityLog = await getCollection('activityLog')
    await activityLog.insertOne({
      action: 'backlinks_checked',
      details: { total: allBacklinks.length, checked, broken },
      status: 'success',
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      data: { total: allBacklinks.length, checked, broken },
    })
  } catch (error) {
    console.error('Backlink check error:', error)
    return NextResponse.json({ error: 'Failed to check backlinks' }, { status: 500 })
  }
}
