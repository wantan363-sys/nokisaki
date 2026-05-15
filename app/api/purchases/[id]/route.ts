import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: purchase } = await supabaseAdmin
    .from('purchases')
    .select('product_id, quantity')
    .eq('id', id)
    .single()

  if (!purchase) return NextResponse.json({ error: '記録が見つかりません' }, { status: 404 })

  // 在庫を元に戻す
  const { data: product } = await supabaseAdmin
    .from('products').select('stock').eq('id', purchase.product_id).single()

  if (product) {
    await supabaseAdmin
      .from('products')
      .update({ stock: product.stock + purchase.quantity })
      .eq('id', purchase.product_id)
  }

  const { error } = await supabaseAdmin.from('purchases').delete().eq('id', id)
  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ ok: true })
}
