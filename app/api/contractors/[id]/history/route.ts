import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(req.url)
  const now = new Date()
  const year = parseInt(url.searchParams.get('year') ?? String(now.getFullYear()))
  const month = parseInt(url.searchParams.get('month') ?? String(now.getMonth() + 1))
  const start = new Date(year, month - 1, 1).toISOString()
  const end = new Date(year, month, 1).toISOString()

  type Entry = { id: string; recordType: string; date: string; label: string; name: string; qty: number; amount: number | null }
  const entries: Entry[] = []

  // stock_additions（補充）- contractor_idで直接取得し、商品名はproductかproduct_nameを使用
  const { data: additions } = await supabaseAdmin
    .from('stock_additions')
    .select('id, quantity, added_at, product_name, products(name)')
    .eq('contractor_id', id)
    .gte('added_at', start)
    .lt('added_at', end)

  for (const a of additions ?? []) {
    const d = new Date(a.added_at)
    const name = (a.products as { name: string } | null)?.name ?? a.product_name ?? '（削除済み商品）'
    entries.push({ id: a.id, recordType: 'stock_addition', date: `${d.getMonth() + 1}/${d.getDate()}`, label: '補充', name, qty: a.quantity, amount: null })
  }

  // sales（販売）
  const { data: sales } = await supabaseAdmin
    .from('sales')
    .select('id, quantity, sold_at, unit_price, product_name, products(name, price)')
    .eq('contractor_id', id)
    .gte('sold_at', start)
    .lt('sold_at', end)

  for (const s of sales ?? []) {
    const d = new Date(s.sold_at)
    const name = (s.products as { name: string; price: number } | null)?.name ?? s.product_name ?? '（削除済み商品）'
    const price = s.unit_price
    entries.push({ id: s.id, recordType: 'sale', date: `${d.getMonth() + 1}/${d.getDate()}`, label: '販売', name, qty: s.quantity, amount: s.quantity * price })
  }

  // purchases（半値買取・仕入れ）
  const { data: purchases } = await supabaseAdmin
    .from('purchases')
    .select('id, quantity, unit_price, type, purchased_at, product_name, products(name)')
    .eq('contractor_id', id)
    .gte('purchased_at', start)
    .lt('purchased_at', end)

  for (const p of purchases ?? []) {
    const d = new Date(p.purchased_at)
    const name = (p.products as { name: string } | null)?.name ?? p.product_name ?? '（削除済み商品）'
    entries.push({ id: p.id, recordType: 'purchase', date: `${d.getMonth() + 1}/${d.getDate()}`, label: p.type === 'half_buyout' ? '半値買取' : '仕入れ', name, qty: p.quantity, amount: p.quantity * p.unit_price })
  }

  entries.sort((a, b) => a.date.localeCompare(b.date))
  return NextResponse.json(entries)
}
