import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { product_id, quantity, type } = await req.json()
  // type: 'half_buyout' | 'procurement'

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('stock, name, price, contractor_id')
    .eq('id', product_id)
    .single()

  if (!product) return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })
  if (product.stock < quantity) return NextResponse.json({ error: '在庫が足りません' }, { status: 400 })

  const unit_price = type === 'half_buyout' ? Math.floor(product.price / 2) : product.price
  const newStock = product.stock - quantity
  const total = unit_price * quantity

  await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', product_id)
  await supabaseAdmin.from('purchases').insert({ product_id, quantity, unit_price, type })

  return NextResponse.json({ stock: newStock, total })
}
