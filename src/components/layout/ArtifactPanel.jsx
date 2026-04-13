import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import Editor from '@monaco-editor/react'

// 포맷 감지
function detectFormat(result) {
  if (!result?.content) return 'text'
  const content = result.content
  // 코드 블록이 지배적이면 code
  const codeBlockCount = (content.match(/```/g) || []).length
  if (codeBlockCount >= 2) return 'code'
  return result.format === 'code' ? 'code' : 'doc'
}

// 코드 블록에서 언어 + 내용 추출
function extractCodeBlock(content) {
  const match = content.match(/```(\w*)\n?([\s\S]*?)```/)
  if (match) return { lang: match[1] || 'plaintext', code: match[2] }
  return { lang: 'plaintext', code: content }
}

function DocViewer({ content }) {
  return (
    <div className="p-6 prose prose-invert prose-sm max-w-none overflow-y-auto h-full">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

function CodeViewer({ content }) {
  const { lang, code } = extractCodeBlock(content)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-700 flex-shrink-0">
        <span className="text-xs text-white/40 font-mono">{lang}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={lang}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}

function FeedbackSection({ task, onFeedbackSubmit }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (submitted) {
    return (
      <div className="px-4 py-3 text-xs text-green-400 text-center border-t border-surface-700">
        ✅ 피드백 감사합니다! 에이전트 학습에 반영됩니다.
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-t border-surface-700 space-y-2 flex-shrink-0">
      <div className="text-xs text-white/40 font-bold uppercase tracking-wider">피드백</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-base transition-colors ${star <= rating ? 'text-yellow-400' : 'text-white/20'}`}
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
        className="w-full bg-surface-700 rounded-lg px-2.5 py-1.5 text-xs text-white/80 placeholder-white/20 outline-none resize-none"
      />
      <button
        onClick={async () => {
          if (rating === 0) return
          setLoading(true)
          await onFeedbackSubmit({ rating, comment })
          setLoading(false)
          setSubmitted(true)
        }}
        disabled={rating === 0 || loading}
        className="btn-primary text-xs h-7 px-3 disabled:opacity-30"
      >
        {loading ? '제출 중...' : '피드백 제출'}
      </button>
    </div>
  )
}

/**
 * ArtifactPanel — 태스크 결과물 표시 패널
 *
 * props:
 *   task           — 현재 보여줄 태스크 (result 포함)
 *   onClose        — 닫기 콜백
 *   onFeedback     — 피드백 제출 콜백 ({ rating, comment })
 */
export default function ArtifactPanel({ task, onClose, onFeedback }) {
  const [activeTab, setActiveTab] = useState('auto') // 'auto' | 'doc' | 'code'

  const content = task?.result?.content ?? ''
  const autoFormat = detectFormat(task?.result)
  const currentFormat = activeTab === 'auto' ? autoFormat : activeTab

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${task?.title ?? 'artifact'}.${currentFormat === 'code' ? 'txt' : 'md'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {task && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex flex-col bg-surface-800 border-l border-surface-700 overflow-hidden flex-shrink-0 h-full"
          style={{ minWidth: 0 }}
        >
          {/* 패널 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700 flex-shrink-0">
            <div className="min-w-0 flex-1 mr-2">
              <div className="text-xs text-white/40 font-bold uppercase tracking-wider mb-0.5">아티팩트</div>
              <div className="text-sm text-white/80 truncate">{task?.title}</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleDownload}
                className="text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-surface-700"
                title="다운로드"
              >
                ↓
              </button>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-surface-700"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 탭 */}
          <div className="flex gap-1 px-4 py-2 border-b border-surface-700 flex-shrink-0">
            {[
              { id: 'auto', label: '자동' },
              { id: 'doc', label: '문서' },
              { id: 'code', label: '코드' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-500/30 text-brand-400'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 overflow-hidden">
            {currentFormat === 'code'
              ? <CodeViewer content={content} />
              : <DocViewer content={content} />
            }
          </div>

          {/* 피드백 */}
          {onFeedback && (
            <FeedbackSection task={task} onFeedbackSubmit={onFeedback} />
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
