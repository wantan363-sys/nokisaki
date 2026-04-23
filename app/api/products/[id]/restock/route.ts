import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { quantity } = await req.json()

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('stock, name, contractors(name, line_group_id)')
    .eq('id', id)
    .single()

  if (!product) return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })

  const newStock = product.stock + quantity

  await supabaseAdmin.from('products').update({ stock: newStock }).eq('id', id)
  await supabaseAdmin.from('stock_additions').insert({ product_id: id, quantity })

  const contractor = product.contractors as { name: string; line_group_id: string | null }
  if (contractor?.line_group_id) {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        to: contractor.line_group_id,
        messages: [{ type: 'text', text: `📦 在庫を追加しました！！\n「${product.name}」に${quantity}個追加！\n現在の在庫：${newStock}個 🙌` }],
      }),
    })
  }

  return NextResponse.json({ stock: newStock })
}
