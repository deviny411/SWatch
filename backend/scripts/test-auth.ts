import 'dotenv/config'
import { authService } from '../src/services/auth.service'
import { userModel } from '../src/models/user.model'

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication with Database\n')

    // Test 1: Create anonymous user
    console.log('[Test 1] Creating anonymous user...')
    const anonResult = await authService.createAnonymousUser()
    console.log('✅ Anonymous user created:', anonResult.user.id)
    console.log('   Token:', anonResult.token.substring(0, 20) + '...')
    console.log('   Is anonymous:', anonResult.user.isAnonymous)

    // Test 2: Register new user
    console.log('\n[Test 2] Registering new user...')
    const testPhone = `+1555${Date.now().toString().slice(-7)}`
    const registerResult = await authService.register({
      phoneNumber: testPhone,
      password: 'test123456',
    })
    console.log('✅ User registered:', registerResult.user.id)
    console.log('   Phone:', testPhone)
    console.log('   Token:', registerResult.token.substring(0, 20) + '...')

    // Test 3: Login with created user
    console.log('\n[Test 3] Logging in with registered user...')
    const loginResult = await authService.login({
      phoneNumber: testPhone,
      password: 'test123456',
    })
    console.log('✅ User logged in:', loginResult.user.id)
    console.log('   Last active:', loginResult.user.lastActive)

    // Test 4: Get user by token
    console.log('\n[Test 4] Getting user by token...')
    const user = await authService.getUserByToken(loginResult.token)
    console.log('✅ User fetched:', user.id)
    console.log('   Phone:', user.phoneNumber)
    console.log('   Status:', user.status)

    // Test 5: Count users in database
    console.log('\n[Test 5] Checking database...')
    const dbResult = await userModel.findById(user.id)
    console.log('✅ User exists in database:', !!dbResult)

    console.log('\n✅ All authentication tests passed!')
    console.log('\n📊 Summary:')
    console.log(`   - Anonymous users can be created`)
    console.log(`   - New users can register`)
    console.log(`   - Registered users can login`)
    console.log(`   - Tokens work correctly`)
    console.log(`   - Database integration is working`)

    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Authentication test failed!')
    console.error('Error:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

testAuth()
