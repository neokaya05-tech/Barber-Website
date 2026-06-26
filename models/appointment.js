const mongoose = require('mongoose');

// Define the blueprint for a single appointment booking
const AppointmentSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    service: {
        type: String, // e.g., "Fade", "Beard Trim", "Haircut"
        required: true
    },
    date: {
        type: String, // e.g., "2026-06-20"
        required: true
    },
    time: {
        type: String, // e.g., "14:30"
        required: true
    },
    status: {
        type: String,
        default: 'Pending' // Can change to 'Confirmed' or 'Cancelled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the blueprint so we can use it in other files
module.exports = mongoose.model('Appointment', AppointmentSchema);