import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { error } = await supabaseAdmin
    .from('contractors')
    .update({ name: body.name })
    .eq('id', id)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
