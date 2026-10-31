const express = require('express');
const User = require('../models/User');
const { geocodeVillage } = require('../services/geocodingService');
const router = express.Router();

const deg2rad = (deg) => deg * (Math.PI / 180);
const calculateHaversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
};

router.post('/search', async (req, res) => {
    try {
        const { service, village, district, radiusKm, latitude, longitude } = req.body;
        
        let searchCoords = null;
        if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
            searchCoords = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
        } else if (village) {
            searchCoords = await geocodeVillage(village, district);
        }

        if (!searchCoords) {
            return res.status(404).json({ 
                success: false, 
                message: 'તમારા ગામનું અથવા જીપીએસ લોકેશન મળ્યું નથી (Location could not be determined. Please verify village name or allow GPS).' 
            });
        }

        const effectiveRadiusKm = Number(radiusKm) || 30;
        const radiusMeters = effectiveRadiusKm * 1000;
        
        // MongoDB 2dsphere Geospatial Query
        const query = {
            role: 'serviceProvider',
            isBlocked: false,
            isOnline: true, // Only show providers currently on-duty
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [searchCoords.longitude, searchCoords.latitude]
                    },
                    $maxDistance: radiusMeters
                }
            }
        };

        // Service matching
        if (service && service !== 'All' && service !== 'બધી સેવાઓ') {
            query.services = { $regex: new RegExp(`^${service}$`, 'i') };
        }

        const providers = await User.find(query, '-passwordHash');

        // Calculate exact distance for each provider
        const results = providers.map(p => {
            const pObj = p.toObject();
            if (p.location && p.location.coordinates && p.location.coordinates.length === 2) {
                pObj.distanceKm = calculateHaversine(
                    searchCoords.latitude, searchCoords.longitude,
                    p.location.coordinates[1], p.location.coordinates[0]
                );
            } else {
                pObj.distanceKm = 0;
            }
            return pObj;
        });

        res.json({
            success: true,
            searchLocation: { 
                village: village || 'Current GPS Location', 
                latitude: searchCoords.latitude, 
                longitude: searchCoords.longitude 
            },
            radiusKm: effectiveRadiusKm,
            count: results.length,
            providers: results
        });
    } catch (err) {
        console.error('Service search error:', err);
        res.status(500).json({ success: false, message: 'Server error during service search' });
    }
});

module.exports = router;
