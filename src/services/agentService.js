import { supabase } from '../lib/supabase'

export const agentService = {
  async getAgents(officeId) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('office_id', officeId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async getAgent(id) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async createAgent({ officeId, name, role, systemPrompt, avatarSprite, positionX, positionY }) {
    const { data, error } = await supabase
      .from('agents')
      .insert({
        office_id: officeId,
        name,
        role,
        system_prompt: systemPrompt,
        avatar_sprite: avatarSprite ?? 'agent_default',
        position_x: positionX ?? 5,
        position_y: positionY ?? 5,
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateAgent(id, updates) {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteAgent(id) {
    const { error } = await supabase.from('agents').delete().eq('id', id)
    if (error) throw error
  },

  async addAbility(agentId, ability) {
    const agent = await agentService.getAgent(agentId)
    const abilities = [...(agent.abilities ?? []), ability]
    return agentService.updateAgent(agentId, { abilities })
  },

  async removeAbility(agentId, abilityId) {
    const agent = await agentService.getAgent(agentId)
    const abilities = (agent.abilities ?? []).filter((a) => a.ability_id !== abilityId)
    return agentService.updateAgent(agentId, { abilities })
  },

  async updateStatus(agentId, status) {
    return agentService.updateAgent(agentId, { status })
  },
}
