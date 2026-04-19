import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({ contractor_id: body.contractor_id, name: body.name, price: body.price, stock: body.stock })
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
