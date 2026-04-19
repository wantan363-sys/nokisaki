import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data: contractors } = await supabaseAdmin
    .from('contractors')
    .select('id, name, line_group_id')

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!
  const results = []

  for (const c of contractors ?? []) {
    if (!c.line_group_id) {
      results.push({ name: c.name, status: 'グループIDなし' })
      continue
    }

    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: c.line_group_id,
        messages: [{ type: 'text', text: 'テスト送信！！' }],
      }),
    })

    const text = await res.text()
    results.push({ name: c.name, group_id: c.line_group_id, status: res.status, response: text })
  }

  return NextResponse.json(results)
}
