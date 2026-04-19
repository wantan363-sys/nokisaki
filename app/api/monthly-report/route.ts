import { supabaseAdmin } from '@/lib/supabase'
import { sendLineMessage } from '@/lib/line'
import { NextResponse } from 'next/server'

export async function POST() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const start = new Date(year, month - 1, 1).toISOString()
  const end = new Date(year, month, 1).toISOString()

  const { data: contractors } = await supabaseAdmin
    .from('contractors')
    .select('id, name, line_group_id, products(id, name, price)')

  if (!contractors) return NextResponse.json({ error: 'データなし' }, { status: 500 })

  for (const contractor of contractors) {
    if (!contractor.line_group_id) continue

    const products = contractor.products as { id: string; name: string; price: number }[]
    let lines = ''
    let total = 0

    for (const product of products) {
      const { count } = await supabaseAdmin
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product.id)
        .gte('sold_at', start)
        .lt('sold_at', end)

      const qty = count ?? 0
      const subtotal = qty * product.price
      total += subtotal
      if (qty > 0) lines += `・${product.name}：${qty}個 × ${product.price.toLocaleString()}円 = ${subtotal.toLocaleString()}円\n`
    }

    const msg = `🎊 ${month}月の月末精算レポート！！\n${contractor.name}さん、今月もお疲れ様でした！！\n\n${lines || '今月の販売はありませんでした\n'}\n合計：${total.toLocaleString()}円 🙌\n\n月末にお渡しします！\n今月もありがとうございました！！`
    await sendLineMessage(contractor.line_group_id, msg)
  }

  return NextResponse.json({ ok: true })
}
