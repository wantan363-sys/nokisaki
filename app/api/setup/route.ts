import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const [{ data: groups }, { data: contractors }] = await Promise.all([
    supabaseAdmin.from('group_log').select('group_id').order('created_at', { ascending: false }),
    supabaseAdmin.from('contractors').select('name, line_group_id'),
  ])

  const assignedMap: Record<string, string> = {}
  for (const c of contractors ?? []) {
    if (c.line_group_id) assignedMap[c.line_group_id] = c.name
  }

  const result = (groups ?? []).map(g => ({
    group_id: g.group_id,
    assigned_to: assignedMap[g.group_id] ?? null,
  }))

  return NextResponse.json(result)
}
