import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 売上レコードを取得
  const { data: sale, error: sErr } = await supabaseAdmin
    .from('sales')
    .select('product_id, quantity')
    .eq('id', id)
    .single()

  if (sErr || !sale) return NextResponse.json({ error: '売上が見つかりません' }, { status: 404 })

  // 在庫を元に戻す
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('stock')
    .eq('id', sale.product_id)
    .single()

  if (product) {
    await supabaseAdmin
      .from('products')
      .update({ stock: product.stock + sale.quantity })
      .eq('id', sale.product_id)
  }

  // 売上レコードを削除
  const { error: dErr } = await supabaseAdmin.from('sales').delete().eq('id', id)
  if (dErr) return NextResponse.json({ error: dErr }, { status: 500 })

  return NextResponse.json({ ok: true })
}
