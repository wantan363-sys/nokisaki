import { supabaseAdmin } from '@/lib/supabase'
import { sendLineMessage } from '@/lib/line'
import { NextResponse } from 'next/server'

export async function GET() {
  return handler()
}

export async function POST() {
  return handler()
}

async function handler() {
  // JSTの今日の範囲（UTC+9）
  const now = new Date()
  const jstOffset = 9 * 60 * 60 * 1000
  const jstNow = new Date(now.getTime() + jstOffset)
  const todayStart = new Date(Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate()) - jstOffset)
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const { data: contractors } = await supabaseAdmin
    .from('contractors')
    .select('id, name, line_group_id')

  if (!contractors) return NextResponse.json({ error: 'データなし' }, { status: 500 })

  for (const contractor of contractors) {
    if (!contractor.line_group_id) continue

    let lines = ''
    let total = 0

    // 販売
    const { data: sales } = await supabaseAdmin
      .from('sales').select('quantity, unit_price, product_name, products(name, price)')
      .eq('contractor_id', contractor.id)
      .gte('sold_at', todayStart.toISOString())
      .lt('sold_at', todayEnd.toISOString())

    for (const s of sales ?? []) {
      const productName = (s.products as { name: string; price: number } | null)?.name ?? s.product_name ?? '（削除済み商品）'
      const productPrice = (s.products as { name: string; price: number } | null)?.price
      const price = s.unit_price
      const subtotal = s.quantity * price
      total += subtotal
      const priceNote = productPrice && price !== productPrice ? `※値引 ${price.toLocaleString()}円` : `${price.toLocaleString()}円`
      lines += `・[販売] ${productName}：${s.quantity}個 × ${priceNote} = ${subtotal.toLocaleString()}円\n`
    }

    // 買取・仕入れ
    const { data: purchases } = await supabaseAdmin
      .from('purchases').select('quantity, unit_price, type, product_name, products(name)')
      .eq('contractor_id', contractor.id)
      .gte('purchased_at', todayStart.toISOString())
      .lt('purchased_at', todayEnd.toISOString())

    for (const p of purchases ?? []) {
      const productName = (p.products as { name: string } | null)?.name ?? p.product_name ?? '（削除済み商品）'
      const subtotal = p.quantity * p.unit_price
      total += subtotal
      const label = p.type === 'half_buyout' ? '半値買取' : '仕入れ'
      lines += `・[${label}] ${productName}：${p.quantity}個 × ${p.unit_price.toLocaleString()}円 = ${subtotal.toLocaleString()}円\n`
    }

    if (!lines) continue

    const month = jstNow.getUTCMonth() + 1
    const day = jstNow.getUTCDate()
    const msg = `📊 ${month}/${day} 本日の集計！！\n${contractor.name}さん、今日もありがとうございました！！\n\n${lines}\n合計：${total.toLocaleString()}円`
    await sendLineMessage(contractor.line_group_id, msg)
  }

  return NextResponse.json({ ok: true })
}
