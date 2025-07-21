# 🏢 Diploma Project - Business Directory

A full-stack business directory application built with React frontend and Node.js/Express backend.

## 🚀 Quick Start

### One-command setup:
```bash
# Initialize the entire project (dependencies, database, etc.)
chmod +x init.sh
./init.sh

# Start the application
./start.sh
```

### Manual setup:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup database
mysql -u root -e "CREATE DATABASE project_db;"
mysql -u root project_db < project_db_dump.sql

# Start servers manually
# Terminal 1 - Backend
cd backend
PORT=3030 npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MySQL** (v8.0 or higher)

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3030

## 🏗️ Project Structure

```
diploma_project/
├── backend/                 # Node.js/Express API
│   ├── routes/             # API routes
│   ├── src/               # Application entry point
│   ├── dbSingleton.js     # Database connection
│   └── package.json
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api/          # API client
│   │   └── App.jsx       # Main application
│   ├── vite.config.js    # Vite configuration
│   └── package.json
├── project_db_dump.sql   # Database schema and data
├── init.sh              # Full initialization script
├── start.sh             # Development server starter
└── README.md
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `./init.sh` | Initialize entire project (one-time setup) |
| `./start.sh` | Start both frontend and backend servers |
| `cd backend && npm start` | Start backend only |
| `cd frontend && npm run dev` | Start frontend only |

## 🏪 Features

### Customer Features
- **🏠 Home Page**: Welcome page with business search
- **🔍 Search & Filter**: Find businesses by name, category, rating
- **👤 User Profile**: Personal dashboard with appointments and favorites
- **📅 Appointment Booking**: Schedule appointments with businesses
- **⭐ Reviews**: Rate and review business services

### Business Owner Features (Planned)
- **📊 Business Dashboard**: Analytics and appointment management
- **🛠️ Service Management**: Add/edit business services and pricing
- **📆 Calendar**: Manage availability and appointments
- **💬 Customer Communication**: Handle appointment requests

### Admin Features (Planned)
- **🔧 Admin Panel**: System overview and management
- **👥 User Management**: Manage all users and businesses
- **📈 Reports**: Generate system statistics

## 🗃️ Database Schema

### Main Tables
- **users**: User accounts (customers, business owners, admins)
- **businesses**: Business listings with details
- **services**: Services offered by businesses
- **appointments**: Scheduled appointments
- **reviews**: Customer reviews and ratings

## 🧑‍💻 Development

### Backend (Port 3030)
- **Framework**: Express.js
- **Database**: MySQL with custom singleton pattern
- **Authentication**: JWT-based auth with bcrypt
- **API**: RESTful routes organized by domain

### Frontend (Port 3000)
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM v7
- **State**: Local state + UserContext
- **Styling**: CSS modules
- **HTTP**: Axios with configured base instance

### Database Connection
- Uses singleton pattern in `dbSingleton.js`
- Automatic reconnection on connection loss
- Environment variables for configuration

## 🔐 Authentication

### Test Users
Use the quick-fill buttons on login page:

| Role | Email | Password |
|------|-------|----------|
| Customer | user@mail.com | userpass |
| Business Owner | business@mail.com | businesspass |
| Admin | admin@mail.com | adminpass |

## 🐛 Troubleshooting

### Common Issues

**MySQL Connection Error:**
```bash
# Start MySQL service
sudo systemctl start mysql

# Check MySQL status
sudo systemctl status mysql
```

**Port Already in Use:**
```bash
# Kill processes on ports 3000/3030
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3030 | xargs kill -9
```

**Dependencies Issues:**
```bash
# Clean install
rm -rf backend/node_modules frontend/node_modules
./init.sh
```

## 📝 Environment Variables

Create `.env` in backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=project_db
JWT_SECRET=your_jwt_secret_here
```

## 🚧 Development Status

- ✅ **Authentication System**: Login/Register with JWT
- ✅ **Business Search**: Search and filter businesses
- ✅ **Business Profiles**: Detailed business pages with services
- ✅ **Appointment Booking**: Schedule appointments
- ✅ **User Profiles**: Customer dashboard
- 🔄 **Business Owner Dashboard**: In development
- 🔄 **Admin Panel**: Planned
- 🔄 **Review System**: Planned

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of a diploma thesis and is for educational purposes.

---

**Happy coding! 🚀**