const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('====================================================');
    console.log('🧪 RUNNING GUJARAT KHEDUT PORTAL BACKEND TEST SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    const assert = (condition, title) => {
        if (condition) {
            console.log(`✅ PASS: ${title}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${title}`);
            failed++;
        }
    };

    try {
        // 1. Dynamic Live Mandi Bhav Test
        console.log('\n--- 1. Dynamic Live Mandi Bhav ---');
        const mandiRes = await axios.get(`${BASE_URL}/mandi/live`);
        assert(mandiRes.data.success === true, 'Mandi API returns success: true');
        assert(mandiRes.data.rates.length > 5, `Fetched ${mandiRes.data.rates.length} dynamic Gujarat Mandi rates`);
        assert(mandiRes.data.marketDateGujarati.length > 0, `Live Gujarati Date present: ${mandiRes.data.marketDateGujarati}`);

        // 2. Admin Login with password "yash"
        console.log('\n--- 2. Admin Authentication with "yash" ---');
        const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
            mobile: '9999999999',
            password: 'yash',
            selectedRole: 'admin'
        });
        assert(adminLoginRes.data.success === true, 'Admin login with password "yash" succeeds');
        const adminToken = adminLoginRes.data.token;
        assert(adminLoginRes.data.user.role === 'admin', 'Admin user role is verified as "admin"');

        // 3. Admin Registration Passcode Validation
        console.log('\n--- 3. Admin Registration Passcode Validation ---');
        try {
            await axios.post(`${BASE_URL}/auth/register`, {
                fullName: 'Fake Hacker',
                mobile: '8888888801',
                password: 'wrong_password_123',
                role: 'admin'
            });
            assert(false, 'Unauthorized admin registration should fail');
        } catch (err) {
            assert(err.response?.status === 403, 'Unauthorized admin registration correctly rejected with 403 Forbidden');
        }

        const validAdminReg = await axios.post(`${BASE_URL}/auth/register`, {
            fullName: 'Company Member',
            mobile: '8888888802',
            password: 'yash',
            role: 'admin',
            village: 'Manavadar'
        });
        assert(validAdminReg.data.success === true && validAdminReg.data.user.role === 'admin', 'Admin registration with password "yash" succeeds');

        // 4. Farmer & Provider Registration
        console.log('\n--- 4. Farmer & Provider Registration ---');
        const testFarmerMobile = '9800000001';
        const testProviderMobile = '9800000002';

        let farmerRes;
        try {
            farmerRes = await axios.post(`${BASE_URL}/auth/register`, {
                fullName: 'Ramesh Patel (Farmer)',
                mobile: testFarmerMobile,
                password: 'password123',
                role: 'serviceReceiver',
                village: 'Manavadar',
                district: 'Junagadh'
            });
        } catch (e) {
            farmerRes = await axios.post(`${BASE_URL}/auth/login`, {
                mobile: testFarmerMobile,
                password: 'password123'
            });
        }
        const farmerToken = farmerRes.data.token;
        assert(farmerToken !== undefined, 'Farmer account authenticated successfully');

        let providerRes;
        try {
            providerRes = await axios.post(`${BASE_URL}/auth/register`, {
                fullName: 'Kishan Ahir (Tractor Provider)',
                mobile: testProviderMobile,
                password: 'password123',
                role: 'serviceProvider',
                village: 'Bantwa',
                district: 'Junagadh',
                services: ['Tractor', 'Rotavator'],
                vehicle: 'Mahindra 575 DI',
                rate: '500/hr'
            });
        } catch (e) {
            providerRes = await axios.post(`${BASE_URL}/auth/login`, {
                mobile: testProviderMobile,
                password: 'password123'
            });
        }
        const providerToken = providerRes.data.token;
        const providerId = providerRes.data.user.id;
        assert(providerToken !== undefined, 'Service provider authenticated successfully');

        // 5. Database Privacy & RBAC Test
        console.log('\n--- 5. Database Privacy & Role Protection ---');
        try {
            await axios.get(`${BASE_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${farmerToken}` }
            });
            assert(false, 'Farmer should NOT be able to access /api/admin/users');
        } catch (err) {
            assert(err.response?.status === 403, 'Normal user blocked from database viewer API with 403 Forbidden');
        }

        const adminUsersRes = await axios.get(`${BASE_URL}/admin/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert(adminUsersRes.data.success === true, 'Admin can view all database users');
        assert(adminUsersRes.data.data.length > 0, `Database viewer loaded ${adminUsersRes.data.data.length} registered users`);

        const adminStatsRes = await axios.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert(adminStatsRes.data.success === true, 'Admin stats loaded successfully');

        // 6. Provider Online/Offline Toggle
        console.log('\n--- 6. Provider Availability Toggle ---');
        const toggleRes = await axios.put(`${BASE_URL}/auth/toggle-online`, {}, {
            headers: { Authorization: `Bearer ${providerToken}` }
        });
        assert(toggleRes.data.success === true, `Provider toggle responded: ${toggleRes.data.message}`);
        // Toggle back to true
        if (!toggleRes.data.isOnline) {
            await axios.put(`${BASE_URL}/auth/toggle-online`, {}, {
                headers: { Authorization: `Bearer ${providerToken}` }
            });
        }

        // 7. Geospatial Nearby Search
        console.log('\n--- 7. Geospatial Provider Search ---');
        const searchRes = await axios.post(`${BASE_URL}/services/search`, {
            service: 'Tractor',
            village: 'Manavadar',
            district: 'Junagadh',
            radiusKm: 30
        });
        assert(searchRes.data.success === true, 'Geospatial search succeeded');
        assert(searchRes.data.providers.length >= 0, `Found ${searchRes.data.providers.length} matching nearby providers`);

        // 8. Uber/Rapido Booking Workflow
        console.log('\n--- 8. Uber/Rapido Booking Lifecycle ---');
        const newBookingRes = await axios.post(`${BASE_URL}/bookings`, {
            providerId,
            service: 'Tractor',
            date: '2026-11-05',
            time: '08:00 AM',
            message: 'Need plowing for 10 vighas of groundnut field',
            distanceKm: 12,
            estimatedPrice: '₹500/hr'
        }, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        assert(newBookingRes.data.success === true, 'Booking created with status PENDING');
        const booking = newBookingRes.data.data;
        assert(booking.status === 'pending', 'Initial booking status is pending');

        // Provider Accepts Booking
        const acceptRes = await axios.put(`${BASE_URL}/bookings/${booking._id}/status`, {
            status: 'accepted'
        }, {
            headers: { Authorization: `Bearer ${providerToken}` }
        });
        assert(acceptRes.data.data.status === 'accepted', 'Booking accepted by provider');

        // Provider Status Progression: on_the_way -> arrived -> service_started -> completed
        await axios.put(`${BASE_URL}/bookings/${booking._id}/status`, { status: 'on_the_way' }, { headers: { Authorization: `Bearer ${providerToken}` } });
        await axios.put(`${BASE_URL}/bookings/${booking._id}/status`, { status: 'arrived' }, { headers: { Authorization: `Bearer ${providerToken}` } });
        await axios.put(`${BASE_URL}/bookings/${booking._id}/status`, { status: 'service_started' }, { headers: { Authorization: `Bearer ${providerToken}` } });
        const completedRes = await axios.put(`${BASE_URL}/bookings/${booking._id}/status`, { 
            status: 'completed',
            finalPrice: '₹2,500'
        }, { headers: { Authorization: `Bearer ${providerToken}` } });
        assert(completedRes.data.data.status === 'completed', 'Booking marked as COMPLETED');

        // 9. Ratings and Reviews
        console.log('\n--- 9. Rating & Review System ---');
        const reviewRes = await axios.post(`${BASE_URL}/reviews`, {
            bookingId: booking._id,
            rating: 5,
            comment: 'ઉત્તમ કામગીરી! સમયસર ટ્રેક્ટર લઈને આવ્યા અને સરસ ખેતીકામ કર્યું.'
        }, {
            headers: { Authorization: `Bearer ${farmerToken}` }
        });
        assert(reviewRes.data.success === true, '5-Star rating submitted successfully');

        // Verify duplicate review prevented
        try {
            await axios.post(`${BASE_URL}/reviews`, {
                bookingId: booking._id,
                rating: 4,
                comment: 'Duplicate test'
            }, {
                headers: { Authorization: `Bearer ${farmerToken}` }
            });
            assert(false, 'Duplicate review should be prevented');
        } catch (e) {
            assert(e.response?.status === 400, 'Duplicate review correctly rejected with 400 Bad Request');
        }

        // 10. SMS Audit Logs
        console.log('\n--- 10. SMS Audit Logs ---');
        const smsLogsRes = await axios.get(`${BASE_URL}/admin/sms-logs`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        assert(smsLogsRes.data.success === true, 'Admin fetched SMS audit logs');
        assert(smsLogsRes.data.data.length > 0, `Audit recorded ${smsLogsRes.data.data.length} SMS notification events`);

    } catch (error) {
        console.error('Fatal test error:', error.response?.data || error.message);
        failed++;
    }

    console.log('\n====================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
