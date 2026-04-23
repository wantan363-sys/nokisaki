'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Product = { id: string; name: string; price: number; stock: number }
type Contractor = { id: string; name: string; line_group_id: string | null; products: Product[] }

export default function ContractorDetail() {
  const { id } = useParams()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [selling, setSelling] = useState<string | null>(null)
  const [restocking, setRestocking] = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState<{ [id: string]: string }>({})

  async function load() {
    const res = await fetch('/api/contractors')
    const data: Contractor[] = await res.json()
    setContractor(data.find(c => c.id === id) ?? null)
  }

  useEffect(() => { load() }, [])

  async function sell(productId: string) {
    setSelling(productId)
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
    const data = await res.json()
    if (!res.ok) alert(data.error)
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

  if (!contractor) return <p className="text-center text-gray-400 py-10">読み込み中...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/" className="text-green-600 text-sm">← 一覧に戻る</Link>
          <h1 className="text-xl font-bold text-gray-800 mt-1">{contractor.name}さん</h1>
          {!contractor.line_group_id && (
            <p className="text-xs text-orange-500">⚠️ LINEグループIDが未設定です</p>
          )}
        </div>
        <Link href={`/contractors/${id}/products/new`} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold">
          ＋ 商品追加
        </Link>
      </div>

      {contractor.products.length === 0 && (
        <p className="text-gray-400 text-center py-10">商品がありません。追加してください。</p>
      )}

      {contractor.products.map(p => (
        <div key={p.id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${p.stock <= 2 ? 'border-red-400' : 'border-green-400'}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">{p.name}</p>
              <p className="text-sm text-gray-500">{p.price.toLocaleString()}円</p>
              <p className={`text-sm font-bold mt-1 ${p.stock <= 2 ? 'text-red-500' : 'text-green-600'}`}>
                在庫：{p.stock}個 {p.stock <= 2 && '⚠️'}
              </p>
            </div>
            <button
              onClick={() => sell(p.id)}
              disabled={selling === p.id || p.stock === 0}
              className="bg-orange-500 text-white px-4 py-3 rounded-xl font-bold text-lg disabled:opacity-40 active:scale-95"
            >
              {selling === p.id ? '...' : p.stock === 0 ? '売切れ' : '売れた！！'}
            </button>
          </div>

          {/* 在庫追加エリア */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="text-sm text-gray-500">補充：</span>
            <input
              type="number"
              min="1"
              placeholder="個数"
              value={restockQty[p.id] || ''}
              onChange={e => setRestockQty(prev => ({ ...prev, [p.id]: e.target.value }))}
              className="border rounded-lg px-2 py-1 w-20 text-sm text-center"
            />
            <span className="text-sm text-gray-500">個</span>
            <button
              onClick={() => restock(p.id)}
              disabled={restocking === p.id}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {restocking === p.id ? '...' : '＋ 追加'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
