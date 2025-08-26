# Quick Start Guide - Shop Inventory System

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Git
- VS Code (recommended)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd shopInventory
npm run install:all
```

### 2. Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
MONGODB_URI=mongodb://localhost:27017/shop-inventory
JWT_SECRET=your-secret-key
PORT=3000
```

### 3. Start Development Servers

#### Backend (NestJS)
```bash
cd backend
npm run start:dev
```
- Server runs on: http://localhost:3000
- API docs: http://localhost:3000/api

#### Frontend (Angular)
```bash
cd frontend
npm start
```
- App runs on: http://localhost:4200

### 4. Database Setup
```bash
# Start MongoDB (if not running)
mongod

# The app will automatically create:
# - Database: shop-inventory
# - Collections: products, sales, users, etc.
# - Initial admin user: admin@shopinventory.com / admin123
```

## 🏗️ Project Structure

```
shopInventory/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   └── config/         # Configuration
│   └── package.json
├── frontend/               # Angular App
│   ├── src/
│   │   ├── app/
│   │   │   ├── features/   # Feature modules
│   │   │   ├── shared/     # Shared components
│   │   │   └── core/       # Core services
│   │   └── assets/
│   └── package.json
└── .taskmaster/            # Project management
    └── tasks/              # Development tasks
```

## 🔑 Default Credentials

### Admin User
- **Email**: admin@shopinventory.com
- **Password**: admin123
- **Role**: Administrator

## 📱 Available Features

### Phase 1 (Current)
- ✅ User authentication
- ✅ Product management (CRUD)
- ✅ Basic dashboard
- ✅ Product search and filtering
- ✅ Responsive design

### Coming Soon
- 🔄 Sales/POS system
- 🔄 Inventory management
- 🔄 Invoice generation
- 🔄 Reporting system

## 🛠️ Development Commands

### Backend
```bash
cd backend
npm run start:dev      # Development server
npm run build          # Build for production
npm run test           # Run tests
npm run lint           # Lint code
```

### Frontend
```bash
cd frontend
npm start              # Development server
npm run build          # Build for production
npm run test           # Run tests
npm run lint           # Lint code
```

### Both (from root)
```bash
npm run dev            # Start both servers
npm run build          # Build both
npm run test           # Test both
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
```

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **API Base**: http://localhost:3000/api/v1

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /products` - List products
- `POST /products` - Create product
- `GET /sales` - List sales
- `POST /sales` - Create sale

## 🔧 Common Issues & Solutions

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version
# Start MongoDB service
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

### Node Modules Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Angular/NestJS best practices
- Use meaningful variable names
- Add JSDoc comments for complex functions

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/product-management

# Commit changes
git add .
git commit -m "feat: add product management functionality"

# Push and create PR
git push origin feature/product-management
```

### Testing
- Write tests for all new features
- Maintain >80% code coverage
- Test both success and error scenarios
- Use meaningful test descriptions

## 🚀 Deployment

### Development
- Backend: http://localhost:3000
- Frontend: http://localhost:4200

### Production (Future)
- Backend: TBD
- Frontend: TBD
- Database: MongoDB Atlas

## 📞 Support

### Team Members
- **Project Manager**: TBD
- **Backend Developer**: TBD
- **Frontend Developer**: TBD
- **QA Engineer**: TBD

### Communication
- **Slack**: TBD
- **Email**: TBD
- **Documentation**: README.md

## 📚 Additional Resources

### Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [Angular Documentation](https://angular.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [Angular DevTools](https://angular.io/guide/devtools) - Browser extension

---

**Happy Coding! 🎉**
