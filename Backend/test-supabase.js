require('dotenv').config();
const { supabase } = require('./config/supabase');

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  console.log('  SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
  console.log('');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing required environment variables!');
    console.log('   Make sure Backend/.env file exists with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (healthError && healthError.code === 'PGRST116') {
      console.log('  ⚠️  Connection works, but "users" table might not exist yet');
      console.log('  This is OK if you haven\'t created the tables yet');
    } else if (healthError) {
      console.log('  ❌ Connection Error:', healthError.message);
      console.log('  Error Code:', healthError.code);
    } else {
      console.log('  ✅ Connection successful!');
    }
    
    // Test 2: Check if tables exist
    console.log('\nTest 2: Checking database tables...');
    const tables = ['users', 'products', 'orders'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (error && error.code === 'PGRST116') {
        console.log(`  ⚠️  Table "${table}" does not exist`);
      } else if (error) {
        console.log(`  ❌ Error checking "${table}":`, error.message);
      } else {
        console.log(`  ✅ Table "${table}" exists`);
      }
    }
    
    // Test 3: Test authentication
    console.log('\nTest 3: Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.log('  ⚠️  Auth test:', authError.message);
    } else {
      console.log(`  ✅ Authentication works! Found ${authData.users.length} users`);
      if (authData.users.length > 0) {
        console.log('  Users:');
        authData.users.forEach(user => {
          console.log(`    - ${user.email} (${user.id})`);
        });
      }
    }
    
    // Test 4: Check if admin user exists in users table
    console.log('\nTest 4: Checking for admin users in database...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');
    
    if (adminError && adminError.code === 'PGRST116') {
      console.log('  ⚠️  Users table does not exist yet');
    } else if (adminError) {
      console.log('  ❌ Error:', adminError.message);
    } else if (adminUsers && adminUsers.length > 0) {
      console.log(`  ✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(user => {
        console.log(`    - ${user.email} (${user.display_name || user.first_name || 'N/A'})`);
      });
    } else {
      console.log('  ⚠️  No admin users found in database');
      console.log('  Run: node scripts/createAdminUser.js to create one');
    }
    
    console.log('\n✅ Supabase setup test completed!');
    console.log('\nNext steps:');
    console.log('  1. If tables are missing, run the SQL scripts from SUPABASE_MIGRATION.md');
    console.log('  2. Create an admin user using: node scripts/createAdminUser.js');
    console.log('  3. Restart your backend server');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Full error:', error);
  }
}

testSupabase();

