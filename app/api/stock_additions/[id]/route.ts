import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: addition } = await supabaseAdmin
    .from('stock_additions')
    .select('product_id, quantity')
    .eq('id', id)
    .single()

  if (!addition) return NextResponse.json({ error: '記録が見つかりません' }, { status: 404 })

  // 在庫を元に戻す（補充分を引く）
  const { data: product } = await supabaseAdmin
    .from('products').select('stock').eq('id', addition.product_id).single()

  if (product) {
    await supabaseAdmin
      .from('products')
      .update({ stock: Math.max(0, product.stock - addition.quantity) })
      .eq('id', addition.product_id)
  }

  const { error } = await supabaseAdmin.from('stock_additions').delete().eq('id', id)
  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ ok: true })
}
