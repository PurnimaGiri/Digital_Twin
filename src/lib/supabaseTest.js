
import { supabase } from './supabase'

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('buildings')
    .select('id, name, code')
    .order('id')

  if (error) {
    console.error('Supabase connection error:', error.message)
    return
  }

  console.log('Supabase connected! Buildings:', data)
}
