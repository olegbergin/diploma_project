// Simple test script to verify dashboard API endpoints
// Run with: node test-dashboard-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3030';

async function testAPIs() {
  console.log('🧪 Testing Dashboard API Endpoints...\n');

  try {
    // Test 1: Get business dashboard data
    console.log('1️⃣ Testing Business Dashboard API...');
    try {
      const businessResponse = await axios.get(`${BASE_URL}/api/businesses/1/dashboard`);
      console.log('✅ Business Dashboard API working');
      console.log(`   - Business: ${businessResponse.data.business?.name || 'N/A'}`);
      console.log(`   - Total Appointments: ${businessResponse.data.analytics?.total_appointments || 0}`);
      console.log(`   - Monthly Revenue: ₪${businessResponse.data.analytics?.monthly_revenue || 0}`);
    } catch (error) {
      console.log('❌ Business Dashboard API failed:', error.response?.status || error.message);
    }

    console.log('');

    // Test 2: Get user dashboard data  
    console.log('2️⃣ Testing User Dashboard API...');
    try {
      const userResponse = await axios.get(`${BASE_URL}/api/users/1/dashboard`);
      console.log('✅ User Dashboard API working');
      console.log(`   - User: ${userResponse.data.user?.first_name || 'N/A'} ${userResponse.data.user?.last_name || ''}`);
      console.log(`   - Total Bookings: ${userResponse.data.totalBookings || 0}`);
      console.log(`   - Upcoming Bookings: ${userResponse.data.upcomingBookings || 0}`);
      console.log(`   - Favorite Businesses: ${userResponse.data.favoriteBusinesses || 0}`);
    } catch (error) {
      console.log('❌ User Dashboard API failed:', error.response?.status || error.message);
    }

    console.log('');

    // Test 3: Get appointments
    console.log('3️⃣ Testing Appointments API...');
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const appointmentsResponse = await axios.get(`${BASE_URL}/api/appointments`, {
        params: { businessId: 1, month: currentMonth }
      });
      console.log('✅ Appointments API working');
      console.log(`   - Appointments found: ${appointmentsResponse.data.length}`);
    } catch (error) {
      console.log('❌ Appointments API failed:', error.response?.status || error.message);
    }

    console.log('');

    // Test 4: Get user appointments
    console.log('4️⃣ Testing User Appointments API...');
    try {
      const userAppointmentsResponse = await axios.get(`${BASE_URL}/api/appointments/user/1?type=upcoming`);
      console.log('✅ User Appointments API working');
      console.log(`   - Upcoming appointments: ${userAppointmentsResponse.data.length}`);
    } catch (error) {
      console.log('❌ User Appointments API failed:', error.response?.status || error.message);
    }

    console.log('');

    // Test 5: Get user favorites
    console.log('5️⃣ Testing User Favorites API...');
    try {
      const favoritesResponse = await axios.get(`${BASE_URL}/api/users/1/favorites`);
      console.log('✅ User Favorites API working');
      console.log(`   - Favorite businesses: ${favoritesResponse.data.length}`);
    } catch (error) {
      console.log('❌ User Favorites API failed:', error.response?.status || error.message);
    }

  } catch (error) {
    console.log('❌ General test error:', error.message);
  }

  console.log('\n🏁 API Testing Complete!');
  console.log('\n💡 Note: Some tests may fail if the database is empty or if the backend server is not running.');
  console.log('   Make sure the backend server is running on port 3030 and the database has some test data.');
}

testAPIs();