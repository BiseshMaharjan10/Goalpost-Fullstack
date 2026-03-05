import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './protected/ProtectedRoute';
import Pending from './pages/Pending';
import Calendar  from './pages/Calendar';
import ForgetPass from './pages/ForgetPass';
import Resetpass from './pages/ResetPass';
import AdminUser from './pages/AdminUser';
import Settings from './pages/Settings';
import Dashboard from './pages/user/Dashboard';
import MyBookings from './pages/user/MyBookings';
import CourtInfo from './pages/user/CourtInfo';

function App() {
 

  return (
    <Router>
      <Toaster/>
      <Routes>
           <Route path="/" element={<Register/>} />
           <Route path="/login" element={<Login/>} />
           <Route path="/forgot-password" element={<ForgetPass />} />
          <Route path="/reset-password/:token" element={<Resetpass />} />
           <Route path="/userdash" element={<Dashboard/>} />
           <Route path="/my-bookings" element={<MyBookings/>} />
           <Route path="/court-info" element={<CourtInfo/>} />
           <Route path="/admindash" element={
            <ProtectedRoute allowedRoles={['admin']} element={<AdminDashboard/>}
            />} 
            />
            <Route path="/pending" element={
            <ProtectedRoute allowedRoles={['admin']} element={<Pending/>}
            />} 
            />
            <Route path="/calendar" element={
            <ProtectedRoute allowedRoles={['admin']} element={<Calendar/>}
            />} 
            />
               <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']} element={<AdminUser/>}
            />} 
            />
            <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']} element={<Settings />} 
            />}
            />
      </Routes>
    </Router>
  )
}

export default App
