# Traveller Car Booking Platform - Specification

## 1. Project Overview

- **Project Name**: Traveller Car Booking Platform
- **Project Type**: Full-stack Web Application (MVP)
- **Core Functionality**: A car rental platform where car owners can list their vehicles and users can browse, filter, and book available cars
- **Target Users**: Car owners (admin) and renters (users)

## 2. Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Datepicker for date selection
- Lucide React for icons

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- CORS for cross-origin requests

### Database
- MongoDB (host: 10.60.169.213, port: 27017)

## 3. UI/UX Specification

### Color Palette
- **Primary**: #2563EB (Blue-600)
- **Primary Dark**: #1D4ED8 (Blue-700)
- **Secondary**: #10B981 (Emerald-500)
- **Background**: #F9FAFB (Gray-50)
- **Surface**: #FFFFFF
- **Text Primary**: #111827 (Gray-900)
- **Text Secondary**: #6B7280 (Gray-500)
- **Error**: #EF4444 (Red-500)
- **Warning**: #F59E0B (Amber-500)
- **Success**: #10B981 (Emerald-500)
- **Border**: #E5E7EB (Gray-200)

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: 
  - H1: 36px/2.25rem, font-weight: 700
  - H2: 30px/1.875rem, font-weight: 600
  - H3: 24px/1.5rem, font-weight: 600
  - H4: 20px/1.25rem, font-weight: 500
- **Body**: 16px/1rem, font-weight: 400
- **Small**: 14px/0.875rem, font-weight: 400

### Layout
- **Container**: max-width 1280px, centered
- **Spacing**: 4px base unit (0.25rem)
- **Grid**: 12-column grid system
- **Responsive Breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Components

#### Navigation Bar
- Fixed top, white background with shadow
- Logo on left (car icon + "Traveller")
- Navigation links center (Home, Cars, My Bookings)
- Auth buttons right (Login/Signup or User menu)
- Mobile: Hamburger menu

#### Car Card
- White card with rounded corners (8px)
- Image at top (16:9 ratio, object-cover)
- Car name, type badge, price/day
- "Book Now" button (primary color)
- Hover: slight scale (1.02) and shadow increase

#### Booking Form
- Date range picker with start/end dates
- User contact info fields
- Price calculation display
- Submit button with loading state

#### Filter Panel
- Car type dropdown (SUV, Sedan, Hatchback)
- Price range slider
- Availability toggle
- Clear filters button

#### Admin Dashboard
- Table view of cars with edit/delete actions
- Add new car form modal
- Bookings list with status

### Animations
- Page transitions: fade in (200ms)
- Card hover: transform scale + shadow (150ms)
- Button hover: background color change (150ms)
- Modal: fade in + scale (200ms)

## 4. Functionality Specification

### User Features

#### Authentication
- Signup: username, email, password
- Login: email + password
- JWT token stored in localStorage
- Auto-logout on token expiration

#### Car Listing
- Grid display of all available cars
- Pagination (12 cars per page)
- Loading skeleton while fetching

#### Filtering
- By car type: SUV, Sedan, Hatchback
- By price range: min to max per day
- By availability: available now toggle

#### Car Details
- Full-size images carousel
- Complete car information
- Availability calendar
- Booking form

#### Booking
- Select date range
- Calculate total price
- Prevent double booking (check overlapping dates)
- Store booking with status: "confirmed" | "cancelled"

### Admin Features

#### Car Management
- Add new car with form validation
- Edit existing car details
- Delete car (with confirmation)
- Image URL input (comma-separated for multiple)

#### Booking Management
- View all bookings
- Cancel bookings
- Filter by status

### API Endpoints

#### Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

#### Cars
- GET /api/cars (with query params for filters)
- GET /api/cars/:id
- POST /api/cars (admin only)
- PUT /api/cars/:id (admin only)
- DELETE /api/cars/:id (admin only)

#### Bookings
- GET /api/bookings (user's bookings or all for admin)
- POST /api/bookings
- PUT /api/bookings/:id/cancel (cancel booking)

## 5. Data Models

### User
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String (enum: 'user', 'admin'),
  createdAt: Date
}
```

### Car
```javascript
{
  _id: ObjectId,
  name: String,
  type: String (enum: 'SUV', 'Sedan', 'Hatchback'),
  description: String,
  pricePerDay: Number,
  images: [String],
  available: Boolean,
  createdAt: Date
}
```

### Booking
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  car: ObjectId (ref: Car),
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  status: String (enum: 'confirmed', 'cancelled'),
  createdAt: Date
}
```

## 6. Project Structure

```
/workspace/project/traveller-website/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Car.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cars.js
│   │   └── bookings.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
├── README.md
└── SPEC.md
```

## 7. Acceptance Criteria

### Must Work
- [ ] Backend server starts on port 5000
- [ ] MongoDB connection successful
- [ ] User can signup and login
- [ ] User can view all cars
- [ ] User can filter cars by type and price
- [ ] User can view car details
- [ ] User can book a car with date range
- [ ] Double booking prevention works
- [ ] Admin can add/edit/delete cars
- [ ] Admin can view all bookings

### UI Requirements
- [ ] Clean, modern interface
- [ ] Responsive design (mobile to desktop)
- [ ] Loading states shown
- [ ] Error messages displayed
- [ ] Success confirmations shown

### Code Quality
- [ ] Proper folder structure
- [ ] Reusable components
- [ ] Error handling in API calls
- [ ] Comments in complex code sections
- [ ] README with setup instructions