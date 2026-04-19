import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const events = body.events ?? []

  for (const event of events) {
    const source = event.source
    if (source?.type === 'group') {
      const groupId = source.groupId
      const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!
      await fetch('https://api.line.me/v2/bot/message/reply', {
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
    }
  }

  return NextResponse.json({ ok: true })
}
