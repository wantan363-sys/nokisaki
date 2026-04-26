import { supabaseAdmin } from '@/lib/supabase'
import { sendLineMessage } from '@/lib/line'
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

  // 商品・契約者情報を取得
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name, stock, contractors(name, line_group_id)')
    .eq('id', sale.product_id)
    .single()

  // 在庫を元に戻す
  if (product) {
    const newStock = product.stock + sale.quantity
    await supabaseAdmin
      .from('products')
      .update({ stock: newStock })
      .eq('id', sale.product_id)

    // LINE通知
    const contractor = (product.contractors as { name: string; line_group_id: string | null }[])[0] ?? null
    if (contractor?.line_group_id) {
      const msg = `🙏 先ほどの販売記録を取り消しました！\n「${product.name}」${sale.quantity}個の記録を誤って登録してしまいました。すみません！！\n\n在庫を${newStock}個に戻しました。`
      await sendLineMessage(contractor.line_group_id, msg)
    }
  }

  // 売上レコードを削除
  const { error: dErr } = await supabaseAdmin.from('sales').delete().eq('id', id)
  if (dErr) return NextResponse.json({ error: dErr }, { status: 500 })

  return NextResponse.json({ ok: true })
}
