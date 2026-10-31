import os
import re

# 1. Update models/User.js
user_model_path = 'server/models/User.js'
with open(user_model_path, 'r', encoding='utf-8') as f:
    user_model = f.read()

# Add district and location if they don't exist
if 'location:' not in user_model:
    location_schema = """
    district: { type: String },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
    },
"""
    user_model = user_model.replace("village: { type: String, required: true },", "village: { type: String, required: true }," + location_schema)
    # Add index before module.exports
    user_model = user_model.replace("module.exports", "userSchema.index({ location: '2dsphere' });\n\nmodule.exports")
    
    with open(user_model_path, 'w', encoding='utf-8') as f:
        f.write(user_model)


# 2. Create services/geocodingService.js
os.makedirs('server/services', exist_ok=True)
with open('server/services/geocodingService.js', 'w', encoding='utf-8') as f:
    f.write("""
const axios = require('axios');

async function geocodeVillage(village, district) {
    try {
        const query = `${village}, ${district ? district + ', ' : ''}Gujarat, India`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'GujaratKhedutPortal/1.0' }
        });

        if (response.data && response.data.length > 0) {
            return {
                latitude: parseFloat(response.data[0].lat),
                longitude: parseFloat(response.data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

module.exports = { geocodeVillage };
""")

# 3. Update authRoutes.js to use geocoding
auth_routes_path = 'server/routes/authRoutes.js'
with open(auth_routes_path, 'r', encoding='utf-8') as f:
    auth_routes = f.read()

if "const { geocodeVillage }" not in auth_routes:
    auth_routes = "const { geocodeVillage } = require('../services/geocodingService');\n" + auth_routes
    # Replace destructuring
    auth_routes = auth_routes.replace("const { fullName, mobile, password, role, village, services, vehicle, rate } = req.body;", "const { fullName, mobile, password, role, village, district, services, vehicle, rate } = req.body;")
    
    geocode_logic = """
        let location = { type: 'Point', coordinates: [0, 0] };
        if (village) {
            const coords = await geocodeVillage(village, district);
            if (coords) {
                location.coordinates = [coords.longitude, coords.latitude];
            }
        }
        
        user = new User({ fullName, mobile, passwordHash, role, village, district, services, vehicle, rate, location });
"""
    auth_routes = re.sub(r'user = new User\(\{.*\}\);', geocode_logic, auth_routes)
    
    with open(auth_routes_path, 'w', encoding='utf-8') as f:
        f.write(auth_routes)


# 4. Create serviceRoutes.js with $geoNear
with open('server/routes/serviceRoutes.js', 'w', encoding='utf-8') as f:
    f.write("""
const express = require('express');
const User = require('../models/User');
const { geocodeVillage } = require('../services/geocodingService');
const router = express.Router();

router.post('/search', async (req, res) => {
    try {
        const { service, village, district, radiusKm } = req.body;
        
        // 1. Geocode taker's village
        const coords = await geocodeVillage(village, district);
        if (!coords) {
            return res.status(404).json({ success: false, message: 'Village location could not be found.' });
        }

        const radiusMeters = (radiusKm || 30) * 1000;
        
        // 2. Geospatial Search
        const query = {
            role: 'serviceProvider',
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [coords.longitude, coords.latitude]
                    },
                    $maxDistance: radiusMeters
                }
            }
        };

        // Case-insensitive service matching
        if (service && service !== 'All') {
            query.services = { $regex: new RegExp(`^${service}$`, 'i') };
        }

        const providers = await User.find(query, '-passwordHash');

        // Note: $near automatically sorts by distance, but doesn't return the exact distance value in the document.
        // To calculate distance for the response, we can use a simple Haversine formula on the results,
        // or we could use aggregation with $geoNear. For simplicity and since we have coords, we'll calculate here:
        
        const deg2rad = (deg) => deg * (Math.PI/180);
        const getDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // km
            const dLat = deg2rad(lat2-lat1);
            const dLon = deg2rad(lon2-lon1);
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        };

        const results = providers.map(p => {
            const pObj = p.toObject();
            if (p.location && p.location.coordinates.length === 2) {
                pObj.distanceKm = getDistance(
                    coords.latitude, coords.longitude,
                    p.location.coordinates[1], p.location.coordinates[0]
                );
            }
            return pObj;
        });

        res.json({
            success: true,
            searchLocation: { village, latitude: coords.latitude, longitude: coords.longitude },
            radiusKm,
            count: results.length,
            providers: results
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
""")

print("Backend updated with geocoding and 2dsphere search.")
