import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ month: string; contractorId: string }> }) {
  const { month, contractorId } = await params
  const [year, m] = month.split('-').map(Number)
  const start = new Date(year, m - 1, 1).toISOString()
  const end = new Date(year, m, 1).toISOString()

  const { data: contractor } = await supabaseAdmin
    .from('contractors')
    .select('name, products(id, name, price)')
    .eq('id', contractorId)
    .single()

  if (!contractor) return NextResponse.json({ error: 'not found' }, { status: 404 })

  type Row = { date: string; name: string; qty: number; price: number; label?: string }
  const rows: Row[] = []

  for (const product of contractor.products as { id: string; name: string; price: number }[]) {
    // 通常売上
    const { data: sales } = await supabaseAdmin
      .from('sales').select('quantity, sold_at')
      .eq('product_id', product.id).gte('sold_at', start).lt('sold_at', end).order('sold_at')
    for (const s of sales ?? []) {
      const d = new Date(s.sold_at)
      rows.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, name: product.name, qty: s.quantity, price: product.price })
    }

    // 半値買取・仕入れ
    const { data: purchases } = await supabaseAdmin
      .from('purchases').select('quantity, unit_price, type, purchased_at')
      .eq('product_id', product.id).gte('purchased_at', start).lt('purchased_at', end).order('purchased_at')
    for (const p of purchases ?? []) {
      const d = new Date(p.purchased_at)
      const label = p.type === 'half_buyout' ? '【半値買取】' : '【仕入れ】'
      rows.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, name: `${label}${product.name}`, qty: p.quantity, price: p.unit_price })
    }
  }

  rows.sort((a, b) => a.date.localeCompare(b.date))
  const total = rows.reduce((s, r) => s + r.qty * r.price, 0)

  return NextResponse.json({ contractor: contractor.name, month, rows, total })
}
