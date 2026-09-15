import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

type ProductRef = { name: string; price?: number }

function productName(ref: unknown, fallback: string | null): string {
  // Supabaseのjoinは配列で返ることがある
  if (Array.isArray(ref)) return (ref[0] as ProductRef | undefined)?.name ?? fallback ?? '（削除済み商品）'
  if (ref && typeof ref === 'object') return (ref as ProductRef).name ?? fallback ?? '（削除済み商品）'
  return fallback ?? '（削除済み商品）'
}

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

  // 補充
  const { data: additions } = await supabaseAdmin
    .from('stock_additions')
    .select('id, quantity, added_at, product_name, products(name)')
    .eq('contractor_id', id)
    .gte('added_at', start)
    .lt('added_at', end)

  for (const a of additions ?? []) {
    const d = new Date(a.added_at)
    entries.push({ id: a.id, recordType: 'stock_addition', date: `${d.getMonth() + 1}/${d.getDate()}`, label: '補充', name: productName(a.products, a.product_name), qty: a.quantity, amount: null })
  }

  // 販売
  const { data: sales } = await supabaseAdmin
    .from('sales')
    .select('id, quantity, sold_at, unit_price, product_name, products(name, price)')
    .eq('contractor_id', id)
    .gte('sold_at', start)
    .lt('sold_at', end)

  for (const s of sales ?? []) {
    const d = new Date(s.sold_at)
    entries.push({ id: s.id, recordType: 'sale', date: `${d.getMonth() + 1}/${d.getDate()}`, label: '販売', name: productName(s.products, s.product_name), qty: s.quantity, amount: s.quantity * s.unit_price })
  }

  // 買取・仕入れ
  const { data: purchases } = await supabaseAdmin
    .from('purchases')
    .select('id, quantity, unit_price, type, purchased_at, product_name, products(name)')
    .eq('contractor_id', id)
    .gte('purchased_at', start)
    .lt('purchased_at', end)

  for (const p of purchases ?? []) {
    const d = new Date(p.purchased_at)
    entries.push({ id: p.id, recordType: 'purchase', date: `${d.getMonth() + 1}/${d.getDate()}`, label: p.type === 'half_buyout' ? '半値買取' : '仕入れ', name: productName(p.products, p.product_name), qty: p.quantity, amount: p.quantity * p.unit_price })
  }

  entries.sort((a, b) => a.date.localeCompare(b.date))
  return NextResponse.json(entries)
}
