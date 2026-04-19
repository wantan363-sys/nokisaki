import { supabaseAdmin } from '@/lib/supabase'
import { sendLineMessage } from '@/lib/line'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { product_id } = await req.json()

  const { data: product, error: pErr } = await supabaseAdmin
    .from('products')
    .select('*, contractors(name, line_group_id)')
    .eq('id', product_id)
    .single()

  if (pErr || !product) return NextResponse.json({ error: '商品が見つかりません' }, { status: 404 })
  if (product.stock <= 0) return NextResponse.json({ error: '在庫がありません' }, { status: 400 })

  const newStock = product.stock - 1

  const { error: updateErr } = await supabaseAdmin
    .from('products')
    .update({ stock: newStock })
    .eq('id', product_id)

  if (updateErr) return NextResponse.json({ error: updateErr }, { status: 500 })

  await supabaseAdmin.from('sales').insert({ product_id, quantity: 1 })

  const contractor = product.contractors as { name: string; line_group_id: string | null }
  if (contractor.line_group_id) {
    const soldMsg = `🎉 売れました！！\n${contractor.name}さんの「${product.name}」が売れましたよ～！\n\n残り在庫：${newStock}個`
    await sendLineMessage(contractor.line_group_id, soldMsg)

    if (newStock <= 2) {
      const refillMsg = `⚠️ 補充のお願い！！\n「${product.name}」の在庫が残り${newStock}個になりました。\n補充のご連絡をお願いします！！`
      await sendLineMessage(contractor.line_group_id, refillMsg)
    }
  }

  return NextResponse.json({ stock: newStock })
}
