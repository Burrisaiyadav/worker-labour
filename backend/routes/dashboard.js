const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const User = require('../models/UserJSON');
const Job = require('../models/JobJSON');
const LabourGroup = require('../models/LabourGroupJSON');

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

        // Fetch Real Labourers filtered by Location (Nearby Workers)
        const allLabourers = await User.find({ role: 'labour' });
        nearbyGroups = allLabourers.filter(l =>
            l.location && l.location.toLowerCase().includes(location)
        );

        // Fallback: If no local workers found, show some others for demo
        if (nearbyGroups.length === 0) {
            nearbyGroups = allLabourers.slice(0, 5);
        }

        // Enrich jobs with assigned worker names
        const enrichedJobs = await Promise.all(activeJobs.map(async (job) => {
            if (job.assignedTo) {
                const worker = await User.findById(job.assignedTo);
                return {
                    ...job,
                    assignedToName: worker ? worker.name : null,
                    assignedToPhone: worker ? worker.mobile : null
                };
            }
            return job;
        }));

        res.json({
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                mobile: user.mobile,
                location: user.location,
                profileImage: user.profileImage
            },
            activeJobs: enrichedJobs,
            nearbyGroups,
            stats: {
                activeJobsCount: activeJobs.length,
                pendingAction: 1
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
