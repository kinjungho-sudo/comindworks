import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useMutation } from '@tanstack/react-query'
import { useTaskStore } from '../../stores/useTaskStore'
import { taskService } from '../../services/taskService'
import { supabase } from '../../lib/supabase'

export default function ResultViewer() {
  const { currentTask } = useTaskStore()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const { mutate: submitFeedback, isPending } = useMutation({
    mutationFn: async ({ rating, comment }) => {
      // 1. tasks 테이블에 피드백 저장
      await taskService.submitFeedback(currentTask.id, { rating, comment })

      // 2. 피드백을 에이전트 메모리에도 저장 (user_feedback 타입)
      if (comment.trim() && currentTask.agent_id) {
        const ratingLabel = ['', '매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'][rating] ?? ''
        const memoryContent = `작업 "${currentTask.title}"에 대한 사용자 피드백 (${ratingLabel}): ${comment.trim()}`

        await supabase.from('agent_memories').insert({
          agent_id: currentTask.agent_id,
          content: memoryContent,
          embedding: Array(1536).fill(0), // 서버 임베딩 생성 없이 placeholder
          memory_type: 'user_feedback',
          metadata: {
            task_id: currentTask.id,
            rating,
            saved_at: new Date().toISOString(),
          },
        })
      }
    },
    onSuccess: () => setFeedbackSubmitted(true),
  })

  if (!currentTask?.result) return null

  const resultContent = currentTask.result?.content ?? ''

  return (
    <div className="p-3 space-y-3">
      {/* 결과물 내용 */}
      <div className="text-sm text-white/80 prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{resultContent}</ReactMarkdown>
      </div>

      {/* 피드백 폼 */}
      {!feedbackSubmitted ? (
        <div className="border-t border-surface-700 pt-3 space-y-2">
          <div className="section-label">피드백</div>

          {/* 별점 */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-lg transition-colors ${star <= rating ? 'text-yellow-400' : 'text-white/20'}`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="개선 사항이나 의견을 남겨주세요..."
            rows={2}
            className="w-full bg-surface-700 rounded-lg px-2 py-1.5 text-xs text-white/80 placeholder-white/20 outline-none resize-none"
          />

          <button
            onClick={() => submitFeedback({ rating, comment })}
            disabled={rating === 0 || isPending}
            className="btn-primary text-xs h-8 disabled:opacity-30"
          >
            피드백 제출
          </button>
        </div>
      ) : (
        <div className="text-xs text-green-400 text-center py-2">
          ✅ 피드백 감사합니다! 에이전트 학습에 반영됩니다.
        </div>
      )}
    </div>
  )
}
