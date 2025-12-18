const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Assuming JWT is still needed for session management after OTP
const User = require('../models/UserJSON');

// Register
router.post('/register', async (req, res) => {
    const { name, role, mobile, location } = req.body;

    try {
        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ msg: 'User with this mobile number already exists' });
        }

        user = new User({
            name,
            role,
            mobile,
            location
        });

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' }, // Longer expiration for mobile app usability
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login Step 1: Send OTP
router.post('/login/send-otp', async (req, res) => {
    const { mobile } = req.body;

    try {
        let user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ msg: 'Mobile number not found. Please register first.' });
        }

        // Generate 4 digit OTP for simplicity
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        user.loginOtp = otp;
        user.loginOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // In a real app, send SMS here. For now, return OTP in response.
        console.log(`OTP for ${mobile}: ${otp}`);

        res.json({ success: true, msg: 'OTP sent to mobile number', otp: otp });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login Step 2: Verify OTP
router.post('/login/verify', async (req, res) => {
    const { mobile, otp } = req.body;

    try {
        // Find user by mobile first to ensure we are checking the right user
        let user = await User.findOne({ mobile });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Check if OTP matches and is not expired
        if (user.loginOtp !== otp || new Date(user.loginOtpExpire) < new Date()) {
            return res.status(400).json({ msg: 'Invalid or Expired OTP' });
        }

        // Clear OTP fields
        user.loginOtp = undefined;
        user.loginOtpExpire = undefined;
        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
