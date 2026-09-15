import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { price } = body

  if (price !== undefined && (isNaN(price) || price < 0)) {
    return NextResponse.json({ error: '価格が無効です' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (price !== undefined) updateData.price = price

  const { error } = await supabaseAdmin.from('products').update(updateData).eq('id', id)
  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
