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

  const { data: contractor } = await supabaseAdmin
    .from('contractors')
    .select('name, line_group_id')
    .eq('id', product.contractor_id)
    .single()

  if (contractor?.line_group_id) {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!
    const label = type === 'half_buyout' ? '半値買取' : '仕入れ'
    const msg = `🛒 ${label}のご連絡！！\n「${product.name}」${quantity}個を${label}させていただきます！\n単価：${unit_price.toLocaleString()}円 × ${quantity}個 = ${total.toLocaleString()}円\n残り在庫：${newStock}個\nよろしくお願いします！！`
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ to: contractor.line_group_id, messages: [{ type: 'text', text: msg }] }),
    })
  }

  return NextResponse.json({ stock: newStock, total })
}
