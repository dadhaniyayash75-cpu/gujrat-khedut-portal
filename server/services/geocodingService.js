
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
