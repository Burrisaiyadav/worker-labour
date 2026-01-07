const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Job = require('../models/JobJSON');
const User = require('../models/UserJSON');
const Attendance = require('../models/AttendanceJSON');
const Notification = require('../models/NotificationJSON');

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Fetch user to get their name
        const newJob = new Job({
            userId: req.user.id,
            farmerName: user.name, // Added farmerName
            title: req.body.title,
            date: req.body.date,
            workers: req.body.workers,
            cost: req.body.cost,
            description: req.body.description,
            location: req.body.location || 'Punjab', // Fallback or dynamic
            image: req.body.image, // Base64 image
            status: 'Active'
        });

        const job = await newJob.save();

        // Emit socket event to all connected clients (specifically for labourers)
        const io = req.app.get('io');
        io.emit('new-job', job);

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs
// @desc    Get all jobs for logged in user (FM)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.user.id });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/available
// @desc    Get all available jobs for Labour
// @access  Private
router.get('/available', auth, async (req, res) => {
    try {
        // Get all jobs
        const jobs = await Job.find({});
        // Filter: Status is Active AND Not assigned yet
        // In a real app we might filter by location relative to user, but for now just show all Available
        const availableJobs = jobs.filter(j => j.status === 'Active' && !j.assignedTo);
        res.json(availableJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/labour/active
// @desc    Get jobs assigned to logged in labour
// @access  Private
router.get('/labour/active', auth, async (req, res) => {
    try {
        const jobs = await Job.find({});
        const myActiveJobs = jobs.filter(j => j.assignedTo === req.user.id && j.status !== 'Completed');
        res.json(myActiveJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/labour/history
// @desc    Get all job history for logged in labour
// @access  Private
router.get('/labour/history', auth, async (req, res) => {
    try {
        const jobs = await Job.find({});
        const myJobs = jobs.filter(j => j.assignedTo === req.user.id);
        res.json(myJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/jobs/:id/status
// @desc    Update job status (Accept, Complete, etc.)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        console.log('Update Job Status Request:', { id: req.params.id, status, user: req.user.id });

        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // Logic check
        if (status === 'In Progress' && job.status === 'Active') {
            // Accepting job
            job.assignedTo = req.user.id;
            job.status = 'In Progress';
        } else if (status === 'Completed' && job.assignedTo === req.user.id) {
            job.status = 'Completed';
        } else {
            // Allow other updates? Or return error? 
            // For simplicity allow status update if user owns it OR is assigned it
            if (job.userId === req.user.id || job.assignedTo === req.user.id) {
                job.status = status;
            } else {
                return res.status(401).json({ msg: 'Not authorized' });
            }
        }

        await job.save();

        // Emit socket event to the farmer (job owner)
        const io = req.app.get('io');
        io.to(job.userId).emit('job-status-updated', job);

        // Create notification for farmer if accepted
        if (status === 'In Progress') {
            const labourer = await User.findById(req.user.id);
            const newNotif = new Notification({
                userId: job.userId,
                title: 'Job Accepted',
                message: `${labourer.name} has accepted your job: ${job.title}`,
                type: 'job'
            });
            await newNotif.save();
            io.to(job.userId).emit('new-notification', newNotif);
        }

        res.json(job);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/jobs/attendance
// @desc    Mark attendance via QR scan
// @access  Private (Farmer)
router.post('/attendance', auth, async (req, res) => {
    const { labourId } = req.body;
    try {
        const farmer = await User.findById(req.user.id);
        const labourer = await User.findById(labourId);

        if (!labourer) return res.status(404).json({ msg: 'Labourer not found' });

        // Record attendance permanently
        const newAttendance = new Attendance({
            farmerId: farmer.id,
            farmerName: farmer.name,
            labourId: labourer.id,
            labourName: labourer.name
        });
        await newAttendance.save();

        // Rapido Flow: Find the active job for this labourer and mark it as verified
        const allJobs = await Job.find({});
        const activeJob = allJobs.find(j =>
            j.assignedTo === labourId &&
            j.userId === farmer.id &&
            j.status === 'In Progress'
        );

        if (activeJob) {
            activeJob.verified = true;
            activeJob.arrivedAt = new Date();
            await activeJob.save();
            console.log(`Job ${activeJob.id} verified via QR scan`);
        }

        console.log(`Attendance saved: ${labourer.name} by ${farmer.name}`);

        // Create notification for labourer
        const io = req.app.get('io');
        const newNotif = new Notification({
            userId: labourId,
            title: 'Attendance Marked',
            message: `${farmer.name} marked your attendance. You can now start the work!`,
            type: 'job'
        });
        await newNotif.save();
        io.to(labourId).emit('new-notification', newNotif);

        // Also notify via specialized event for UI update
        if (activeJob) {
            io.to(labourId).emit('job-verified', activeJob);
        }

        res.json({
            success: true,
            msg: `Attendance marked for ${labourer.name}`,
            labourerName: labourer.name,
            jobVerified: !!activeJob
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
