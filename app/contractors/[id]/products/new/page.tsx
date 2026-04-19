'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function NewProduct() {
  const router = useRouter()
  const { id } = useParams()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractor_id: id, name, price: Number(price), stock: Number(stock) }),
    })
    router.push(`/contractors/${id}`)
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <Link href={`/contractors/${id}`} className="text-green-600 text-sm">← 戻る</Link>
      <h1 className="text-xl font-bold my-4 text-gray-800">商品を追加</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">商品名 *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="例：手作りジャム"
            className="w-full border rounded-lg px-3 py-2 text-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">価格（円）*</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            min="0"
            placeholder="500"
            className="w-full border rounded-lg px-3 py-2 text-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">初期在庫数 *</label>
          <input
            type="number"
            value={stock}
            onChange={e => setStock(e.target.value)}
            required
            min="0"
            placeholder="10"
            className="w-full border rounded-lg px-3 py-2 text-gray-800"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-bold text-lg disabled:opacity-50"
        >
          {loading ? '追加中...' : '追加する'}
        </button>
      </form>
    </div>
  )
}
