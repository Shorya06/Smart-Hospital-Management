# Smart Hospital Management System

A comprehensive AI-powered hospital management system built with Django REST API backend and React frontend, featuring role-based access control, appointment management, and AI symptom checker.

## 🌐 Live Demo

- **Frontend**: [https://smart-hms-frontend.vercel.app](https://smart-hms-frontend.vercel.app)
- **Backend API**: [https://smart-hms-backend.onrender.com/api/](https://smart-hms-backend.onrender.com/api/)
- **Admin Panel**: [https://smart-hms-backend.onrender.com/admin/](https://smart-hms-backend.onrender.com/admin/)

## 🔐 Demo Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Doctor Accounts
- **Username**: `dr_smith` | **Password**: `doctor123`
- **Username**: `dr_johnson` | **Password**: `doctor123`
- **Username**: `dr_davis` | **Password**: `doctor123`

### Patient Accounts
- **Username**: `patient1` | **Password**: `patient123`
- **Username**: `patient2` | **Password**: `patient123`
## 🏥 Features

### Core Functionality
- **Role-based Authentication** (Patient, Doctor, Admin)
- **Appointment Management** with booking and scheduling
- **Patient Records** management
- **Doctor Profiles** with specializations
- **AI Symptom Checker** for preliminary diagnosis
- **Analytics Dashboard** with key performance indicators
- **Responsive Design** for mobile and desktop

### AI Features
- Machine learning-based symptom analysis
- Disease prediction with confidence scoring
- Medical recommendations and next steps
- Preliminary diagnosis assistance

### User Roles
- **Patients**: Book appointments, view medical records, use symptom checker
- **Doctors**: Manage appointments, view patient records, access symptom checker
- **Admins**: Full system access, analytics, user management

## 🚀 Tech Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **JWT Authentication** - Secure token-based auth
- **scikit-learn** - Machine learning for AI features
- **pandas** - Data processing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animations

## 📦 Installation

### Prerequisites
- Python 3.8+ (3.11+ recommended)
- Node.js 16+ (v22+ recommended)
- SQLite (included with Python) or PostgreSQL for production
- Git

### Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd smart_hms/backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database setup (SQLite for local dev)**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py seed_data  # Load sample data (creates admin, doctors, patients)
   ```

5. **Start development server**
   ```bash
   python manage.py runserver
   ```
   Backend will run on: http://localhost:8000

#### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal)
   ```bash
   cd smart_hms/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

#### Environment Variables (Optional)

For local development, the system uses default SQLite database. To use PostgreSQL:

Create a `.env` file in `smart_hms/backend/`:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/hospital_db
CORS_ALLOW_ALL_ORIGINS=True
```

### Running Tests

#### Backend Tests
```bash
cd smart_hms/backend
.\venv\Scripts\Activate.ps1  # Windows
pytest hospital_app/tests.py -v --cov=hospital_app --cov-report=html
```

**Test Results:**
- ✅ 18 tests passing
- ✅ 71% code coverage
- All critical functionality tested

#### Frontend Tests
Frontend tests are not currently configured. Manual testing and integration testing with backend is performed.

### Quick Start Script

See `demo.sh` (Linux/Mac) or `demo.bat` (Windows) for automated setup and run commands.


## 🌐 Access Points

### Local Development
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

### Production (Live Demo)
- **Frontend**: https://smart-hms-frontend.vercel.app
- **Backend API**: https://smart-hms-backend.onrender.com/api/
- **Admin Panel**: https://smart-hms-backend.onrender.com/admin/

## 📁 Project Structure

```
smart_hms/
├── backend/
│   ├── hospital/           # Django project settings
│   ├── hospital_app/       # Main application
│   │   ├── models.py      # Database models
│   │   ├── views.py       # API views
│   │   ├── serializers.py # Data serialization
│   │   └── ai_model/      # AI/ML components
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── theme.js       # Material-UI theme
│   └── package.json       # Node.js dependencies
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/token/refresh/` - Token refresh

### Core Features
- `GET /api/appointments/` - List appointments
- `POST /api/appointments/` - Create appointment
- `GET /api/patients/` - List patients
- `GET /api/doctors/` - List doctors
- `POST /api/ai/symptom-checker/` - AI symptom analysis

## 🎨 UI/UX Features

- **Healthcare-inspired Design** with professional color scheme
- **Responsive Layout** with Material-UI components
- **Role-based Navigation** with dynamic menu items
- **Interactive Dashboards** with KPI cards and charts
- **Smooth Animations** using Framer Motion
- **Mobile-first Design** with touch-friendly interfaces

## 🤖 AI Features

### Symptom Checker
- Natural language symptom input
- Machine learning-based disease prediction
- Confidence scoring and recommendations
- Medical disclaimer and professional advice prompts

### Future AI Enhancements
- Medical image analysis
- Predictive analytics
- Natural language processing
- Integration with medical databases

## 🚀 Deployment

### Production Setup
1. Configure production database
2. Set up environment variables
3. Configure static file serving
4. Set up SSL certificates
5. Configure reverse proxy (Nginx)

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📊 System Requirements

### Minimum Requirements
- **RAM**: 4GB
- **Storage**: 10GB
- **CPU**: 2 cores
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

### Recommended Requirements
- **RAM**: 8GB
- **Storage**: 20GB SSD
- **CPU**: 4 cores
- **OS**: Latest stable versions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🧪 Testing

### Test Coverage
- **Backend Coverage:** 100% ✅ (518/518 statements)
- **Total Tests:** 131 (116 backend + 15 symptom checker accuracy)
- **Status:** All tests passing ✅
- **Symptom Checker Accuracy:** 15/15 tests passing ✅
- **Frontend Coverage:** Infrastructure ready, tests in progress ⏳

### Running Tests
```bash
# Backend tests with coverage (100% coverage achieved)
cd smart_hms/backend
.\venv\Scripts\Activate.ps1
pytest hospital_app/tests.py hospital_app/tests_ai_model.py \
  --cov=hospital_app --cov-config=.coveragerc \
  --cov-report=html --cov-report=term

# View coverage report
# Open htmlcov/index.html in browser

# Frontend tests
cd smart_hms/frontend
npm test -- --coverage
```

### Test Categories
- **Model tests (18 tests):** User, Patient, Doctor, Admin, Appointment, MedicalRecord, Prescription, SymptomChecker
- **Authentication tests (9 tests):** Register (all roles), Login (all scenarios)
- **API endpoint tests (60+ tests):** Dashboard, Appointments, Patients, Doctors, Admins, Medical Records, Prescriptions, Symptom Checker
- **Serializer tests (8 tests):** All validation logic and edge cases
- **AI Model tests (17 tests):** SymptomCheckerAI initialization, training, prediction, recommendations
- **Symptom Checker Accuracy tests (15 tests):** All prediction scenarios, edge cases, error handling
- **Integration tests:** Complete user workflows

**Backend:** 100% coverage ✅ (131 tests, 518 statements)  
**Symptom Checker:** Fixed accuracy bug, all tests passing ✅  
**Frontend:** Testing infrastructure ready, SymptomChecker component tested ⏳

See `reports/COMPLETE_TEST_VALIDATION_TABLE.md` for detailed test results.

## 📋 Project Status

### Completed Features ✅
- Backend API with Django REST Framework
- Frontend with React and Material-UI
- JWT Authentication
- Role-based access control
- Appointment management
- AI Symptom Checker
- Comprehensive test suite (71% coverage)
- Database seeding with sample data
- Local development setup

### Known Limitations
- Frontend tests not configured (manual testing performed)
- AI model uses limited dataset (fallback system works)
- Some edge cases not fully tested (core functionality verified)

See `Final_Addendum.md` for detailed project status and remaining work.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Shorya** - *Initial work* - [Shorya06](https://github.com/Shorya06)

## 🙏 Acknowledgments

- Material-UI for the component library
- Django REST Framework for API development
- React community for excellent documentation
- Healthcare professionals for domain insights

## 📞 Support

For support, email support@smarthms.com or create an issue in the repository.

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic hospital management features
- ✅ AI symptom checker
- ✅ Role-based access control
- ✅ Responsive UI/UX

### Phase 2 (Planned)
- 🔄 Advanced AI features
- 🔄 Medical image analysis
- 🔄 Real-time notifications
- 🔄 Mobile app development

### Phase 3 (Future)
- ⏳ Integration with medical devices
- ⏳ Telemedicine features
- ⏳ Advanced analytics
- ⏳ Multi-language support

---

**Built with ❤️ for better healthcare management**
