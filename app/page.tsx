'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = { id: string; name: string; price: number; stock: number }
type Contractor = { id: string; name: string; line_group_id: string | null; products: Product[] }

export default function Home() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [selling, setSelling] = useState<string | null>(null)
  const [restocking, setRestocking] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [sellQty, setSellQty] = useState<{ [id: string]: string }>({})
  const [sellPrice, setSellPrice] = useState<{ [id: string]: string }>({})
  const [restockQty, setRestockQty] = useState<{ [id: string]: string }>({})
  const [buyoutQty, setBuyoutQty] = useState<{ [id: string]: string }>({})
  const [procureQty, setProcureQty] = useState<{ [id: string]: string }>({})

  async function load() {
    const res = await fetch('/api/contractors')
    setContractors(await res.json())
  }

  useEffect(() => { load() }, [])

  async function sell(productId: string) {
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

  async function restock(productId: string) {
    const qty = parseInt(restockQty[productId] || '0')
    if (!qty || qty <= 0) return alert('追加数を入力してください')
    setRestocking(productId)
    await fetch(`/api/products/${productId}/restock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qty }),
    })
    setRestockQty(prev => ({ ...prev, [productId]: '' }))
    setRestocking(null)
    await load()
  }

  async function purchase(productId: string, type: 'half_buyout' | 'procurement') {
    const qty = parseInt(type === 'half_buyout' ? (buyoutQty[productId] || '0') : (procureQty[productId] || '0'))
    if (!qty || qty <= 0) return alert('個数を入力してください')
    const label = type === 'half_buyout' ? '半値買取' : '仕入れ'
    if (!confirm(`「${label}」${qty}個でよろしいですか？`)) return
    setPurchasing(productId + type)
    const res = await fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity: qty, type }),
    })
    const data = await res.json()
    if (!res.ok) alert(data.error)
    if (type === 'half_buyout') setBuyoutQty(prev => ({ ...prev, [productId]: '' }))
    else setProcureQty(prev => ({ ...prev, [productId]: '' }))
    setPurchasing(null)
    await load()
  }

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
        <Link href="/contractors" className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-bold">
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

      {/* 在庫あり商品一覧 */}
      {inStockGroups.map(({ contractor: c, products }) => (
        <div key={c.id}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              🌿 {c.name}
            </p>
            <Link href={`/contractors/${c.id}`} className="text-xs text-gray-400 underline">
              詳細 →
            </Link>
          </div>

          {products.map(p => (
            <div
              key={p.id}
              className={`bg-white rounded-xl shadow px-4 py-3 border-l-4 mb-2 ${p.stock <= 2 ? 'border-red-400' : 'border-green-400'}`}
            >
              {/* 商品名・在庫 */}
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                  <p className={`text-xs font-bold mt-0.5 ${p.stock <= 2 ? 'text-red-500' : 'text-green-600'}`}>
                    在庫 {p.stock}個{p.stock <= 2 && ' ⚠️'}
                  </p>
                </div>
              </div>

              {/* 売れた */}
              <div className="flex items-center gap-1 mb-1">
                <input
                  type="number" min="1" placeholder="1"
                  value={sellQty[p.id] || ''}
                  onChange={e => setSellQty(prev => ({ ...prev, [p.id]: e.target.value }))}
                  className="border rounded-lg w-12 py-1.5 text-sm text-center shrink-0"
                />
                <button
                  onClick={() => sell(p.id)}
                  disabled={selling === p.id}
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-xl font-bold text-sm disabled:opacity-40 active:scale-95 flex-1"
                >
                  {selling === p.id ? '...' : '売れた！！'}
                </button>
                <input
                  type="number" min="0" placeholder={String(p.price)}
                  value={sellPrice[p.id] || ''}
                  onChange={e => setSellPrice(prev => ({ ...prev, [p.id]: e.target.value }))}
                  className="border rounded w-16 px-1 py-1.5 text-xs text-center text-red-500 shrink-0"
                />
                <span className="text-xs text-gray-400 shrink-0">円</span>
              </div>

              {/* 補充・半値・仕入れ */}
              <div className="flex gap-1.5">
                {[
                  { label: '📦補充', color: 'bg-blue-500', input: restockQty, setInput: setRestockQty, action: () => restock(p.id), loading: restocking === p.id },
                  { label: '🏷️半値', color: 'bg-yellow-500', input: buyoutQty, setInput: setBuyoutQty, action: () => purchase(p.id, 'half_buyout'), loading: purchasing === p.id + 'half_buyout' },
                  { label: '🛒仕入', color: 'bg-purple-500', input: procureQty, setInput: setProcureQty, action: () => purchase(p.id, 'procurement'), loading: purchasing === p.id + 'procurement' },
                ].map(({ label, color, input, setInput, action, loading }) => (
                  <div key={label} className="flex items-center gap-1 flex-1">
                    <input type="number" min="1" placeholder="0"
                      value={input[p.id] || ''}
                      onChange={e => setInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="border rounded-lg w-10 py-1 text-xs text-center shrink-0" />
                    <button onClick={action} disabled={loading}
                      className={`${color} text-white py-1 px-1.5 rounded-lg text-xs font-bold disabled:opacity-50 flex-1`}>
                      {loading ? '...' : label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
