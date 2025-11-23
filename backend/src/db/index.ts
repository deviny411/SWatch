import 'dotenv/config'
import { Pool } from 'pg'

console.log('🔌 Initializing database module...')

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables!')
  console.error('   Server will start but database operations will fail')
  console.error('   Make sure to set DATABASE_URL in Railway')
} else {
  console.log('📊 Database connection:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'))
}

console.log('📦 Creating database pool...')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
console.log('✅ Database pool created')

pool.on('error', (err) => {
  console.error('💥 Unexpected database pool error:', err)
})

pool.on('connect', () => {
  console.log('✅ Database client connected')
})

console.log('✅ Database module initialization complete')

export const query = async (text: string, params?: any[]) => {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log('Executed query', { text, duration, rows: res.rowCount })
  return res
}

export const getClient = () => {
  return pool.connect()
}

export default pool
