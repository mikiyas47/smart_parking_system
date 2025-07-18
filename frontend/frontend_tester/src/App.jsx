import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
//import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Header'

// Import Authentication and Dashboard components
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import AgentDashboard from './components/AgentDashboard'
import AboutUs from './components/AboutUs'
import OwnerLanding from './components/owner/OwnerLanding'
import ContactUs from './components/ContactUs'

// Import Parking components
import CreateParkingSlot from './components/parkingslot/CreateParkingSlot'
import AgentParkingSlots from './components/parkingslot/AgentParkingSlots'
import UpdateParkingSlot from './components/parkingslot/UpdateParkingSlot'
import AvailableParkingSlots from './components/parkingslot/AvailableParkingSlots'
import ParkingSlotManagement from './components/parkingslot/ParkingSlotManagement'
import ParkingAreaList from './components/parkingslot/ParkingAreaList'

// Import Reservation components
import ReservationManagement from './components/reservation/ReservationManagement'
import MakeReservation from './components/reservation/MakeReservation'
import ViewReservation from './components/reservation/ViewReservation'
import ReservationReport from './components/reservation/ReservationReport'
import ErrorBoundary from './components/common/ErrorBoundary'

// Import Car components
import RegisterCar from './components/cars/RegisterCar'
import SearchCar from './components/cars/SearchCar'
import UpdateCar from './components/cars/UpdateCar'
import CarManagement from './components/cars/CarManagement'



// Import Slot components
import SlotManagement from './components/slots/SlotManagement'
import TotalSlots from './components/slots/TotalSlots'
//import CreateSlot from './components/slots/CreateSlot'
//import ListSlots from './components/slots/ListSlots'
//import UpdateSlot from './components/slots/UpdateSlot'
import AgentSlots from './components/slots/AgentSlots'
import RegisterSlot from './components/slots/RegisterSlot'

// Import Check-in components
import CheckInManagement from './components/checkins/CheckInManagement'
import CheckInCar from './components/checkins/CheckInCar'
import CheckOutCar from './components/checkins/CheckOutCar'
import CheckInReport from './components/checkins/CheckInReport'

// Import Parking Price components
import ParkingPriceManagement from './components/ParkingPrice/ParkingPriceManagement'
import UpdatePrices from './components/ParkingPrice/UpdatePrices'
import ViewAgentPrices from './components/ParkingPrice/ViewAgentPrices'

// Import User Management components
import UserManagement from './components/users/UserManagement'
import CreateUser from './components/users/CreateUser'
import ListUsers from './components/users/ListUsers'
import ViewUser from './components/users/ViewUser'
import UpdateUser from './components/users/UpdateUser'
import UserStats from './components/users/UserStats'

// Import Parking Navigation component
import ParkingNavigation from './components/checkins/ParkingNavigation'

// Layout component with Header for consistent navigation
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

// Auth guard component for protecting routes
const RequireAuth = ({ children, allowedRole }) => {
  const userRole = localStorage.getItem('userRole');
  
  // If not logged in, redirect to login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  // If role doesn't match allowed role and allowedRole is specified
  if (allowedRole && userRole !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    return userRole === 'admin' ? 
      <Navigate to="/admin-dashboard" replace /> : 
      <Navigate to="/agent-dashboard" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect from root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Car Owner Landing Page - Public */}
        <Route path="/owner-landing" element={<Layout><OwnerLanding /></Layout>} />
        
        {/* About and Contact Pages - Public */}
        <Route path="/about" element={<Layout><AboutUs /></Layout>} />
        <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin-dashboard" element={
          <RequireAuth allowedRole="admin">
            <AdminDashboard />
          </RequireAuth>
        } />
        <Route path="/agent-dashboard" element={
          <RequireAuth allowedRole="agent">
            <AgentDashboard />
          </RequireAuth>
        } />
        <Route path="/about" element={
          <RequireAuth>
            <AboutUs />
          </RequireAuth>
        } />
        
        {/* Parking Slot Management Routes - Admin only */}
        <Route path="/parking" element={
          <RequireAuth allowedRole="admin">
            <ParkingSlotManagement />
          </RequireAuth>
        }>
          <Route path="create" element={<CreateParkingSlot />} />
          <Route path="agent" element={<AgentParkingSlots />} />
          <Route path="update" element={<UpdateParkingSlot />} />
          <Route path="available" element={<AvailableParkingSlots />} />
          <Route index element={<AvailableParkingSlots />} />
        </Route>
        
        {/* Car Management Routes - Agent only */}
        <Route path="/cars" element={
          <RequireAuth allowedRole="agent">
            <CarManagement />
          </RequireAuth>
        }>
          <Route path="register" element={<RegisterCar />} />
          <Route path="search" element={<SearchCar />} />
          <Route path="update/:plateNumber" element={<UpdateCar />} />
          <Route index element={<SearchCar />} />
        </Route>

        {/* Make Reservation Route - Agent only */}
        <Route path="/makereservation" element={
          <RequireAuth allowedRole="agent">
            <MakeReservation />
          </RequireAuth>
        } />

        {/* Reservation Report Route - Agent only */}
        <Route path="/reservationreport" element={
          <RequireAuth allowedRole="agent">
            <ReservationReport />
          </RequireAuth>
        } />

        {/* Slot Management Routes - Agent only */}
        <Route path="/slots" element={
          <RequireAuth allowedRole="agent">
            <SlotManagement />
          </RequireAuth>
        }>
          {/* <Route path="create" element={<CreateSlot />} />
          <Route path="list" element={<ListSlots />} />
          <Route path="update" element={<UpdateSlot />} /> */}
          <Route path="total" element={<TotalSlots />} />
          <Route path="agent" element={<AgentSlots />} />
          <Route path="register" element={<RegisterSlot />} />
          <Route index element={<AgentSlots />} />
        </Route>
        
        {/* Parking Price Management Routes - Agent only */}
        <Route path="/viewagentprice/*" element={
          <RequireAuth allowedRole="agent">
            <ViewAgentPrices />
            {/* <ParkingPriceManagement /> */}
          </RequireAuth>
        }>
          {/* <Route index element={<ViewAgentPrices />} /> */}
          <Route path="update" element={<UpdatePrices />} />
        </Route>

        {/* Reservation Management Routes - Agent only */}
        <Route path="/viewreservations" element={
          <RequireAuth allowedRole="agent">
            <ErrorBoundary>
              <ViewReservation />
            </ErrorBoundary>
          </RequireAuth>
        }>
          <Route path="make" element={<MakeReservation />} />
          <Route path="view" element={<ViewReservation />} />
          <Route path="report" element={<ReservationReport />} />
          <Route path="cancel" element={<div>Cancel Reservation</div>} />
          <Route index element={<MakeReservation />} />
        </Route>
        
        {/* Check-in Management Routes - Agent only */}
        <Route path="/checkins" element={
          <RequireAuth allowedRole="agent">
            <ParkingNavigation />
          </RequireAuth>
        }>
          <Route path="car" element={<CheckInCar />} />
          <Route path="checkout" element={<CheckOutCar />} />
          <Route path="reports" element={<CheckInReport />} />
          <Route index element={<CheckInCar />} />
        </Route>
         {/* <Route path="/parking-navigation" element={ <CheckInManagement />} /> */}
        
        {/* User Management Routes - Admin only */}
        <Route path="/users" element={
          <RequireAuth allowedRole="admin">
            <UserManagement />
          </RequireAuth>
        }>
          <Route path="create" element={<CreateUser />} />
          <Route path="list" element={<ListUsers />} />
          <Route path="search" element={<ViewUser />} />
          <Route path="view" element={<ViewUser />} />
          <Route path="update" element={<UpdateUser />} />
          <Route path="stats" element={<UserStats />} />
          <Route index element={<ListUsers />} />
        </Route>

        {/* Parking Area Management Routes - Admin only */}
        <Route path="/parking" element={
          <RequireAuth allowedRole="admin">
            <ParkingSlotManagement />
          </RequireAuth>
        }>
          <Route path="list" element={<ParkingAreaList />} />
          <Route path="create" element={<CreateParkingSlot />} />
          <Route path="agent" element={<AgentParkingSlots />} />
          <Route path="update/:id" element={<UpdateParkingSlot />} />
          <Route path="available" element={<AvailableParkingSlots />} />
          <Route index element={<ParkingAreaList />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
