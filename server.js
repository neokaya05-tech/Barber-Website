const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// 1. Initialize express app FIRST — nothing can use `app` before this line
const app = express();

// Add this line inside your server.js if it isn't there!
app.use(express.static(__dirname));

// 2. CORS — must come before any route or body parsing so preflight OPTIONS
//    requests are handled immediately
app.use(cors({
    origin: 'https://kasi-cuts-backend.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 3. Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 4. Body parsers — mongoSanitize needs these to run first so it has a
//    parsed body to sanitize
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🟢 FIX: Clean, non-crashing MongoDB sanitization initialization
app.use(mongoSanitize({
    replaceWith: '_'
}));

// 6. Rate limiter scoped to /api/ routes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// 7. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🚀 Connected to MongoDB Atlas successfully!'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- DATA SCHEMAS & MODELS ---

const appointmentSchema = new mongoose.Schema({
    customerName: String,
    phoneNumber: String,
    service: String,
    date: String,
    timeSlot: String,
    message: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

const reviewSchema = new mongoose.Schema({
    customerName: String,
    rating: { type: Number, min: 1, max: 5 },
    reviewText: String,
    createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model('Review', reviewSchema);

const newsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now }
});
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// --- API ROUTES ---

// 📅 Submit a Booking
app.post('/api/appointments', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database disconnected');
        }
        const newAppointment = new Appointment(req.body);
        await newAppointment.save();
        res.status(201).json({ success: true, message: "Appointment booked successfully!" });
    } catch (error) {
        console.error("🚨 Database Error:", error.message);
        res.status(503).json({
            success: false,
            message: "Our appointment book is taking a breather. Try again shortly!"
        });
    }

    console.log("Received booking data:", req.body);

});

// 📋 Get All Bookings
app.get('/api/appointments', async (req, res) => {
    try {
        const allBookings = await Appointment.find().sort({ createdAt: -1 });
        res.status(200).json(allBookings);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch appointments list.' });
    }
});

// ✏️ Edit Booking Status
app.put('/api/appointments/:id', async (req, res) => {
    try {
        const updatedBooking = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.status(200).json({ message: 'Status updated!', data: updatedBooking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status.' });
    }
});

// ⭐ Post a New Review
app.post('/api/reviews', async (req, res) => {
    try {
        const { customerName, rating, reviewText } = req.body;
        if (!customerName || !rating || !reviewText) {
            return res.status(400).json({ error: 'Please fill in all review fields.' });
        }
        const newReview = new Review({ customerName, rating, reviewText });
        await newReview.save();
        res.status(201).json({ message: 'Thank you for your review!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save review.' });
    }
});

// 📋 Get Homepage Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }).limit(6);
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load reviews.' });
    }
});

// 📧 Newsletter Signup
app.post('/api/newsletter', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email address is required.' });
        }
        const existingSub = await Newsletter.findOne({ email });
        if (existingSub) {
            return res.status(400).json({ error: 'This email is already subscribed!' });
        }
        const newSub = new Newsletter({ email });
        await newSub.save();
        res.status(201).json({ message: '🎉 Welcome to our Newsletter!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to subscribe.' });
    }
});

// Root health check
app.get('/', (req, res) => {
    res.send('Backend server is running smoothly!');
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is happily listening on port ${PORT}`);
});