/**
 * Supabase 마이그레이션 실행기
 * 사용법: node scripts/migrate.mjs <DB_PASSWORD>
 *
 * DB Password: Supabase 대시보드 → Project Settings → Database → Database password
 */

import { readFileSync } from 'fs'
import { createInterface } from 'readline'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

const { Client } = pg
const __dir = dirname(fileURLToPath(import.meta.url))

// .env.local 파싱
function loadEnv(filePath) {
  const env = {}
  try {
    const lines = readFileSync(filePath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      env[key] = val
    }
  } catch {}
  return env
}

const envPath = join(__dir, '..', '.env.local')
const env = loadEnv(envPath)

const supabaseUrl = env.VITE_SUPABASE_URL || ''
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

// SUPABASE_DB_PASSWORD 값이 connection string 전체인지 패스워드만인지 판별
const dbValue = env.SUPABASE_DB_PASSWORD || process.argv[2] || ''

if (!dbValue) {
  console.error(`
❌ DB 접속 정보가 필요합니다.
.env.local 에 SUPABASE_DB_PASSWORD=<connection string> 을 추가하세요.

Supabase 대시보드 → 상단 [Connect] 버튼 → Connection string(URI) 복사
`)
  process.exit(1)
}

// connection string 전체 or 패스워드만 판별
let connectionString
if (dbValue.startsWith('postgresql://') || dbValue.startsWith('postgres://')) {
  connectionString = dbValue
} else if (dbValue.startsWith('@')) {
  // '@host:port/db' 형태로 잘려서 들어온 경우 → 앞에 prefix 붙이기
  connectionString = `postgresql://postgres${dbValue}`
} else {
  // 패스워드만 넣은 경우
  connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbValue)}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`
}

// 마이그레이션 파일 목록 (순서 중요)
const migrationFiles = [
  '001_create_users.sql',
  '002_create_offices.sql',
  '003_create_agents.sql',
  '004_create_ability_cards.sql',
  '005_create_tasks.sql',
  '006_create_agent_memories.sql',
  '007_create_rls_policies.sql',
  '008_agent_portraits.sql',
  '009_messages.sql',
  '010_agent_skill_docs.sql',
]

// connection string에서 패스워드 추출
function extractPassword(connStr) {
  try {
    const url = new URL(connStr)
    return decodeURIComponent(url.password)
  } catch { return dbValue }
}

async function tryConnect(connStr, label) {
  const c = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 })
  try {
    await c.connect()
    console.log(`✅ ${label} 연결 성공\n`)
    return c
  } catch (err) {
    console.log(`⚠️  ${label} 실패: ${err.message}`)
    try { await c.end() } catch {}
    return null
  }
}

async function run() {
  console.log(`\n🔗 Supabase 연결 시도 중... (project: ${projectRef})\n`)

  const pw = extractPassword(connectionString)

  // 시도할 연결 목록 (우선순위 순)
  const attempts = [
    { url: connectionString, label: '입력된 connection string' },
    // Pooler — 여러 리전
    { url: `postgresql://postgres.${projectRef}:${encodeURIComponent(pw)}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`, label: 'Pooler ap-northeast-2' },
    { url: `postgresql://postgres.${projectRef}:${encodeURIComponent(pw)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`, label: 'Pooler us-east-1' },
    { url: `postgresql://postgres.${projectRef}:${encodeURIComponent(pw)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`, label: 'Pooler eu-west-1' },
    { url: `postgresql://postgres.${projectRef}:${encodeURIComponent(pw)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`, label: 'Pooler ap-southeast-1' },
    // Direct
    { url: `postgresql://postgres:${encodeURIComponent(pw)}@db.${projectRef}.supabase.co:5432/postgres`, label: 'Direct' },
  ]

  for (const { url, label } of attempts) {
    const client = await tryConnect(url, label)
    if (client) {
      await runMigrations(client)
      await client.end()
      return
    }
  }

  console.error('\n❌ 모든 연결 시도 실패.')
  console.error('Supabase 대시보드 → Connect → Connection string(URI) 전체를 .env.local의 SUPABASE_DB_PASSWORD에 붙여넣으세요.')
  process.exit(1)
}

async function runMigrations(client) {
  const migrationsDir = join(__dir, '..', 'supabase', 'migrations')

  for (const file of migrationFiles) {
    const filePath = join(migrationsDir, file)
    let sql
    try {
      sql = readFileSync(filePath, 'utf-8')
    } catch {
      console.log(`⏭  ${file} — 파일 없음, 건너뜀`)
      continue
    }

    process.stdout.write(`📄 ${file} ... `)
    try {
      await client.query(sql)
      console.log('✅ 완료')
    } catch (err) {
      // 이미 존재하는 경우는 OK
      if (err.code === '42P07' || err.message.includes('already exists')) {
        console.log('⏭  이미 존재')
      } else {
        console.log(`❌ 실패: ${err.message}`)
      }
    }
  }

  console.log('\n🎉 마이그레이션 완료!\n')

  // 생성된 테이블 목록 출력
  const { rows } = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `)
  console.log('📋 public 스키마 테이블 목록:')
  rows.forEach((r) => console.log(`   - ${r.tablename}`))
  console.log()
}

run().catch((err) => {
  console.error('❌ 오류:', err.message)
  process.exit(1)
})
