# Weather API with Cache (Redis)

This project implements a simple API to query weather data for a specific location, using Redis cache to optimize performance and reduce the number of requests to the external API.

## Installation

To set up and run this project locally, follow the steps below:

1. Clone the repository:
   ```bash
   git clone <REPOSITORY_URL>
   cd weather-api-cache
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

**Dependencies:**
- `express`: Web framework for Node.js.
- `axios`: Promise-based HTTP client for making requests to external APIs.
- `redis`: Node.js client for Redis, used for caching.
- `dotenv`: Loads environment variables from a `.env` file.

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
PORT=3000
API_URL=https://api.example.com/weather
API_KEY=your_api_key
REDIS_URL=redis://localhost:6379
CACHE_EXPIRATION=60
```

- `PORT`: Port on which the Express server will run (default: 3000).
- `API_URL`: Base URL of the external weather API.
- `API_KEY`: Your API key to access the external weather API. Get the apikey in your personal account, on the https://www.visualcrossing.com/weather-api/ website.
- `REDIS_URL`: Connection URL for the Redis server (default: `redis://localhost:6379`).
- `CACHE_EXPIRATION`: Cache expiration time in seconds (default: 60 seconds).

## API Usage

The API exposes a single endpoint for weather queries:

### `GET /weather`

Returns weather data for a specific location.

**Query Parameters:**
- `location` (required): The name of the city or location for which you want to get weather data.

**Example Request:**

```bash
curl http://localhost:3000/weather?location=London
```

**Example Response (success):**

```json
{
  "city": "London",
  "temperature": "15°C",
  "condition": "Partly Cloudy"
  // ... other data from the external API
}
```

## Error Handling

The API handles various HTTP status codes to indicate the result of requests:

- `400 Bad Request`: Missing `location` parameter or invalid request.
- `401 Unauthorized`: Invalid API key or authentication issues with the external API.
- `429 Too Many Requests`: Request limit exceeded for the external API.
- `500 Internal Server Error`: Internal server error on the external API or other unexpected error.

## Cache with Redis

This API uses Redis to cache responses from the external weather API. This helps to:

- Reduce latency for subsequent requests for the same location.
- Decrease the load on the external weather API, avoiding exceeding request limits.

When a request is made for a location, the API first checks if the data is available in the Redis cache. If it is, the response is returned immediately from the cache (`Cache hit`). Otherwise, the request is made to the external API, and the response is then stored in Redis for future requests (`Fetching from API...`). The cache expiration time is configurable via the `CACHE_EXPIRATION` environment variable.


