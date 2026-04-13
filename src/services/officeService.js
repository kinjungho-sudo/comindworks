import { supabase } from '../lib/supabase'

export const officeService = {
  async getOffices() {
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async getOffice(id) {
    const { data, error } = await supabase
      .from('offices')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createOffice({ name, theme }) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('offices')
      .insert({ user_id: user.id, name, theme: theme ?? 'default' })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateOffice(id, updates) {
    const { data, error } = await supabase
      .from('offices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async saveLayout(officeId, layoutConfig) {
    return officeService.updateOffice(officeId, { layout_config: layoutConfig })
  },
}
