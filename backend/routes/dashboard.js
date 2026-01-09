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

        // --- REAL DATA FETCHING ---
        const location = user.location ? user.location.toLowerCase() : '';
        const allUserJobs = await Job.find({ userId: req.user.id });
        const activeJobs = allUserJobs.filter(j => j.status !== 'Completed');

        // Fetch All Labour Groups
        const allGroups = await LabourGroup.find();

        // 1. Nearby Groups: Filter by proximity (location match)
        nearbyGroups = allGroups.filter(g =>
            g.location && g.location.toLowerCase().includes(location)
        );

        // 2. Big Groups: Filter by size (e.g., > 5 members) or just top largest
        // Sort by members count descending and take top ones
        const bigGroups = allGroups
            .filter(g => (g.membersCount || (g.members && g.members.length) || 0) >= 1) // For now any group is eligible, but we sort by size
            .sort((a, b) => {
                const countA = a.membersCount || (a.members && a.members.length) || 0;
                const countB = b.membersCount || (b.members && b.members.length) || 0;
                return countB - countA;
            })
            .slice(0, 6); // Top 6 largest groups

        // Enrich groups with member counts if needed (LabourGroupJSON already does this mostly)

        // Enrich jobs with assigned worker/group details
        const enrichedJobs = await Promise.all(activeJobs.map(async (job) => {
            if (job.assignedTo) {
                // Try finding in Users first (Individual)
                let worker = await User.findById(job.assignedTo);

                // If not found in Users, it might be a Group ID
                if (!worker) {
                    const group = allGroups.find(g => g.id === job.assignedTo);
                    if (group) {
                        return {
                            ...job,
                            assignedToName: group.name,
                            assignedToPhone: group.contact,
                            isGroup: true
                        };
                    }
                }

                return {
                    ...job,
                    assignedToName: worker ? worker.name : 'Unknown',
                    assignedToPhone: worker ? worker.mobile : null,
                    isGroup: false
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
            nearbyGroups: nearbyGroups.length > 0 ? nearbyGroups : allGroups.slice(0, 4),
            bigGroups,
            stats: {
                activeJobsCount: activeJobs.length,
                pendingAction: 1
            }
        });

    } catch (err) {
        console.error("Farmer Dashboard Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
