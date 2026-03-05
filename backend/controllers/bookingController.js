const Booking = require("../models/bookingModel");
const Register = require("../models/userModel");
const Activity = require("../models/activityModel");


// ==================== ADMIN FUNCTIONS ====================

// Get All Bookings
const getAllBookings = async (req , res) => {
    try{
        const bookings = await Booking.findAll({
            include: [{
                model: Register,
                attributes: ['username', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings
        });
        
    }catch(error){
        return res.status(404).json({
            success: false,
            error: "Failed to fetch bookings",
            message: error.message
        });
    }
}

const getPendingBookings = async (req , res) => {
    try{
        const bookings = await Booking.findAll({
            where: {status: 'pending'},
            include: [{
                model: Register,
                attributes: ['username', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json({
            success: true,
            message: "Pending bookings fetched successfully",
            data: bookings
        });
    }catch(error){
        return res.status(404).json({
            success: false,
            error: "Failed to fetch pending bookings",
            message: error.message
        });
    }
}

const getCalenderBookings = async (req , res) => {
    try{
        const bookings = await Booking.findAll({
            include: [{
                model: Register,
                attributes: ['username', 'email']
            }]
        });
        return res.status(201).json({
            success: true,
            message: "Bookings for calendar fetched successfully",
            data: bookings
        }); 
    }catch(error){
        return res.status(404).json({
            success: false,
            error: "Failed to fetch bookings for calendar",
            message: error.message
        });
    }
}

const getDashboardStats = async (req , res) => {
    try{
        const today = new Date().toISOString().split('T')[0];

        const bookingsToday = await Booking.count({
            where: { bookingDate: today }
        });

        const pendingRequests = await Booking.count({
            where: { status: 'pending' }
        });

        const totalUsers = await Register.count();

        const recentActivity = await Activity.findAll({
            limit: 5,
            order: [['timestamp', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard stats fetched successfully",
            data: {
                bookingsToday,
                pendingRequests,
                totalUsers,
                recentActivity
            }
        });

    }catch(error){
        return res.status(404).json({
            success: false,
            error: "Failed to fetch dashboard stats",
            message: error.message
        });
}
}

const updateBookingsStatus = async (req , res) => {
    try{
        const { id } = req.params;
        const { status } = req.body;
        
        if(!['approved', 'rejected'].includes(status)){
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }
        
        const booking = await Booking.findByPk(id);

        if(!booking){
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        booking.status = status;
        await booking.save();

        // Log activity
        const actionMap = {
            approved: "approved",
            rejected: "rejected"
        };

        await Activity.create({
            action: `${actionMap[status]} booking for ${booking.customerName}`,
            bookingId: booking.id,
        });

        return res.status(200).json({
            success: true,
            message: `Booking ${status} successfully`,
            data: booking
        });
    }catch(error){
        return res.status(404).json({
            success: false,
            error: "Failed to update booking status",
            message: error.message
        });
    }
}

const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        const booking = await Booking.findByPk(id);
        
        if (!booking) {
            return res.status(404).json({ 
                success: false, 
                message: "Booking not found" 
            });
        }

        await booking.destroy();
        
        res.status(200).json({ 
            success: true, 
            message: "Booking deleted successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to delete booking",
            error: error.message 
        });
    }
};

// Admin creates booking (walk-in or phone request)
const createBookingAsAdmin = async (req, res) => {
    try {
        const {
            customerName,
            email,
            phoneNumber,
            bookingDate,
            timeSlot,
            notes,
            isWalkIn,
            status
        } = req.body;

        const normalizedStatus = status?.toLowerCase();

        if (!['pending', 'approved','rejected'].includes(normalizedStatus)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status value'
        });
        }


        if (!customerName || !email || !bookingDate || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const existingBooking = await Booking.findOne({
            where: {
                bookingDate,
                timeSlot,
                status: ['pending', 'approved']
            }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        const booking = await Booking.create({
            userId: req.user.id,       // admin who created it
            customerName,
            email,
            phoneNumber,
            bookingDate,
            timeSlot,
            notes: notes || '',
            isWalkIn: Boolean(isWalkIn),
            status: normalizedStatus         
        });

        await Activity.create({
            action: `Admin created booking for ${customerName}`,
            bookingId: booking.id
        });

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message   // don’t hide real errors
        });
    }
};

// ==================== User Functions ====================
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await Booking.findAll({
            where: { userId },
            include: [{
                model: Register,
                attributes: ['username', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch your bookings",
            error: error.message
        });
    }
};

const createBooking = async (req, res) => {
    try {
        const { customerName, email, phoneNumber, bookingDate, timeSlot, notes, isWalkIn } = req.body;
        const userId = req.user.id;

        // Validation
        if (!customerName || !email || !bookingDate || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Check if time slot is already booked
        const existingBooking = await Booking.findOne({
            where: {
                bookingDate,
                timeSlot,
                status: ['pending', 'approved']
            }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        const booking = await Booking.create({
            userId,
            customerName,
            email,
            phoneNumber,
            bookingDate,
            timeSlot,
            notes: notes || '',
            isWalkIn: isWalkIn || false,
            status: 'pending'
        });

        // Log activity
        await Activity.create({
            action: `New booking request from ${customerName}`,
            bookingId: booking.id
        });

        res.status(200).json({ 
            success: true, 
            message: "Booking created successfully. Waiting for approval.",
            data: booking 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to create booking",
            error: error.message 
        });
    }
};


module.exports = {
    getAllBookings,
    getPendingBookings,
    getCalenderBookings,
    getDashboardStats,
    updateBookingsStatus,
    deleteBooking,
    getMyBookings,
    createBooking,
    createBookingAsAdmin
};

