import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, name, price')
    .eq('contractor_id', id)

  type Entry = { id: string | null; date: string; label: string; name: string; qty: number; amount: number | null }
  const entries: Entry[] = []

  for (const product of products ?? []) {
    const { data: additions } = await supabaseAdmin
      .from('stock_additions').select('quantity, added_at')
      .eq('product_id', product.id).gte('added_at', start).lt('added_at', end)
    for (const a of additions ?? []) {
      const d = new Date(a.added_at)
      entries.push({ id: null, date: `${d.getMonth() + 1}/${d.getDate()}`, label: '補充', name: product.name, qty: a.quantity, amount: null })
    }

    const { data: sales } = await supabaseAdmin
      .from('sales').select('id, quantity, sold_at, unit_price')
      .eq('product_id', product.id).gte('sold_at', start).lt('sold_at', end)
    for (const s of sales ?? []) {
      const d = new Date(s.sold_at)
      const price = s.unit_price ?? product.price
      entries.push({ id: s.id, date: `${d.getMonth() + 1}/${d.getDate()}`, label: '販売', name: product.name, qty: s.quantity, amount: s.quantity * price })
    }

    const { data: purchases } = await supabaseAdmin
      .from('purchases').select('quantity, unit_price, type, purchased_at')
      .eq('product_id', product.id).gte('purchased_at', start).lt('purchased_at', end)
    for (const p of purchases ?? []) {
      const d = new Date(p.purchased_at)
      entries.push({ id: null, date: `${d.getMonth() + 1}/${d.getDate()}`, label: p.type === 'half_buyout' ? '半値買取' : '仕入れ', name: product.name, qty: p.quantity, amount: p.quantity * p.unit_price })
    }
  }

  entries.sort((a, b) => a.date.localeCompare(b.date))
  return NextResponse.json(entries)
}
