import pool from '../src/db/index'

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('📝 Connection string:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))

    // Test 1: Basic connection
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version')
    console.log('✅ Database connection successful!')
    console.log('⏰ Server time:', result.rows[0].current_time)
    console.log('🗄️  PostgreSQL version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1])

    // Test 2: Check tables exist
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    if (tablesResult.rows.length > 0) {
      console.log('\n📊 Found tables:')
      tablesResult.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.table_name}`)
      })
    } else {
      console.log('\n⚠️  No tables found. Run "npm run init-db" to create schema.')
    }

    // Test 3: Count users
    try {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users')
      console.log(`\n👥 Users in database: ${usersResult.rows[0].count}`)
    } catch (err) {
      console.log('\n⚠️  Users table not found. Run "npm run init-db" to create schema.')
    }

    console.log('\n✅ All database tests passed!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Database test failed!')
    console.error('Error:', error.message)

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Make sure PostgreSQL is running:')
      console.error('   docker-compose up -d')
    } else if (error.code === '28P01') {
      console.error('\n💡 Tip: Authentication failed. Check your .env file:')
      console.error('   DATABASE_URL should match docker-compose.yml credentials')
    }

    process.exit(1)
  }
}

testDatabase()
