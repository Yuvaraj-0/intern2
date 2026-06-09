import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL  // ← Uses URL from .env
});

redisClient.on('connect', () => console.log('✅ Redis Cloud connected'));
redisClient.on('error', (err) => console.error('❌ Redis Error:', err.message));

export default redisClient;

// import { createClient } from 'redis';

// const redisClient = createClient({
//     url: 'redis://default:iK2YshZE4Zwd3kY3sHr8zvvTo6Az2orO@doctor-fulgent-icicle-29053.db.redis.io:10312'
// });

// redisClient.on('connect', () => console.log('✅ Redis Cloud connected'));
// redisClient.on('error', (err) => console.error('❌ Redis Error:', err.message));

// export default redisClient;


// import { createClient } from 'redis';

// const redisClient = createClient({
//     username: 'default',
//     password: 'iK2YshZE4Zwd3kY3sHr8zvvTo6Az2orO',
//     socket: {
//         host: 'doctor-fulgent-icicle-29053.db.redis.io',
//         port: 10312,  // Hardcoded number
//     }
// });

// redisClient.on('connect', () => {
//     console.log('✅ Redis Cloud connected');
// });

// redisClient.on('error', (err) => {
//     console.error('❌ Redis Error:', err.message);
// });

// export default redisClient;import { createClient } from 'redis';
