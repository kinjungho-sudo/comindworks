/**
 * 에이전트 상태에 따른 색상 반환
 */
export function getStatusColor(status) {
  const colors = {
    idle: '#6B7280',      // gray
    working: '#3B82F6',   // blue
    thinking: '#A78BFA',  // purple
    completed: '#10B981', // green
    failed: '#EF4444',    // red
  }
  return colors[status] ?? colors.idle
}

/**
 * 에이전트 상태 한국어 라벨
 */
export function getStatusLabel(status) {
  const labels = {
    idle: '대기 중',
    working: '작업 중',
    thinking: '사고 중',
    completed: '완료',
    failed: '실패',
  }
  return labels[status] ?? '알 수 없음'
}

/**
 * 능력 카드 카테고리 색상
 */
export function getCategoryColor(category) {
  const colors = {
    writing: '#3B82F6',
    analysis: '#A78BFA',
    coding: '#10B981',
    design: '#F59E0B',
    communication: '#EC4899',
  }
  return colors[category] ?? '#6B7280'
}

/**
 * 능력 카드 카테고리 한국어 라벨
 */
export function getCategoryLabel(category) {
  const labels = {
    writing: '작문',
    analysis: '분석',
    coding: '코딩',
    design: '디자인',
    communication: '소통',
  }
  return labels[category] ?? category
}

/**
 * 구독 등급 라벨
 */
export function getTierLabel(tier) {
  const labels = {
    free: '무료',
    basic: '베이직',
    pro: '프로',
  }
  return labels[tier] ?? tier
}

/**
 * 날짜 포맷 (상대 시간)
 */
export function formatRelativeTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  return date.toLocaleDateString('ko-KR')
}

/**
 * 토큰 수 포맷
 */
export function formatTokens(count) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

/**
 * 클래스 이름 조합 (tailwind merge 없이 간단 버전)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
