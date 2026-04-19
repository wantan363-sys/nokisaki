import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const events = body.events ?? []

  for (const event of events) {
    const source = event.source
    if (source?.groupId) {
      await supabaseAdmin.from('group_log').upsert({ group_id: source.groupId }, { onConflict: 'group_id' })
    }
  }

  return NextResponse.json({ ok: true })
}
