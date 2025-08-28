# 🚀 Production Deployment Guide

This guide covers deploying the Shop Inventory Backend to production with Docker, monitoring, and security best practices.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Domain name and SSL certificates
- MongoDB instance (or use included Docker setup)
- SMTP server for email functionality
- Server with at least 2GB RAM and 20GB storage

## 🔧 Environment Setup

### 1. Environment Variables

Copy the production environment template:
```bash
cp env.production.template .env.production
```

Edit `.env.production` with your production values:
- Database credentials
- JWT secrets
- Email configuration
- Company information
- SSL certificate paths

### 2. SSL Certificates

Place your SSL certificates in the `nginx/ssl/` directory:
- `cert.pem` - Your SSL certificate
- `key.pem` - Your private key

## 🐳 Docker Deployment

### Quick Start

1. **Build and deploy:**
```bash
./deploy.sh production
```

2. **Manual deployment:**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Service Architecture

- **App**: NestJS backend (port 3000)
- **MongoDB**: Database (port 27017)
- **Nginx**: Reverse proxy with SSL (ports 80, 443)
- **Redis**: Caching (port 6379)

## 📊 Monitoring & Health Checks

### Health Endpoints

- **Basic Health**: `GET /health`
- **Detailed Health**: `GET /health/detailed`
- **Readiness Probe**: `GET /health/ready`
- **Liveness Probe**: `GET /health/live`
- **Metrics**: `GET /health/metrics`

### Monitoring Endpoints

- **System Metrics**: `GET /monitoring/system`
- **Application Metrics**: `GET /monitoring/application`
- **Comprehensive Report**: `GET /monitoring/report`
- **Metrics History**: `GET /monitoring/history`
- **Service Status**: `GET /monitoring/status`

### Health Check Integration

The application includes Docker health checks and Kubernetes-ready probes:

```yaml
# Kubernetes example
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## 🔒 Security Features

### Production Middleware

- **Helmet**: Security headers
- **Rate Limiting**: API protection
- **Compression**: Performance optimization
- **Request Logging**: Audit trail
- **CORS**: Cross-origin protection

### Security Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## 📈 Performance Optimization

### Nginx Configuration

- **Gzip compression** for all text-based responses
- **Rate limiting** for API endpoints
- **Static file serving** with caching
- **Load balancing** ready for horizontal scaling

### Application Optimization

- **Request/response logging** with performance metrics
- **Memory usage monitoring** with alerts
- **CPU load tracking** with trend analysis
- **Database connection monitoring**

## 🚨 Monitoring & Alerts

### Automatic Monitoring

The system automatically collects metrics every minute:
- CPU usage and load averages
- Memory consumption and trends
- Request counts and response times
- Error rates and types
- System uptime and health

### Alert Thresholds

- **Memory Usage**: Warning at 80%, Critical at 90%
- **CPU Load**: Warning at 80% of CPU cores
- **Error Rate**: Warning at 10+ errors, Critical at 50+
- **Response Time**: Warning at 1+ seconds average

### Logging

- **Structured logging** in JSON format
- **Request/response logging** with unique IDs
- **Performance metrics** logging
- **Error logging** with stack traces

## 🔄 Scaling & Maintenance

### Horizontal Scaling

To scale the application horizontally:

1. **Update docker-compose.prod.yml:**
```yaml
app:
  deploy:
    replicas: 3
    resources:
      limits:
        memory: 1G
        cpus: '0.5'
```

2. **Use external load balancer** or update Nginx configuration

### Database Scaling

- **MongoDB replica sets** for high availability
- **Connection pooling** optimization
- **Read replicas** for reporting queries

### Backup Strategy

- **Automated backups** with retention policies
- **Point-in-time recovery** capabilities
- **Cross-region replication** for disaster recovery

## 🛠️ Troubleshooting

### Common Issues

1. **Health Check Failures**
   - Check container logs: `docker-compose logs app`
   - Verify database connectivity
   - Check memory and CPU usage

2. **SSL Issues**
   - Verify certificate paths in Nginx
   - Check certificate validity
   - Ensure proper file permissions

3. **Performance Issues**
   - Monitor `/monitoring/metrics` endpoint
   - Check database query performance
   - Review rate limiting settings

### Debug Commands

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Health check
curl -f http://localhost/health

# System metrics
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost/monitoring/system
```

## 📚 Additional Resources

### Documentation

- [NestJS Production Guide](https://docs.nestjs.com/techniques/performance)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)

### Monitoring Tools

- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards
- **ELK Stack**: Log aggregation
- **New Relic**: APM and monitoring

## 🎯 Next Steps

1. **Set up monitoring dashboards** with Grafana
2. **Configure alerting** for critical metrics
3. **Implement backup automation** with cron jobs
4. **Set up CI/CD pipeline** for automated deployments
5. **Configure log aggregation** for centralized logging

---

**Need Help?** Check the logs, health endpoints, or create an issue in the repository.
