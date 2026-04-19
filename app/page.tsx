'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = { id: string; name: string; price: number; stock: number }
type Contractor = { id: string; name: string; line_group_id: string | null; products: Product[] }

export default function Home() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/contractors').then(r => r.json()).then(setContractors)
  }, [])

  async function sendMonthlyReport() {
    if (!confirm('月末レポートを全グループに送信しますか？')) return
    setSending(true)
    await fetch('/api/monthly-report', { method: 'POST' })
    setSending(false)
    alert('送信しました！！')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">契約者一覧</h1>
        <div className="flex gap-2">
          <button
            onClick={sendMonthlyReport}
            disabled={sending}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
          >
            {sending ? '送信中...' : '月末レポート送信'}
          </button>
          <Link href="/contractors/new" className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold">
            ＋ 契約者追加
          </Link>
        </div>
      </div>

      {contractors.length === 0 && (
        <p className="text-gray-400 text-center py-10">契約者がいません。追加してください。</p>
      )}

      {contractors.map(c => {
        const totalStock = c.products.reduce((s, p) => s + p.stock, 0)
        const lowStock = c.products.some(p => p.stock <= 2)
        return (
          <Link key={c.id} href={`/contractors/${c.id}`}>
            <div className={`bg-white rounded-xl shadow p-4 border-l-4 ${lowStock ? 'border-red-400' : 'border-green-400'} mt-2`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.products.length}商品 / 在庫計{totalStock}個</p>
                </div>
                {lowStock && <span className="text-red-500 text-sm font-bold">⚠️ 在庫少</span>}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
