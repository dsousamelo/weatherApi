require('dotenv').config();

const express = require('express');
const axios = require('axios');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT;
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const REDIS_URL = process.env.REDIS_URL;
const CACHE_EXPIRATION = parseInt(process.env.CACHE_EXPIRATION || '60', 10);

// Redis connection
const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

(async () => {
    await redisClient.connect();
})();

// Route with cache
app.get('/weather', async (req, res) => {
    const location = req.query.location;

    if (!location) {
        return res.status(400).send('Query param ?location is required');
    }

    const cacheKey = `${location.toLowerCase()}`;

    try {
        // Check Redis
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            console.log('🔁 Cache hit');
            return res.json(JSON.parse(cached));
        }

        console.log('🌐 Fetching from API...');
        const response = await axios.get(`${API_URL}/${location}?key=${API_KEY}`);
        const apiResponse = response.data;

        // Save to Redis with expiration
        await redisClient.set(cacheKey, JSON.stringify(apiResponse), {
            EX: CACHE_EXPIRATION,
        });

        res.json(apiResponse);
    } catch (error) {
        const status = error.response?.status;
        switch (status) {
            case 400:
                return res.status(400).send('Invalid request: check your parameters.');
            case 401:
                return res.status(401).send('Unauthorized: check your API key or account status.');
            case 429:
                return res.status(429).send('Request limit exceeded: please try again later.');
            case 500:
                return res.status(500).send('Internal API server error. Please try again later.');
            default:
                return res.status(status || 500).send(`Error fetching weather: ${error.message}`);
        }
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
