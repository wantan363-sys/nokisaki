import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { quantity } = await req.json()

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('stock, name, contractor_id')
    .eq('id', id)
    .single()

  if (!product) return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })

  const newStock = product.stock + quantity

  await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', id)
  await supabaseAdmin.from('stock_additions').insert({
    product_id: id,
    quantity,
    product_name: product.name,
    contractor_id: product.contractor_id,
  })

  return NextResponse.json({ stock: newStock })
}
