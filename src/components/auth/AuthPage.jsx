import { useState } from 'react'
import { authService } from '../../services/authService'
import { motion, AnimatePresence } from 'framer-motion'

const INPUT_CLASS = 'w-full bg-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-brand-500'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setInfo('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    // 비밀번호 확인 검증
    if (mode === 'signup') {
      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다.')
        return
      }
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await authService.signIn(email, password)
      } else {
        const result = await authService.signUp(email, password, displayName)
        if (!result.session) {
          setInfo('가입 확인 이메일을 발송했습니다. 이메일을 확인 후 로그인하세요.')
          setLoading(false)
          return
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await authService.signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  const passwordsMatch = confirmPassword === '' || password === confirmPassword

  return (
    <div className="flex items-center justify-center h-screen bg-surface-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-80 space-y-6"
      >
        {/* 로고 */}
        <div className="text-center">
          <div className="text-brand-400 font-extrabold text-xl tracking-widest mb-1">
            CO-MIND WORKS
          </div>
          <div className="text-white/30 text-xs">
            도트 오피스에서 AI 팀을 운영하세요
          </div>
        </div>

        {/* 폼 */}
        <div className="panel rounded-2xl p-6 space-y-4">
          {/* 탭 */}
          <div className="flex gap-2">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 text-sm py-1.5 rounded-lg transition-colors ${
                mode === 'login' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 text-sm py-1.5 rounded-lg transition-colors ${
                mode === 'signup' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 안내 메시지 */}
          <AnimatePresence>
            {info && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-green-400 text-xs"
              >
                {info}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 회원가입 전용 필드 */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="text"
                    placeholder="이름"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className={INPUT_CLASS}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={INPUT_CLASS}
            />

            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={INPUT_CLASS}
            />

            {/* 비밀번호 확인 (회원가입 전용) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`${INPUT_CLASS} ${
                      !passwordsMatch ? 'ring-1 ring-red-500' : ''
                    }`}
                  />
                  {!passwordsMatch && (
                    <p className="text-red-400 text-xs px-1">비밀번호가 일치하지 않습니다.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 에러 메시지 */}
            {error && (
              <div className="text-red-400 text-xs">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && !passwordsMatch)}
              className="btn-primary w-full disabled:opacity-40"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-600" />
            </div>
            <div className="relative text-center">
              <span className="bg-surface-800 px-2 text-xs text-white/30">또는</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            className="w-full btn-ghost border border-surface-600 rounded-lg py-2 text-sm flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 계속하기
          </button>
        </div>

        <div className="text-center text-xs text-white/20">
          Co-Mind Works MVP · 베타
        </div>
      </motion.div>
    </div>
  )
}
