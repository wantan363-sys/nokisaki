'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewContractor() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [groupId, setGroupId] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/contractors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, line_group_id: groupId || null }),
    })
    router.push('/')
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h1 className="text-xl font-bold mb-6 text-gray-800">契約者を追加</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">お名前 *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="例：田中さん"
            className="w-full border rounded-lg px-3 py-2 text-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LINE グループID</label>
          <input
            type="text"
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            placeholder="C xxxxxxxx..."
            className="w-full border rounded-lg px-3 py-2 text-gray-800"
          />
          <p className="text-xs text-gray-400 mt-1">※ あとで設定もできます</p>
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
