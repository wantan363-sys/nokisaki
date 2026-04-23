'use client'
import { useEffect, useState } from 'react'

type GroupEntry = { group_id: string; assigned_to: string | null }

export default function Setup() {
  const [groups, setGroups] = useState<GroupEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/setup')
    const data = await res.json()
    setGroups(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">受信したグループID一覧</h1>
        <button onClick={load} className="text-sm text-green-600 border border-green-500 px-3 py-1 rounded-lg">更新</button>
      </div>
      <p className="text-sm text-gray-500">LINEグループでメッセージを送るとここに表示されます</p>

      {loading && <p className="text-gray-400">読み込み中...</p>}

      {!loading && groups.length === 0 && (
        <p className="text-orange-500">まだ受信していません。グループでメッセージを送ってください。</p>
      )}

      {groups.map(g => (
        <div
          key={g.group_id}
          className={`rounded-lg p-3 break-all border ${g.assigned_to ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">グループID</p>
            {g.assigned_to ? (
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                ✅ {g.assigned_to}さん割り当て済み
              </span>
            ) : (
              <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                未割り当て
              </span>
            )}
          </div>
          <p className="font-mono text-sm text-gray-800">{g.group_id}</p>
          <button
            onClick={() => navigator.clipboard.writeText(g.group_id)}
            className="mt-2 text-xs bg-green-500 text-white px-3 py-1 rounded"
          >
            コピー
          </button>
        </div>
      ))}
    </div>
  )
}
