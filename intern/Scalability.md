# Scalability Notes

## Current Architecture
- **Backend**: Express.js (stateless)
- **Database**: MongoDB Atlas (managed, auto-scaling)
- **Cache**: Redis Cloud (in-memory, <1ms latency)
- **Auth**: JWT tokens (stateless, no session storage)

## Scalability Strategies

### 1. Horizontal Scaling
- Stateless JWT allows multiple backend instances
- Add load balancer (NGINX/HAProxy) to distribute traffic
- Redis for token blacklist (shared across instances)

### 2. Database Scaling
- MongoDB Atlas: Read replicas for read-heavy workloads
- Sharding for horizontal data distribution
- Indexing on frequently queried fields (email, category)

### 3. Caching Strategy
- Redis cache for GET endpoints (5-10 min TTL)
- Cache invalidation on write operations
- Reduces database load by 70-80%

### 4. Future Improvements
| Component | Improvement | Benefit |
|-----------|-------------|---------|
| API | Rate limiting (express-rate-limit) | Prevent abuse |
| Database | Connection pooling | Reduce latency |
| Images | CDN (Cloudinary) | Faster asset delivery |
| Search | Elasticsearch | Full-text search |
| Queue | Bull/BullMQ | Async task processing |
| Logging | Winston + ELK stack | Centralized logging |
| Monitoring | Prometheus + Grafana | Performance metrics |

### 5. Microservices Split (Future)