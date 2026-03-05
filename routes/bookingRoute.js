const express = require('express');
const router = express.Router();
const authGuard = require('../helpers/authguard')
const isAdmin = require('../helpers/isAdmin');

const {
    getAllBookings,
    getPendingBookings,
    getCalenderBookings,
    getDashboardStats,
    updateBookingsStatus,
    deleteBooking,
    getMyBookings,
    createBooking,
    createBookingAsAdmin
} = require('../controllers/bookingController');

// ==================== USER ROUTES ====================
// Protected user routes - require authentication
router.get('/my-bookings', authGuard, getMyBookings);
router.post('/', authGuard, createBooking);

// ==================== ADMIN ROUTES ====================
// Protected admin routes - require authentication AND admin role
router.get('/admin/all', authGuard, isAdmin, getAllBookings);
router.get('/admin/pending', authGuard, isAdmin, getPendingBookings);
router.get('/admin/calendar', authGuard, isAdmin, getCalenderBookings);
router.get('/admin/dashboard-stats', authGuard, isAdmin, getDashboardStats);
router.patch('/admin/:id/status', authGuard, isAdmin, updateBookingsStatus);
router.delete('/admin/:id', authGuard, isAdmin, deleteBooking);
router.post("/admin/create", authGuard, isAdmin, createBookingAsAdmin);

module.exports = router;