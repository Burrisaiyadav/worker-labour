const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Assuming JWT is still needed for session management after OTP
const User = require('../models/UserJSON');
const LabourGroup = require('../models/LabourGroupJSON');

// Register
router.post('/register', async (req, res) => {
    const { name, role, mobile: rawMobile, location, accountType, groupMembersCount } = req.body;
    const mobile = rawMobile ? rawMobile.trim() : '';

    try {
        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ msg: 'User with this mobile number already exists' });
        }

        user = new User({
            name,
            role,
            mobile,
            location,
            accountType,
            groupMembersCount
        });

        await user.save();

        // Auto-create Group if accountType is 'group'
        if (role === 'labour' && accountType === 'group') {
            const newGroup = new LabourGroup({
                name: user.name, // Use registered group name
                rate: 500, // Default rate
                contact: user.mobile,
                location: user.location,
                adminId: user.id,
                members: [user.id]
            });
            await newGroup.save();
        }

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
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        mobile: user.mobile,
                        role: user.role,
                        accountType: user.accountType,
                        groupMembersCount: user.groupMembersCount
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login Step 1: Send OTP
router.post('/login/send-otp', async (req, res) => {
    const { mobile: rawMobile } = req.body;
    const mobile = rawMobile ? rawMobile.trim() : '';

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
    const { mobile: rawMobile, otp } = req.body;
    const mobile = rawMobile ? rawMobile.trim() : '';

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
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        mobile: user.mobile,
                        role: user.role,
                        accountType: user.accountType,
                        groupMembersCount: user.groupMembersCount
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const auth = require('../middleware/authMiddleware');

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const { name, location, skills, experience, radius, rate, phone, gender, farmSize, crops } = req.body;
        console.log('Updating Profile for User:', req.user.id, 'Data:', req.body);

        if (name) user.name = name;
        if (location) user.location = location;
        if (skills) user.skills = skills;
        if (crops) user.crops = crops;
        if (experience) user.experience = experience;
        if (farmSize) user.farmSize = farmSize;
        if (radius) user.radius = radius;
        if (rate) user.rate = rate;
        if (phone) user.mobile = phone;
        if (gender) user.gender = gender;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/labourers
// @desc    Get all active groups and individual labourers
// @access  Private
router.get('/labourers', auth, async (req, res) => {
    try {
        const individualLabourers = await User.find({ role: 'labour', accountType: 'individual' });
        const groups = await LabourGroup.find();

        // Format groups for discovery
        const groupList = groups.map(g => ({
            id: g.id,
            name: g.name,
            location: g.location || 'Local',
            rate: g.rate || 450,
            accountType: 'group',
            profileImage: g.image,
            membersCount: g.membersCount,
            rating: g.rating || 4.8
        }));

        const individualList = individualLabourers.map(l => ({
            id: l.id,
            name: l.name,
            location: l.location || 'Local',
            rate: l.rate || 450,
            accountType: 'individual',
            profileImage: l.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.name)}&background=random`,
            rating: l.rating || 4.8
        }));

        const unifiedList = [...groupList, ...individualList];
        res.json(unifiedList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
