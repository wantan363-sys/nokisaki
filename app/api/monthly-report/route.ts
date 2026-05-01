import { supabaseAdmin } from '@/lib/supabase'
import { sendLineMessage } from '@/lib/line'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const now = new Date()
  const year: number = body.year ?? now.getFullYear()
  const month: number = body.month ?? (now.getMonth() + 1)
  const start = new Date(year, month - 1, 1).toISOString()
  const end = new Date(year, month, 1).toISOString()

  const { data: contractors } = await supabaseAdmin
    .from('contractors')
    .select('id, name, line_group_id, products(id, name, price)')

  if (!contractors) return NextResponse.json({ error: 'データなし' }, { status: 500 })

  for (const contractor of contractors) {
    if (!contractor.line_group_id) continue

    const products = contractor.products as { id: string; name: string; price: number }[]
    let salesLines = ''
    let salesTotal = 0
    let buyoutLines = ''
    let buyoutTotal = 0
    let procureLines = ''
    let procureTotal = 0
    let restockLines = ''

    for (const product of products) {
      // 通常売上
      const { data: salesRecords } = await supabaseAdmin
        .from('sales')
        .select('quantity, unit_price')
        .eq('product_id', product.id)
        .gte('sold_at', start)
        .lt('sold_at', end)

      for (const s of salesRecords ?? []) {
        const price = s.unit_price ?? product.price
        const subtotal = s.quantity * price
        salesTotal += subtotal
        const priceNote = price !== product.price ? `※値引 ${price.toLocaleString()}円` : `${price.toLocaleString()}円`
        salesLines += `・${product.name}：${s.quantity}個 × ${priceNote} = ${subtotal.toLocaleString()}円\n`
      }

      // 半値買取
      const { data: buyouts } = await supabaseAdmin
        .from('purchases')
        .select('quantity, unit_price')
        .eq('product_id', product.id)
        .eq('type', 'half_buyout')
        .gte('purchased_at', start)
        .lt('purchased_at', end)

      for (const b of buyouts ?? []) {
        const subtotal = b.quantity * b.unit_price
        buyoutTotal += subtotal
        buyoutLines += `・${product.name}：${b.quantity}個 × ${b.unit_price.toLocaleString()}円 = ${subtotal.toLocaleString()}円\n`
      }

      // 仕入れ
      const { data: procures } = await supabaseAdmin
        .from('purchases')
        .select('quantity, unit_price')
        .eq('product_id', product.id)
        .eq('type', 'procurement')
        .gte('purchased_at', start)
        .lt('purchased_at', end)

      for (const pr of procures ?? []) {
        const subtotal = pr.quantity * pr.unit_price
        procureTotal += subtotal
        procureLines += `・${product.name}：${pr.quantity}個 × ${pr.unit_price.toLocaleString()}円 = ${subtotal.toLocaleString()}円\n`
      }

      // 補充
      const { data: additions } = await supabaseAdmin
        .from('stock_additions')
        .select('quantity, added_at')
        .eq('product_id', product.id)
        .gte('added_at', start)
        .lt('added_at', end)

      for (const a of additions ?? []) {
        const d = new Date(a.added_at)
        restockLines += `・${d.getMonth() + 1}/${d.getDate()} ${product.name}：${a.quantity}個\n`
      }
    }

    const grandTotal = salesTotal + buyoutTotal + procureTotal
    const reportUrl = `https://nokisaki.vercel.app/report/${year}-${String(month).padStart(2, '0')}/${contractor.id}`

    let msg = `🎊 ${month}月の月末精算レポート！！\n${contractor.name}さん、今月もお疲れ様でした！！\n\n`

    if (restockLines) msg += `【補充】\n${restockLines}\n`
    if (salesLines) msg += `【販売】\n${salesLines}\n`
    if (buyoutLines) msg += `【半値買取】\n${buyoutLines}\n`
    if (procureLines) msg += `【仕入れ】\n${procureLines}\n`
    if (!salesLines && !buyoutLines && !procureLines && !restockLines) msg += '今月の取引はありませんでした\n\n'

    msg += `💰 合計お支払い：${grandTotal.toLocaleString()}円 🙌\n\n`
    msg += `📄 売上報告書はこちら！\n${reportUrl}\n\n`
    msg += `月末にお渡しします！\n今月もありがとうございました！！`

    await sendLineMessage(contractor.line_group_id, msg)
  }

  return NextResponse.json({ ok: true })
}
