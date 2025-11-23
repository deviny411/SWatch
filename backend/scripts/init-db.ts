import { readFileSync } from 'fs'
import { join } from 'path'
import pool from '../src/db/index'

async function initDatabase() {
  try {
    console.log('🔧 Initializing database schema...')

    // Read schema file
    const schemaPath = join(__dirname, '../src/db/schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    // Execute schema
    await pool.query(schema)

    console.log('✅ Database schema initialized successfully!')
    console.log('📊 Created tables:')
    console.log('  - users')
    console.log('  - user_preferences')
    console.log('  - emergency_contacts')
    console.log('  - watchers')
    console.log('  - certifications')
    console.log('  - watcher_shifts')
    console.log('  - training_modules')
    console.log('  - calls')
    console.log('  - emergency_alerts')

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message)
    console.error('Details:', error)
    process.exit(1)
  }
}

initDatabase()
