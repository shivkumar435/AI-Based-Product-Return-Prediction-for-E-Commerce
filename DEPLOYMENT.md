# 🚀 Production Deployment Guide

## ReturnSense - Deployment & DevOps Guide

**Version**: 1.0.0  
**Date**: September 2026  
**Audience**: DevOps Engineers, System Administrators

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review completed
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks acceptable
- [ ] Documentation complete
- [ ] All environment variables configured
- [ ] .env files not in git
- [ ] Database migrations tested

### Infrastructure
- [ ] MongoDB Atlas cluster configured
- [ ] Firewall rules set up
- [ ] SSL certificates ready
- [ ] CDN configured
- [ ] Email service setup
- [ ] Backup strategy defined
- [ ] Monitoring tools installed
- [ ] Load balancer configured

### Security
- [ ] JWT secrets rotated
- [ ] Database passwords strong
- [ ] Redis/cache secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Secrets management set up
- [ ] Security audit passed

### Testing
- [ ] Smoke tests passed
- [ ] Load testing completed
- [ ] Security testing done
- [ ] Compatibility testing done
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility confirmed
- [ ] Backup/restore tested
- [ ] Disaster recovery plan ready

---

## 🌐 Deployment Options

### Option 1: Heroku (Easiest for Teams)

#### Prerequisites
```bash
heroku login
heroku create app-name
git init
git add .
git commit -m "Initial commit"
```

#### Procfile (Create in root)
```
web: cd server && npm install && npm start
worker: cd ml-model && python app.py
```

#### Deploy
```bash
git push heroku main
heroku open
heroku logs --tail
```

#### Environment Variables
```bash
heroku config:set MONGODB_URI=connection_string
heroku config:set JWT_SECRET=secret_key
heroku config:set NODE_ENV=production
```

---

### Option 2: DigitalOcean App Platform

#### Setup
1. Create DigitalOcean account
2. Create new App Platform
3. Connect GitHub repository
4. Select branches to deploy

#### app.yaml (Create in root)
```yaml
name: returnsense
services:
  # Frontend
  - name: frontend
    source_dir: client
    build_command: npm install && npm run build
    output_dir: dist
    http_port: 3000

  # Backend
  - name: backend
    source_dir: server
    build_command: npm install
    run_command: npm start
    http_port: 5000
    envs:
      - key: NODE_ENV
        value: production

  # ML
  - name: ml-api
    source_dir: ml-model
    build_command: pip install -r requirements.txt
    run_command: python app.py
    http_port: 5001
    envs:
      - key: FLASK_ENV
        value: production

databases:
  - name: mongodb
    engine: MONGODB
    version: "5.0"
```

#### Deploy
```bash
doctl apps create --spec app.yaml
```

---

### Option 3: AWS (Scalable, Enterprise)

#### Architecture
```
CloudFront CDN
    ↓
ALB (Application Load Balancer)
    ├─→ ECS Cluster (Express Backend)
    ├─→ ECS Cluster (Flask ML)
    └─→ S3 (Static React Build)

RDS (MongoDB)
Elasticache (Redis)
WAF (Web Application Firewall)
Route 53 (DNS)
```

#### Frontend on S3 + CloudFront
```bash
# Build React app
cd client && npm run build

# Create S3 bucket
aws s3 mb s3://returnsense-frontend

# Upload build
aws s3 cp dist/ s3://returnsense-frontend --recursive

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name returnsense-frontend.s3.amazonaws.com \
  --enabled
```

#### Backend on ECS
```bash
# Create ECR repository
aws ecr create-repository --repository-name returnsense-backend

# Build Docker image
docker build -t returnsense-backend ./server
docker tag returnsense-backend:latest \
  <account>.dkr.ecr.<region>.amazonaws.com/returnsense-backend:latest

# Push to ECR
aws ecr get-login-password --region <region> | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker push <account>.dkr.ecr.<region>.amazonaws.com/returnsense-backend:latest

# Create ECS task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service --cluster returnsense \
  --service-name backend \
  --task-definition returnsense-backend:1 \
  --desired-count 3
```

#### Database on RDS
```bash
aws rds create-db-instance \
  --db-instance-identifier returnsense-db \
  --db-instance-class db.r5.large \
  --engine mongodb \
  --allocated-storage 100 \
  --master-username admin \
  --master-user-password "<strong-password>"
```

---

### Option 4: Docker & Docker Compose (Recommended)

#### Docker Setup

**Dockerfile - Frontend**
```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Dockerfile - Backend**
```dockerfile
# ml-model/Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "app.py"]
```

**Dockerfile - Frontend**
```dockerfile
# client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  # MongoDB
  mongodb:
    image: mongo:5.0
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
    ports:
      - "27017:27017"
    restart: unless-stopped

  # Backend API
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://admin:secure_password@mongodb:27017
      JWT_SECRET: your_jwt_secret
      NODE_ENV: production
    depends_on:
      - mongodb
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ML API
  ml-api:
    build: ./ml-model
    ports:
      - "5001:5001"
    environment:
      FLASK_ENV: production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo-data:
```

#### Deploy with Docker Compose
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

### Option 5: Kubernetes (Enterprise Scale)

#### Kubernetes Deployment Files

**namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: returnsense
```

**mongodb-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: returnsense
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:5.0
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongo-storage
          mountPath: /data/db
      volumes:
      - name: mongo-storage
        persistentVolumeClaim:
          claimName: mongo-pvc
```

**backend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: returnsense
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: returnsense-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

**backend-service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: returnsense
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

#### Deploy to Kubernetes
```bash
# Create namespace
kubectl create -f namespace.yaml

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb-uri=$MONGODB_URI \
  --from-literal=jwt-secret=$JWT_SECRET \
  -n returnsense

# Deploy MongoDB
kubectl apply -f mongodb-deployment.yaml

# Deploy Backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Deploy ML
kubectl apply -f ml-deployment.yaml

# Deploy Frontend
kubectl apply -f frontend-deployment.yaml

# Verify deployment
kubectl get pods -n returnsense
kubectl get svc -n returnsense
```

---

## 🔧 Environment Configuration

### Production .env Variables

**Backend (.env)**
```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true
MONGODB_DATABASE=returnsense

# Authentication
JWT_SECRET=large_random_secret_key_here
JWT_EXPIRY=24h

# ML API
ML_API_URL=https://ml-api.yourdomain.com
ML_API_KEY=api_key_if_needed

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

**Frontend (.env)**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=ReturnSense
VITE_ENV=production
VITE_SENTRY_DSN=https://...
```

**ML (.env)**
```env
FLASK_ENV=production
FLASK_DEBUG=False
MODEL_PATH=/app/model.pkl
LOG_LEVEL=INFO
```

---

## 📊 Monitoring & Logging

### Application Monitoring

#### New Relic Setup
```bash
# Install agent
npm install newrelic

# Create newrelic.js
# Add to top of server.js:
require('newrelic')

# Set env variables
NEW_RELIC_LICENSE_KEY=your_key
NEW_RELIC_APP_NAME=ReturnSense
```

#### CloudWatch (AWS)
```bash
# Install agent
npm install aws-sdk

# Configure in app
const cloudwatch = new AWS.CloudWatch()

# Log metrics
cloudwatch.putMetricData({
  Namespace: 'ReturnSense',
  MetricData: [{
    MetricName: 'Orders',
    Value: orderCount,
    Unit: 'Count'
  }]
})
```

### Log Aggregation

#### ELK Stack (Elasticsearch, Logstash, Kibana)
```yaml
# Deploy ELK stack
docker run -d --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:7.10.0

docker run -d --name kibana \
  -p 5601:5601 \
  docker.elastic.co/kibana/kibana:7.10.0
```

#### Sentry (Error Tracking)
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://...@sentry.io/...",
  environment: "production",
  tracesSampleRate: 0.1
});
```

---

## 🔐 SSL/TLS Certificate Setup

### Let's Encrypt (Free)

#### Certbot Installation
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Auto-renew
sudo certbot renew --dry-run

# Create cron job
0 0 1 * * certbot renew --quiet
```

#### Configure Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔄 CI/CD Pipeline Setup

### GitHub Actions Workflow

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd client && npm ci
          cd ../server && npm ci
      
      - name: Run tests
        run: |
          cd server && npm test
          cd ../client && npm test
      
      - name: Lint
        run: |
          cd server && npm run lint
          cd ../client && npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build frontend
        run: |
          cd client
          npm ci
          npm run build
      
      - name: Build Docker images
        run: |
          docker build -t returnsense-backend ./server
          docker build -t returnsense-ml ./ml-model
          docker build -t returnsense-frontend ./client

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${secrets.HEROKU_API_KEY}
          heroku_app_name: returnsense-app
          heroku_email: devops@example.com
```

---

## 🛠️ Backup & Disaster Recovery

### Database Backups

#### MongoDB Atlas Automatic Backups
```
1. Go to Atlas Dashboard
2. Database → Backups
3. Enable automatic backups (daily)
4. Retention: 35 days
5. Point-in-time recovery: 7 days
```

#### Manual Backup
```bash
# Backup database
mongodump --uri="mongodb+srv://..." --out=/backups

# Restore from backup
mongorestore --uri="mongodb+srv://..." /backups
```

#### AWS S3 Backup
```bash
# Backup script (cron daily)
#!/bin/bash
mongodump --uri="mongodb+srv://..." --archive | gzip | \
  aws s3 cp - s3://returnsense-backups/$(date +%Y-%m-%d).gz

# Restore from S3
aws s3 cp s3://returnsense-backups/YYYY-MM-DD.gz - | gunzip | \
  mongorestore --archive
```

### Disaster Recovery Plan

#### RTO/RPO Targets
```
Recovery Time Objective (RTO): 1 hour
Recovery Point Objective (RPO): 1 hour
```

#### Failover Procedure
```
1. Detect outage (automated monitoring)
2. Trigger failover
3. DNS points to backup region
4. Restore database from latest backup
5. Verify services running
6. Re-route traffic
7. Investigate incident
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

#### Load Balancer Configuration
```
Multiple Backend Instances:
LB → Backend 1 (5000)
  → Backend 2 (5000)
  → Backend 3 (5000)
  → Backend N (5000)

Database: MongoDB Atlas Replica Set
Cache: Redis Cluster
```

#### Auto-Scaling Rules
```
Scale Up When:
- CPU > 70%
- Memory > 80%
- Response time > 1s
- Queue depth > 100

Scale Down When:
- CPU < 30% for 5 minutes
- Memory < 50%
- No pending requests
```

### Database Scaling

#### MongoDB Sharding
```
Shard by: customer_id (even distribution)

Shards:
- Shard 1: Users A-M
- Shard 2: Users N-Z

Benefits:
- Horizontal scaling
- Better performance
- Parallel queries
```

---

## ✅ Post-Deployment Verification

### Smoke Tests
```bash
#!/bin/bash

# Test API health
curl -f https://api.yourdomain.com/health || exit 1

# Test database connection
curl -f https://api.yourdomain.com/api/products || exit 1

# Test ML API
curl -f https://ml-api.yourdomain.com/health || exit 1

# Test frontend
curl -f https://yourdomain.com || exit 1

echo "All smoke tests passed!"
```

### Monitoring Queries

#### Check error rates
```javascript
db.collection('logs').countDocuments({level: 'ERROR', timestamp: {$gte: new Date(Date.now() - 3600000)}})
```

#### Monitor response times
```javascript
db.collection('metrics').find({name: 'response_time'}).sort({timestamp: -1}).limit(100)
```

---

## 📞 Support & Troubleshooting

### Common Deployment Issues

#### Issue: Database connection fails
**Solution:**
1. Check MONGODB_URI in .env
2. Verify network access in Atlas
3. Ensure IP whitelist includes server
4. Check credentials

#### Issue: ML API timeout
**Solution:**
1. Increase timeout in .env
2. Check ML service status
3. Verify network connectivity
4. Monitor ML service logs

#### Issue: Memory leak in production
**Solution:**
1. Enable memory monitoring
2. Use heap snapshots
3. Identify leaking objects
4. Restart services if critical

### Emergency Procedures

#### Rollback Deployment
```bash
# Revert to previous image
docker pull returnsense-backend:v1.0.0
docker run -d returnsense-backend:v1.0.0

# Or with git
git revert HEAD --no-edit
git push production main
```

#### Database Recovery
```bash
# If data corrupted, restore from backup
mongorestore --drop --uri="mongodb+srv://..." /backups
```

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: September 2026  
**Maintained By**: DevOps Team

