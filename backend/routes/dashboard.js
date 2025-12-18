const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const User = require('../models/UserJSON');
const Job = require('../models/JobJSON');

// @route   GET /api/dashboard/farmer
// @desc    Get farmer dashboard data
// @access  Private
router.get('/farmer', auth, async (req, res) => {
    try {
        // Use findById directly
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // --- MOCK DATA GENERATION BASED ON LOCATION ---
        const location = user.location ? user.location.toLowerCase() : '';
        let activeJobs = [];
        let nearbyGroups = [];

        // Dynamic Job Generation
        // Fetch Real Active Jobs from JSON Storage
        // Filter out completed if you only want active? For dashboard stats we might want all or just active.
        // Let's get all user's jobs and filter for 'Active' or 'In Progress' for the list
        const allUserJobs = await Job.find({ userId: req.user.id });

        // Map to format expected by Frontend if needed, or ensure frontend uses standard format
        // The JobJSON structure matches what we want mostly.
        activeJobs = allUserJobs.filter(j => j.status !== 'Completed');

        // If no real jobs, maybe keep mock data? 
        // User requested "real use", so let's stick to real data even if empty.
        // But for "nearbyGroups", we still need mock data as we don't have Workers DB yet.

        // Nearby Groups Mock Data
        nearbyGroups = [
            { id: 101, name: 'Sharma Labour Group', rating: 4.8, members: 25, rate: 450, contact: '98****1234' },
            { id: 102, name: 'Verma Brothers', rating: 4.5, members: 15, rate: 400, contact: '88****5678' },
            { id: 103, name: 'Jai Kisan Union', rating: 4.2, members: 40, rate: 420, contact: '76****9012' },
        ];


        res.json({
            user: {
                id: user.id,
                name: user.name,
                // Removed email
                role: user.role,
                mobile: user.mobile,
                location: user.location,
                profileImage: user.profileImage
            },
            activeJobs,
            nearbyGroups,
            stats: {
                activeJobsCount: activeJobs.length,
                totalSpent: activeJobs.reduce((acc, job) => acc + (job.status === 'Completed' || job.status === 'In Progress' ? job.cost : 0), 0),
                pendingAction: 1
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
