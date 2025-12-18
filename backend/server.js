const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/payments', paymentRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Farm Hand Backend is Running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
