'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Product = { id: string; name: string; price: number; stock: number }
type Contractor = { id: string; name: string; line_group_id: string | null; products: Product[] }
type HistoryEntry = { id: string | null; date: string; label: string; name: string; qty: number; amount: number | null }

const labelStyle: { [key: string]: string } = {
  '補充': 'bg-blue-100 text-blue-700',
  '販売': 'bg-orange-100 text-orange-700',
  '半値買取': 'bg-yellow-100 text-yellow-700',
  '仕入れ': 'bg-purple-100 text-purple-700',
}

export default function ContractorDetail() {
  const { id } = useParams()
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)
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
    const data: Contractor[] = await res.json()
    setContractor(data.find(c => c.id === id) ?? null)
    const hRes = await fetch(`/api/contractors/${id}/history`)
    setHistory(await hRes.json())
  }

  useEffect(() => { load() }, [])

  async function saveName() {
    if (!nameInput.trim()) return
    setSaving(true)
    await fetch(`/api/contractors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput.trim() }),
    })
    setSaving(false)
    setEditingName(false)
    await load()
  }

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

  if (!contractor) return <p className="text-center text-gray-400 py-10">読み込み中...</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/" className="text-green-600 text-sm">← 一覧に戻る</Link>
          {editingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                className="border rounded-lg px-2 py-1 text-sm font-bold text-gray-800 w-36"
              />
              <button onClick={saveName} disabled={saving} className="text-xs bg-green-500 text-white px-2 py-1 rounded-lg disabled:opacity-50">
                {saving ? '...' : '保存'}
              </button>
              <button onClick={() => setEditingName(false)} className="text-xs text-gray-400">キャンセル</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-xl font-bold text-gray-800">{contractor.name}さん</h1>
              <button
                onClick={() => { setNameInput(contractor.name); setEditingName(true) }}
                className="text-xs text-gray-400 border border-gray-300 px-2 py-0.5 rounded-lg"
              >
                ✏️ 編集
              </button>
            </div>
          )}
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
        <div key={p.id} className={`bg-white rounded-xl shadow px-4 py-3 border-l-4 ${p.stock <= 2 ? 'border-red-400' : 'border-green-400'}`}>
          {/* 1行目：商品名・在庫・売れたボタン */}
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-gray-800 text-sm">{p.name}</span>
              <span className="text-xs text-gray-400 ml-2">{p.price.toLocaleString()}円</span>
              <span className={`text-xs font-bold ml-2 ${p.stock <= 2 ? 'text-red-500' : 'text-green-600'}`}>
                在庫{p.stock}個{p.stock <= 2 && '⚠️'}
              </span>
              <button
                onClick={async () => {
                  if (!confirm(`「${p.name}」を削除しますか？`)) return
                  await fetch(`/api/products/${p.id}`, { method: 'DELETE' })
                  await load()
                }}
                className="text-xs text-red-400 ml-2"
              >
                🗑️
              </button>
            </div>
            <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
              <div className="flex items-center gap-1">
                <input
                  type="number" min="1" placeholder="1"
                  value={sellQty[p.id] || ''}
                  onChange={e => setSellQty(prev => ({ ...prev, [p.id]: e.target.value }))}
                  className="border rounded-lg w-10 py-2 text-sm text-center"
                />
                <button
                  onClick={() => sell(p.id)}
                  disabled={selling === p.id || p.stock === 0}
                  className="bg-orange-500 text-white px-3 py-2 rounded-xl font-bold text-sm disabled:opacity-40 active:scale-95"
                >
                  {selling === p.id ? '...' : p.stock === 0 ? '売切れ' : '売れた！！'}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">値引価格</span>
                <input
                  type="number" min="0" placeholder={String(p.price)}
                  value={sellPrice[p.id] || ''}
                  onChange={e => setSellPrice(prev => ({ ...prev, [p.id]: e.target.value }))}
                  className="border rounded-lg w-16 py-1 text-xs text-center text-red-500"
                />
                <span className="text-xs text-gray-400">円</span>
              </div>
            </div>
          </div>

          {/* 2行目：補充・半値・仕入れ */}
          <div className="flex gap-2 mt-2">
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
                  className={`${color} text-white py-1 px-2 rounded-lg text-xs font-bold disabled:opacity-50 flex-1`}>
                  {loading ? '...' : label}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 今月の履歴 */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-bold text-gray-700 mb-3">今月の記録</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 w-10">{h.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${labelStyle[h.label] ?? 'bg-gray-100 text-gray-600'}`}>{h.label}</span>
                  <span className="text-gray-700">{h.name}</span>
                  <span className="text-gray-500">{h.qty}個</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-gray-700 font-bold">
                    {h.amount !== null ? `¥${h.amount.toLocaleString()}` : '—'}
                  </span>
                  {h.label === '販売' && h.id && (
                    <button
                      onClick={async () => {
                        if (!confirm(`「${h.name}」${h.qty}個の販売を取り消しますか？\n在庫が元に戻ります。`)) return
                        await fetch(`/api/sales/${h.id}`, { method: 'DELETE' })
                        await load()
                      }}
                      className="text-xs text-red-400 border border-red-300 px-2 py-0.5 rounded-lg"
                    >
                      取り消し
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
