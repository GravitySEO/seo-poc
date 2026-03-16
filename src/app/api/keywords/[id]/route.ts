import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/db/mongodb'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const keywords = await getCollection('keywords')

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (body.status) updateData.status = body.status
    if (body.keyword) updateData.keyword = body.keyword
    if (body.category) updateData.category = body.category
    if (body.difficulty) updateData.difficulty = body.difficulty

    const result = await keywords.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update keyword error:', error)
    return NextResponse.json({ error: 'Failed to update keyword' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const keywords = await getCollection('keywords')
    const result = await keywords.deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete keyword error:', error)
    return NextResponse.json({ error: 'Failed to delete keyword' }, { status: 500 })
  }
}
