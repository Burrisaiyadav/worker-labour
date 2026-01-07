const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for Base64 images

// Make io accessible to routes
app.set('io', io);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('send-message', async (data) => {
        const { senderId, receiverId, content } = data;
        const Message = require('./models/MessageJSON');
        const newMessage = new Message({ senderId, receiverId, content });
        await newMessage.save();

        // Emit to both sender and receiver
        io.to(senderId).to(receiverId).emit('receive-message', newMessage);

        // Also notify via notifications if needed (optional)
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// ... rest of the app setup

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmhand')
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));
console.log('✅ Using Local JSON File Storage (No MongoDB required)');

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const jobsRoutes = require('./routes/jobs');
const paymentRoutes = require('./routes/payments');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api', apiRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Farm Hand Backend is Running');
});

// Seed Data
const seedLabourGroups = require('./utils/seedLabourGroups');
seedLabourGroups();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
