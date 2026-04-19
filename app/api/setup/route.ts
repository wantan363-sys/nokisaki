import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data } = await supabaseAdmin.from('group_log').select('group_id').order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}
