import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function GET() {
  try {
    const schedules = await getCollection('schedules')
    const items = await schedules.find().sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Schedules list error:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const schedules = await getCollection('schedules')

    const schedule = {
      type: body.type,
      cronExpression: body.cronExpression,
      config: body.config || {},
      enabled: body.enabled ?? true,
      lastRunAt: null,
      nextRunAt: null,
      runCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await schedules.insertOne(schedule)
    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...schedule },
    })
  } catch (error) {
    console.error('Create schedule error:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
