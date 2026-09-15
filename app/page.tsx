'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = { id: string; name: string; price: number; stock: number }
type Contractor = { id: string; name: string; line_group_id: string | null; products: Product[] }

export default function Home() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [selling, setSelling] = useState<string | null>(null)
  const [sellQty, setSellQty] = useState<{ [id: string]: string }>({})
  const [sellPrice, setSellPrice] = useState<{ [id: string]: string }>({})

  async function load() {
    const res = await fetch('/api/contractors')
    setContractors(await res.json())
  }

  useEffect(() => { load() }, [])

  async function sell(productId: string, defaultPrice: number) {
    const qty = parseInt(sellQty[productId] || '1')
    if (qty <= 0) return alert('数量を入力してください')
    const customPrice = sellPrice[productId] ? parseInt(sellPrice[productId]) : undefined
    setSelling(productId)
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity: qty, unit_price: customPrice }),
    })
    const data = await res.json()
    if (!res.ok) alert(data.error)
    setSellQty(prev => ({ ...prev, [productId]: '' }))
    setSellPrice(prev => ({ ...prev, [productId]: '' }))
    setSelling(null)
    await load()
  }

  // 在庫あり商品を全農家から集める
  const inStockGroups = contractors
    .map(c => ({ contractor: c, products: c.products.filter(p => p.stock > 0) }))
    .filter(g => g.products.length > 0)

  const totalInStock = inStockGroups.reduce((s, g) => s + g.products.length, 0)

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">軒先販売</h1>
          <p className="text-xs text-gray-400">在庫あり {totalInStock}商品</p>
        </div>
        <Link
          href="/contractors"
          className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-bold"
        >
          ⚙️ 管理
        </Link>
      </div>

      {inStockGroups.length === 0 && contractors.length > 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📦</p>
          <p className="font-bold">在庫のある商品がありません</p>
          <Link href="/contractors" className="text-green-600 text-sm mt-2 inline-block">管理画面から補充できます</Link>
        </div>
      )}

      {contractors.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">契約者がいません。</p>
          <Link href="/contractors" className="text-green-600 text-sm mt-1 inline-block">管理画面から追加</Link>
        </div>
      )}

      {/* 在庫あり商品一覧（農家ごとにグループ） */}
      {inStockGroups.map(({ contractor: c, products }) => (
        <div key={c.id}>
          {/* 農家名ヘッダー */}
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              🌿 {c.name}
            </p>
            <Link href={`/contractors/${c.id}`} className="text-xs text-gray-400 underline">
              詳細・補充 →
            </Link>
          </div>

          {/* 商品カード */}
          {products.map(p => (
            <div
              key={p.id}
              className={`bg-white rounded-xl shadow px-4 py-3 border-l-4 mb-2 ${p.stock <= 2 ? 'border-red-400' : 'border-green-400'}`}
            >
              <div className="flex justify-between items-start gap-2">
                {/* 左：商品情報 */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                  <p className={`text-xs font-bold mt-0.5 ${p.stock <= 2 ? 'text-red-500' : 'text-green-600'}`}>
                    在庫 {p.stock}個{p.stock <= 2 && ' ⚠️'}
                  </p>
                  {/* 値引き価格入力 */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-400">値引</span>
                    <input
                      type="number" min="0" placeholder={String(p.price)}
                      value={sellPrice[p.id] || ''}
                      onChange={e => setSellPrice(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="border rounded w-16 px-1 py-0.5 text-xs text-center text-red-500"
                    />
                    <span className="text-xs text-gray-400">円（定価{p.price.toLocaleString()}円）</span>
                  </div>
                </div>

                {/* 右：数量・売れたボタン */}
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number" min="1" placeholder="1"
                    value={sellQty[p.id] || ''}
                    onChange={e => setSellQty(prev => ({ ...prev, [p.id]: e.target.value }))}
                    className="border rounded-lg w-12 py-2 text-sm text-center"
                  />
                  <button
                    onClick={() => sell(p.id, p.price)}
                    disabled={selling === p.id}
                    className="bg-orange-500 text-white px-3 py-2 rounded-xl font-bold text-sm disabled:opacity-40 active:scale-95 whitespace-nowrap"
                  >
                    {selling === p.id ? '...' : '売れた！！'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
