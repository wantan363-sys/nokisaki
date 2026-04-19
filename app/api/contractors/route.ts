import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('contractors')
    .select('*, products(id, name, price, stock)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('contractors')
    .insert({ name: body.name, line_group_id: body.line_group_id })
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
