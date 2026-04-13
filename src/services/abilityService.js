import { supabase } from '../lib/supabase'

export const abilityService = {
  async getAbilities(tierFilter) {
    let query = supabase
      .from('ability_cards')
      .select('*')
      .order('category', { ascending: true })

    if (tierFilter) {
      const tiers = tierFilter === 'free'
        ? ['free']
        : tierFilter === 'basic'
        ? ['free', 'basic']
        : ['free', 'basic', 'pro']
      query = query.in('tier_required', tiers)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getAbility(id) {
    const { data, error } = await supabase
      .from('ability_cards')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
}
