import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const events = body.events ?? []

  for (const event of events) {
    if (event.type !== 'message') continue
    const source = event.source
    const groupId = source?.groupId ?? source?.roomId ?? source?.userId ?? '不明'
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!
    const res = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: `グループID：${groupId}` }],
      }),
    })
    console.log('LINE reply status:', res.status, await res.text())
  }

  return NextResponse.json({ ok: true })
}
