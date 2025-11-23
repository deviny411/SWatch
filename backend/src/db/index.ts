import 'dotenv/config'
import { Pool } from 'pg'

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables!')
  console.error('   Make sure backend/.env file exists with DATABASE_URL')
  process.exit(1)
}

console.log('📊 Database connection:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected database error:', err)
})

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
