const { supabase } = require('../config/supabase');

/**
 * Script to create a demo admin user
 * Usage: node scripts/createAdminUser.js
 */

const DEMO_ADMIN_EMAIL = 'admin@demo.com';
const DEMO_ADMIN_PASSWORD = 'Admin123!@#';
const DEMO_ADMIN_NAME = 'Demo Admin';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email for testing
    });

    if (authError) {
      // Check if user already exists
      if (authError.message?.includes('already registered')) {
        console.log('User already exists in Supabase Auth. Fetching user...');
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === DEMO_ADMIN_EMAIL);
        if (!user) {
          throw new Error('User exists but could not be found');
        }
        authData.user = user;
      } else {
        throw authError;
      }
    }

    if (!authData?.user) {
      throw new Error('Failed to create or find user');
    }

    console.log('User created/found in Supabase Auth:', authData.user.id);

    // Create or update user document in database
    const userData = {
      id: authData.user.id,
      email: DEMO_ADMIN_EMAIL,
      first_name: 'Demo',
      last_name: 'Admin',
      display_name: DEMO_ADMIN_NAME,
      role: 'admin',
      account_status: 'active',
      email_verified: true,
      is_guest: false,
      updated_at: new Date().toISOString(),
      preferences: {
        language: 'en',
        currency: 'USD',
        notifications_enabled: true,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        newsletter: false,
        theme: 'light',
      },
    };

    // Check if user document exists
    const { data: existingUserData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (existingUserData) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update(userData)
        .eq('id', authData.user.id);

      if (updateError) {
        throw updateError;
      }
      console.log('User document updated in database');
    } else {
      // Create new user document
      userData.created_at = new Date().toISOString();
      const { error: insertError } = await supabase
        .from('users')
        .insert(userData);

      if (insertError) {
        throw insertError;
      }
      console.log('User document created in database');
    }

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email:', DEMO_ADMIN_EMAIL);
    console.log('   Password:', DEMO_ADMIN_PASSWORD);
    console.log('\n🔐 You can now use these credentials to login to the admin panel.');
    console.log('   URL: http://localhost:5173/login\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    if (error.message?.includes('relation "users" does not exist')) {
      console.error('\n⚠️  The "users" table does not exist in your Supabase database.');
      console.error('   Please create the table first. See the migration guide.\n');
    } else if (error.message?.includes('JWT')) {
      console.error('\n⚠️  Supabase credentials not configured properly.');
      console.error('   Make sure you have set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
      console.error('   See Backend/README.md for setup instructions.\n');
    }
    process.exit(1);
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
