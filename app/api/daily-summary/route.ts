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
    .select('id, name, line_group_id, products(id, name, price)')

  if (!contractors) return NextResponse.json({ error: 'データなし' }, { status: 500 })

  for (const contractor of contractors) {
    if (!contractor.line_group_id) continue

    const products = contractor.products as { id: string; name: string; price: number }[]
    let lines = ''
    let total = 0

    for (const product of products) {
      const { data: sales } = await supabaseAdmin
        .from('sales').select('quantity, unit_price')
        .eq('product_id', product.id)
        .gte('sold_at', todayStart.toISOString())
        .lt('sold_at', todayEnd.toISOString())

      for (const s of sales ?? []) {
        const price = s.unit_price ?? product.price
        const subtotal = s.quantity * price
        total += subtotal
        const priceNote = price !== product.price ? `※値引 ${price.toLocaleString()}円` : `${price.toLocaleString()}円`
        lines += `・[販売] ${product.name}：${s.quantity}個 × ${priceNote} = ${subtotal.toLocaleString()}円\n`
      }

      const { data: purchases } = await supabaseAdmin
        .from('purchases').select('quantity, unit_price, type')
        .eq('product_id', product.id)
        .gte('purchased_at', todayStart.toISOString())
        .lt('purchased_at', todayEnd.toISOString())

      for (const p of purchases ?? []) {
        const subtotal = p.quantity * p.unit_price
        total += subtotal
        const label = p.type === 'half_buyout' ? '半値買取' : '仕入れ'
        lines += `・[${label}] ${product.name}：${p.quantity}個 × ${p.unit_price.toLocaleString()}円 = ${subtotal.toLocaleString()}円\n`
      }
    }

    if (!lines) continue

    const month = jstNow.getUTCMonth() + 1
    const day = jstNow.getUTCDate()
    const msg = `📊 ${month}/${day} 本日の集計！！\n${contractor.name}さん、今日もありがとうございました！！\n\n${lines}\n合計：${total.toLocaleString()}円`
    await sendLineMessage(contractor.line_group_id, msg)
  }

  return NextResponse.json({ ok: true })
}
