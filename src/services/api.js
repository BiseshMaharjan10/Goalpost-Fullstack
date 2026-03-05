import axios from 'axios';

const ApiFormData = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-type":"multipart/form-data",
    },
});

const Api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-type": "application/json",
    }
});

const config ={
    headers:{
        'authorization': `Bearer ${localStorage.getItem('token')}`
    }
}


// ============= login & registration  APIs =============

export const createUserApi = (data) => ApiFormData.post("/api/user/registerUser", data);

export const login = (data) => Api.post("/api/user/loginUser", data);

// ============= PASSWORD RESET APIs =============
export const forgotPassword = (data) => Api.post("/api/user/forgot-password", data);

export const resetPassword = (token, data) => Api.post(`/api/user/reset-password/${token}`, data);


export const getallUser = () => Api.get("api/user/getAllUser",config);

export const getMe = () => Api.get("api/user/getme",config);

export const uploadImage = (data) => ApiFormData.put("/api/user/updateImage", data,config);

export const pendingRequest = () => Api.get("api/booking/admin/pending",config);

export const getAllBookings = () => Api.get("/api/booking/admin/all", config);

export const getCalendarBookings = () => Api.get("/api/booking/admin/calendar", config);

export const createBookingAsAdmin = (data) => Api.post("/api/booking/admin/create", data, config);

// Get dashboard stats
export const getDashboardStats = () => Api.get("/api/booking/admin/dashboard-stats", config);

export const updateBookingStatus = (bookingId, status) => 
    Api.patch(`/api/booking/admin/${bookingId}/status`, { status }, config);

// Wrapper functions - easier to use
export const approveBooking = (bookingId) => 
    updateBookingStatus(bookingId, 'approved');

export const rejectBooking = (bookingId) => 
    updateBookingStatus(bookingId, 'rejected');

// Delete booking
export const deleteBooking = (bookingId) => 
    Api.delete(`/api/booking/admin/${bookingId}`, config);

// ============= USER BOOKING APIs =============

// Get my bookings (for logged-in user)
export const getMyBookings = () => Api.get("/api/booking/my-bookings", config);

// Create new booking
export const createBooking = (data) => Api.post("/api/booking", data, config);




// ============= Settings  APIs =============
export const getSettings = () => Api.get("/api/settings", config);

export const updateSettings = (data) => Api.put("/api/settings", data, config);

