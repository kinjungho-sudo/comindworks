import Anthropic from '@anthropic-ai/sdk'
import { authenticate, createAdminClient, errorResponse } from '../../_lib/supabase-admin.js'
import { getEmbedding, searchMemories } from '../../_lib/embeddings.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const COMMON_TOOLS = [
  {
    name: 'request_approval',
    description: '중요한 의사결정이나 최종 결과물을 사용자에게 검토 요청합니다.',
    input_schema: {
      type: 'object',
      properties: {
        checkpoint: { type: 'string', description: '체크포인트 이름' },
        message: { type: 'string', description: '사용자에게 전달할 메시지' },
      },
      required: ['checkpoint', 'message'],
    },
  },
  {
    name: 'save_memory',
    description: '중요한 결과물이나 인사이트를 에이전트 메모리에 저장합니다.',
    input_schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: '저장할 내용' },
        memory_type: {
          type: 'string',
          enum: ['task_result', 'user_feedback', 'context', 'decision'],
        },
      },
      required: ['content', 'memory_type'],
    },
  },
  {
    name: 'write_document',
    description: '보고서, 기획서, 문서를 작성합니다.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        content: { type: 'string', description: '마크다운 본문' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'generate_code',
    description: '프로그래밍 코드를 생성합니다.',
    input_schema: {
      type: 'object',
      properties: {
        language: { type: 'string' },
        description: { type: 'string' },
        code: { type: 'string', description: '생성된 코드' },
      },
      required: ['language', 'description', 'code'],
    },
  },
  {
    name: 'update_skill_doc',
    description: '작업에서 배운 내용을 내 스킬 문서(.md)에 기록한다. 새 능력 획득, 개선된 방법, 주의사항을 정리한다. 중요한 인사이트가 생겼을 때 호출하라.',
    input_schema: {
      type: 'object',
      properties: {
        section: { type: 'string', description: '추가할 섹션 제목 (없으면 날짜로 자동 생성)' },
        content: { type: 'string', description: '추가할 마크다운 내용' },
      },
      required: ['content'],
    },
  },
]

function buildSystemPrompt(agent, abilities, memories, skillDoc) {
  const abilityPrompts = (abilities ?? [])
    .map((a) => `\n## 능력: ${a.name}\n${a.prompt_template}`)
    .join('\n')

  const memoryContext = (memories ?? []).length > 0
    ? `\n## 관련 기억\n${memories.map((m, i) => `${i + 1}. ${m.content}`).join('\n')}`
    : ''

  const skillDocSection = skillDoc?.content
    ? `\n## 내 스킬 문서 (과거 작업에서 축적한 지식)\n${skillDoc.content}`
    : ''

  return `# 에이전트 설정
이름: ${agent.name} | 역할: ${agent.role}

${agent.system_prompt}

## 응답 스타일
- 말투: ${agent.personality?.tone ?? 'professional'}
- 언어: 한국어
${agent.personality?.specialNotes ? `- 특이사항: ${agent.personality.specialNotes}` : ''}
${abilityPrompts}
${memoryContext}

## 작업 원칙
1. 작업 시작 전 계획을 먼저 설명하세요.
2. 결과물은 write_document 또는 generate_code 도구로 반환하세요.
3. 최종 완료 전 반드시 request_approval로 검토를 요청하세요.
4. 완료 후 핵심 내용을 save_memory로 저장하세요.
5. 새로운 인사이트나 개선된 방법을 발견하면 update_skill_doc으로 스킬 문서를 갱신하세요.${skillDocSection}`
}

/**
 * 도구 실행 — 각 도구의 실제 동작 처리
 */
async function executeTool(toolName, toolInput, { agentId, taskId, admin, send }) {
  switch (toolName) {
    case 'write_document':
      send('tool_result', { tool: toolName, title: toolInput.title })
      return { success: true, document: { title: toolInput.title, content: toolInput.content } }

    case 'generate_code':
      send('tool_result', { tool: toolName, language: toolInput.language })
      return { success: true, code: toolInput.code, language: toolInput.language }

    case 'request_approval':
      // HITL: 프론트에 승인 요청 이벤트 전송
      send('approval_required', {
        checkpoint: toolInput.checkpoint,
        message: toolInput.message,
        task_id: taskId,
      })
      // MVP에서는 자동 승인 (실제 대기 메커니즘은 S Should Have)
      return { approved: true, message: '자동 승인되었습니다.' }

    case 'save_memory': {
      try {
        const embedding = await getEmbedding(toolInput.content) ?? Array(1536).fill(0)
        await admin.from('agent_memories').insert({
          agent_id: agentId,
          content: toolInput.content,
          embedding,
          memory_type: toolInput.memory_type,
          metadata: { task_id: taskId, saved_at: new Date().toISOString() },
        })
        send('memory_saved', { memory_type: toolInput.memory_type })
        return { success: true }
      } catch {
        return { success: false, error: '메모리 저장 실패' }
      }
    }

    case 'update_skill_doc': {
      try {
        const { section, content: docContent } = toolInput
        const sectionTitle = section || new Date().toLocaleDateString('ko-KR')

        const { data: existing } = await admin
          .from('agent_skill_docs')
          .select('*')
          .eq('agent_id', agentId)
          .single()

        if (!existing) {
          const initContent = `# 스킬 문서\n\n## ${sectionTitle}\n\n${docContent}`
          await admin.from('agent_skill_docs').insert({
            agent_id: agentId,
            content: initContent,
            version: 1,
          })
        } else {
          const appendContent = existing.content + `\n\n## ${sectionTitle}\n\n${docContent}`
          await admin.from('agent_skill_docs').update({
            content: appendContent,
            version: existing.version + 1,
          }).eq('id', existing.id)
        }

        send('tool_result', { tool: toolName, section: sectionTitle })
        return { success: true }
      } catch (e) {
        return { success: false, error: e.message }
      }
    }

    default:
      return { error: `알 수 없는 도구: ${toolName}` }
  }
}

export default async function handler(req) {
  if (req.method !== 'GET') return errorResponse('Method Not Allowed', 405)

  try {
    const { supabase } = await authenticate(req)
    const taskId = req.url.split('/tasks/')[1]?.split('/stream')[0]

    const { data: task, error: taskError } = await supabase
      .from('tasks').select('*').eq('id', taskId).single()
    if (taskError || !task) return errorResponse('작업을 찾을 수 없습니다.', 404)

    const { data: agent } = await supabase
      .from('agents').select('*').eq('id', task.agent_id).single()

    const abilityIds = (agent.abilities ?? []).map((a) => a.ability_id)
    const { data: abilities } = abilityIds.length > 0
      ? await supabase.from('ability_cards').select('*').in('id', abilityIds)
      : { data: [] }

    // 유사도 검색 (pgvector) → ilike fallback
    const memories = await searchMemories({
      supabase,
      agentId: agent.id,
      query: task.instruction,
      limit: 5,
    })

    // 에이전트 스킬 문서 로드 (admin 클라이언트로 RLS 우회)
    const adminForSkill = createAdminClient()
    const { data: skillDoc } = await adminForSkill
      .from('agent_skill_docs')
      .select('content, version')
      .eq('agent_id', agent.id)
      .single()

    const systemPrompt = buildSystemPrompt(agent, abilities, memories, skillDoc)
    const tools = [
      ...(abilities ?? []).flatMap((a) => a.tools_config ?? []),
      ...COMMON_TOOLS,
    ]
    // 도구 중복 제거 (이름 기준)
    const uniqueTools = tools.filter(
      (t, i, arr) => arr.findIndex((x) => x.name === t.name) === i
    )

    const admin = createAdminClient()
    await admin.from('tasks')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', taskId)
    await admin.from('agents').update({ status: 'thinking' }).eq('id', agent.id)

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const thinkingLog = []
        let stepNumber = 1
        let finalResult = null
        let totalInputTokens = 0
        let totalOutputTokens = 0

        function send(event, data) {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        function logStep(phase, content) {
          const step = { step: stepNumber++, phase, content, timestamp: new Date().toISOString() }
          thinkingLog.push(step)
          send('thinking', step)
          return step
        }

        try {
          // ── Multi-turn Tool Use 루프 ──────────────────────────────
          const messages = [{ role: 'user', content: task.instruction }]
          let continueLoop = true

          while (continueLoop) {
            logStep('planning', '응답을 생성하고 있습니다...')

            // Claude API 스트리밍 호출
            let textBuffer = ''
            const toolUseBlocks = []

            const response = await anthropic.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 4096,
              system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
              messages,
              tools: uniqueTools,
              stream: true,
            })

            let currentToolBlock = null

            for await (const event of response) {
              // 텍스트 스트리밍
              if (event.type === 'content_block_start') {
                if (event.content_block.type === 'tool_use') {
                  currentToolBlock = { id: event.content_block.id, name: event.content_block.name, inputJson: '' }
                  logStep('tool_use', `도구 호출 중: ${event.content_block.name}`)
                }
              }

              if (event.type === 'content_block_delta') {
                if (event.delta.type === 'text_delta') {
                  textBuffer += event.delta.text
                  // 줄바꿈이나 100자 단위로 스트리밍
                  if (textBuffer.includes('\n') || textBuffer.length >= 100) {
                    logStep('drafting', textBuffer.trim())
                    textBuffer = ''
                  }
                }
                if (event.delta.type === 'input_json_delta' && currentToolBlock) {
                  currentToolBlock.inputJson += event.delta.partial_json
                }
              }

              if (event.type === 'content_block_stop' && currentToolBlock) {
                try {
                  currentToolBlock.input = JSON.parse(currentToolBlock.inputJson)
                } catch {
                  currentToolBlock.input = {}
                }
                toolUseBlocks.push(currentToolBlock)
                currentToolBlock = null
              }
            }

            // 남은 텍스트 처리
            if (textBuffer.trim()) logStep('drafting', textBuffer.trim())

            const finalMsg = await response.finalMessage()
            totalInputTokens += finalMsg.usage.input_tokens
            totalOutputTokens += finalMsg.usage.output_tokens

            // ── stop_reason 처리 ────────────────────────────────────
            if (finalMsg.stop_reason === 'end_turn') {
              // 최종 텍스트 추출
              const resultText = finalMsg.content
                .filter((b) => b.type === 'text')
                .map((b) => b.text)
                .join('\n')
              finalResult = { content: resultText, format: 'markdown', generated_at: new Date().toISOString() }
              continueLoop = false

            } else if (finalMsg.stop_reason === 'tool_use') {
              // 도구 실행 후 결과를 messages에 추가해서 루프 계속
              const assistantContent = finalMsg.content

              // Tool 실행
              const toolResults = []
              for (const toolBlock of toolUseBlocks) {
                logStep('tool_use', `실행 중: ${toolBlock.name}`)
                const result = await executeTool(
                  toolBlock.name,
                  toolBlock.input,
                  { agentId: agent.id, taskId, admin, send }
                )

                // write_document / generate_code 결과를 finalResult로 저장
                if (toolBlock.name === 'write_document' && result.document) {
                  finalResult = {
                    content: `# ${result.document.title}\n\n${result.document.content}`,
                    format: 'markdown',
                    generated_at: new Date().toISOString(),
                  }
                } else if (toolBlock.name === 'generate_code' && result.code) {
                  finalResult = {
                    content: `\`\`\`${result.language}\n${result.code}\n\`\`\``,
                    format: 'markdown',
                    generated_at: new Date().toISOString(),
                  }
                }

                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: toolBlock.id,
                  content: JSON.stringify(result),
                })
              }

              // 대화에 assistant 응답 + tool 결과 추가
              messages.push({ role: 'assistant', content: assistantContent })
              messages.push({ role: 'user', content: toolResults })

            } else {
              // max_tokens 등 기타 종료
              continueLoop = false
            }
          }
          // ── 루프 종료 ────────────────────────────────────────────

          // fallback: 결과물이 없으면 마지막 thinking 내용으로 대체
          if (!finalResult) {
            const lastText = thinkingLog.filter((s) => s.phase === 'drafting').map((s) => s.content).join('\n')
            finalResult = { content: lastText || '작업이 완료되었습니다.', format: 'markdown', generated_at: new Date().toISOString() }
          }

          await admin.from('tasks').update({
            status: 'completed',
            result: finalResult,
            thinking_log: thinkingLog,
            token_usage: { input_tokens: totalInputTokens, output_tokens: totalOutputTokens },
            completed_at: new Date().toISOString(),
          }).eq('id', taskId)

          await admin.from('agents').update({
            status: 'completed',
            stats: { tasks_completed: (agent.stats?.tasks_completed ?? 0) + 1 },
          }).eq('id', agent.id)

          send('completed', { task_id: taskId, result: finalResult })

        } catch (err) {
          console.error('[stream]', err)
          await admin.from('tasks').update({ status: 'failed' }).eq('id', taskId)
          await admin.from('agents').update({ status: 'idle' }).eq('id', agent.id)
          send('error', { message: err.message })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (res) {
    return res
  }
}
