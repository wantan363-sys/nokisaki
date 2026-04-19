'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Row = { date: string; name: string; qty: number; price: number }
type Report = { contractor: string; month: string; rows: Row[]; total: number }

export default function ReportPage() {
  const { month, contractorId } = useParams()
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    fetch(`/api/report-data/${month}/${contractorId}`)
      .then(r => r.json())
      .then(setReport)
  }, [])

  if (!report) return <p className="text-center py-10 text-gray-400">読み込み中...</p>

  const [year, m] = report.month.split('-')
  let cumulative = 0

  return (
    <>
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      <div className="no-print mb-4 flex gap-2">
        <button onClick={() => window.print()} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">
          PDFとして保存 / 印刷
        </button>
      </div>

      <div className="bg-white p-8 border" style={{ fontFamily: 'serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="text-2xl font-bold text-center mb-6">売 上 報 告 書</h1>

        <div className="flex justify-between mb-4">
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-lg border-b border-black w-48 inline-block">{report.contractor}</span>
              <span>御中</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="border border-black px-2 py-1 text-sm">納品物</span>
              <span className="border-b border-black w-48 inline-block">&nbsp;</span>
            </div>
          </div>
          <div className="text-sm space-y-1">
            <p>No.：</p>
            <p>発行日：{year}年{m}月末日</p>
            <p>納品期間：{year}年{m}月</p>
            <div className="mt-3">
              <p className="font-bold">MIKASAKAN</p>
              <p>〒649-6532</p>
              <p>和歌山県紀の川市中山244-3</p>
            </div>
          </div>
        </div>

        <p className="text-sm mb-2">下記の通り売り上げを計上いたしました。</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="border border-black px-2 py-1 text-sm">合計金額</span>
          <span className="border border-black px-4 py-1 font-bold text-lg w-48 text-right">
            ¥{report.total.toLocaleString()}
          </span>
        </div>

        <table className="w-full border-collapse border border-black text-sm mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-2 py-1 w-16">日付</th>
              <th className="border border-black px-2 py-1">内容</th>
              <th className="border border-black px-2 py-1 w-16">数量</th>
              <th className="border border-black px-2 py-1 w-24">金額</th>
              <th className="border border-black px-2 py-1 w-24">累計</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row, i) => {
              cumulative += row.qty * row.price
              return (
                <tr key={i}>
                  <td className="border border-black px-2 py-1 text-center">{row.date}</td>
                  <td className="border border-black px-2 py-1">{row.name}</td>
                  <td className="border border-black px-2 py-1 text-center">{row.qty}</td>
                  <td className="border border-black px-2 py-1 text-right">¥{(row.qty * row.price).toLocaleString()}</td>
                  <td className="border border-black px-2 py-1 text-right">¥{cumulative.toLocaleString()}</td>
                </tr>
              )
            })}
            {Array.from({ length: Math.max(0, 15 - report.rows.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-black px-2 py-2">&nbsp;</td>
                <td className="border border-black px-2 py-2">&nbsp;</td>
                <td className="border border-black px-2 py-2">&nbsp;</td>
                <td className="border border-black px-2 py-2">&nbsp;</td>
                <td className="border border-black px-2 py-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center gap-2">
          <span className="border border-black px-2 py-1 text-sm">お支払い</span>
          <span className="border border-black px-4 py-1 w-full">&nbsp;</span>
        </div>
      </div>
    </>
  )
}
