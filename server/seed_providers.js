const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const DB_URI = 'mongodb://127.0.0.1:27017/gujarat_khedut_portal';

const seedData = [
    {
        fullName: 'Test Tractor Provider',
        mobile: '9876543210',
        password: 'password123',
        role: 'serviceProvider',
        village: 'Manavadar',
        district: 'Junagadh',
        services: ['Tractor'],
        vehicle: 'Mahindra 575 DI',
        rate: '500/hr',
        location: {
            type: 'Point',
            coordinates: [70.1333, 21.5000] // Longitude, Latitude for Manavadar
        }
    },
    {
        fullName: 'Test Harvester Provider',
        mobile: '9876543211',
        password: 'password123',
        role: 'serviceProvider',
        village: 'Keshod', // ~30-40km away from Manavadar
        district: 'Junagadh',
        services: ['Harvester', 'Tractor'],
        vehicle: 'John Deere',
        rate: '1500/hr',
        location: {
            type: 'Point',
            coordinates: [70.2500, 21.3000] // Longitude, Latitude for Keshod
        }
    },
    {
        fullName: 'Faraway Provider',
        mobile: '9876543212',
        password: 'password123',
        role: 'serviceProvider',
        village: 'Rajkot', // ~100+ km away
        district: 'Rajkot',
        services: ['Tractor'],
        vehicle: 'Swaraj 744',
        rate: '600/hr',
        location: {
            type: 'Point',
            coordinates: [70.8022, 22.3039] // Longitude, Latitude for Rajkot
        }
    },
    {
        fullName: 'Nearby Equipment',
        mobile: '9876543213',
        password: 'password123',
        role: 'serviceProvider',
        village: 'Bantwa', // ~10-15km away from Manavadar
        district: 'Junagadh',
        services: ['Rotavator', 'Cultivator'],
        vehicle: 'Various',
        rate: '300/hr',
        location: {
            type: 'Point',
            coordinates: [70.0833, 21.4833] // Longitude, Latitude for Bantwa
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(DB_URI);
        console.log('MongoDB connected...');

        // Clear existing providers for a clean test state? Or just append. We'll append.
        const salt = await bcrypt.genSalt(10);

        for (const data of seedData) {
            const existing = await User.findOne({ mobile: data.mobile });
            if (!existing) {
                const passwordHash = await bcrypt.hash(data.password, salt);
                const user = new User({ ...data, passwordHash });
                await user.save();
                console.log(`Saved ${data.fullName}`);
            } else {
                console.log(`Skipped ${data.fullName} (already exists)`);
            }
        }
        console.log('Seeding completed!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
