import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(req.url)
  const year = parseInt(url.searchParams.get('year') ?? '')
  const month = parseInt(url.searchParams.get('month') ?? '')

  const { data } = await supabaseAdmin
    .from('settlements')
    .select('settled, picked_up, picked_up_quantity')
    .eq('contractor_id', id)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle()

  return NextResponse.json({
    settled: data?.settled ?? false,
    picked_up: data?.picked_up ?? false,
    picked_up_quantity: data?.picked_up_quantity ?? 0,
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { year, month, field, value } = await req.json()

  const updateData: Record<string, boolean | string | number> = { [field]: value }
  if (field === 'settled') updateData.settled_at = value ? new Date().toISOString() : null as unknown as string
  if (field === 'picked_up') updateData.picked_up_at = value ? new Date().toISOString() : null as unknown as string

  await supabaseAdmin
    .from('settlements')
    .upsert(
      { contractor_id: id, year, month, ...updateData },
      { onConflict: 'contractor_id,year,month' }
    )

  return NextResponse.json({ ok: true })
}
