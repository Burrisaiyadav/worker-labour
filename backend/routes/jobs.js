const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Job = require('../models/JobJSON');
const User = require('../models/UserJSON');
const Attendance = require('../models/AttendanceJSON');
const Notification = require('../models/NotificationJSON');
const LabourGroup = require('../models/LabourGroupJSON');

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const newJob = new Job({
            userId: req.user.id,
            farmerName: user.name,
            title: req.body.title,
            date: req.body.date,
            workers: req.body.workers,
            cost: req.body.cost,
            description: req.body.description,
            location: req.body.location || 'Punjab',
            image: req.body.image,
            status: 'Active'
        });

        const job = await newJob.save();
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
        const jobs = await Job.find({});
        const availableJobs = jobs.filter(j => j.status === 'Active' && !j.assignedTo);
        res.json(availableJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/labour/active
// @desc    Get jobs assigned to logged in labour or their groups
// @access  Private
router.get('/labour/active', auth, async (req, res) => {
    try {
        const allGroups = await LabourGroup.find();
        const myGroups = allGroups.filter(g =>
            String(g.adminId) === String(req.user.id) ||
            (Array.isArray(g.members) && g.members.some(mId => String(mId) === String(req.user.id)))
        ).map(g => String(g.id));

        const jobs = await Job.find({});
        const myActiveJobs = jobs.filter(j =>
            (String(j.assignedTo) === String(req.user.id) || myGroups.some(gId => String(gId) === String(j.assignedTo))) &&
            j.status !== 'Completed'
        );
        res.json(myActiveJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/labour/history
// @desc    Get all job history for logged in labour or their groups
// @access  Private
router.get('/labour/history', auth, async (req, res) => {
    try {
        const allGroups = await LabourGroup.find();
        const myGroups = allGroups.filter(g =>
            String(g.adminId) === String(req.user.id) ||
            (Array.isArray(g.members) && g.members.some(mId => String(mId) === String(req.user.id)))
        ).map(g => String(g.id));

        const jobs = await Job.find({});
        const myJobs = jobs.filter(j =>
            String(j.assignedTo) === String(req.user.id) ||
            myGroups.some(gId => String(gId) === String(j.assignedTo))
        );
        res.json(myJobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/jobs/:id/status
// @desc    Update job status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        const allGroups = await LabourGroup.find();
        const myGroups = allGroups.filter(g =>
            String(g.adminId) === String(req.user.id) ||
            (Array.isArray(g.members) && g.members.some(mId => String(mId) === String(req.user.id)))
        ).map(g => String(g.id));

        const isFarmer = String(job.userId) === String(req.user.id);
        const isAssigned = String(job.assignedTo) === String(req.user.id) || myGroups.some(gId => String(gId) === String(job.assignedTo));

        if (status === 'In Progress' && job.status === 'Active') {
            job.assignedTo = req.user.id;
            job.status = 'In Progress';
        } else if (isFarmer || isAssigned) {
            // Allow farmer or assigned labourer to update status (e.g. Arrived, Working, Completed)
            job.status = status;
        } else {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await job.save();
        const io = req.app.get('io');
        if (io) {
            io.to(job.userId).emit('job-status-updated', job);
            if (job.assignedTo) {
                io.to(job.assignedTo).emit('job-status-updated', job);
            }
        }

        if (isFarmer) {
            // Notify labourer about status update from farmer
            if (job.assignedTo) {
                const newNotif = new Notification({
                    userId: job.assignedTo,
                    title: 'Job Updated',
                    message: `Farmer ${job.farmerName} updated job "${job.title}" status to ${status}.`,
                    type: 'job'
                });
                await newNotif.save();
                if (io) io.to(job.assignedTo).emit('new-notification', newNotif);
            }
        } else if (status === 'In Progress') {
            const labourer = await User.findById(req.user.id);
            const newNotif = new Notification({
                userId: job.userId,
                title: 'Job Accepted',
                message: `${labourer.name} has accepted your job: ${job.title}`,
                type: 'job'
            });
            await newNotif.save();
            if (io) io.to(job.userId).emit('new-notification', newNotif);
        }

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/jobs/attendance
// @access  Private (Farmer)
router.post('/attendance', auth, async (req, res) => {
    const { labourId } = req.body;
    try {
        const farmer = await User.findById(req.user.id);
        const labourer = await User.findById(labourId);
        if (!labourer) return res.status(404).json({ msg: 'Labourer not found' });

        const newAttendance = new Attendance({
            farmerId: farmer.id,
            farmerName: farmer.name,
            labourId: labourer.id,
            labourName: labourer.name
        });
        await newAttendance.save();

        const allJobs = await Job.find({});
        const activeJob = allJobs.find(j =>
            String(j.assignedTo) === String(labourId) &&
            String(j.userId) === String(farmer.id) &&
            (j.status === 'In Progress' || j.status === 'Accepted')
        );

        if (activeJob) {
            activeJob.verified = true;
            activeJob.arrivedAt = new Date();
            activeJob.status = 'Arrived'; // Set status to Arrived upon scan
            await activeJob.save();

            const io = req.app.get('io');
            if (io) {
                io.to(activeJob.userId).emit('job-status-updated', activeJob);
                io.to(activeJob.assignedTo).emit('job-status-updated', activeJob);
            }
        }

        const io = req.app.get('io');
        const newNotif = new Notification({
            userId: labourId,
            title: 'Attendance Marked',
            message: `${farmer.name} marked your attendance.`,
            type: 'job'
        });
        await newNotif.save();
        io.to(labourId).emit('new-notification', newNotif);

        if (activeJob) {
            io.to(labourId).emit('job-verified', activeJob);
        }

        res.json({ success: true, msg: `Attendance marked for ${labourer.name}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/jobs/:id
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

// @route   POST /api/jobs/:id/request-payment
// @desc    Request payment for a job
// @access  Private
router.post('/:id/request-payment', auth, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // Update job
        job.paymentRequested = true;
        await job.save();

        const sender = await User.findById(req.user.id);

        // Create notification for farmer
        const newNotif = new Notification({
            userId: job.userId,
            title: 'Payment Requested',
            message: `${sender.name} has requested payment for "${job.title}".`,
            type: 'payment_request',
            metadata: { jobId: job.id, amount: job.cost }
        });
        await newNotif.save();

        // Socket Broadcast to farmer
        const io = req.app.get('io');
        if (io) {
            io.to(job.userId).emit('new-notification', newNotif);
            io.to(job.userId).emit('job-status-updated', job);
            io.to(req.user.id).emit('job-status-updated', job); // Notify labourer too
        }

        res.json({ success: true, job });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/jobs/:id/rate
// @desc    Rate a completed job
// @access  Private (Farmer)
router.post('/:id/rate', auth, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        if (String(job.userId) !== String(req.user.id)) {
            return res.status(401).json({ msg: 'Not authorized to rate this job' });
        }

        if (job.status !== 'Completed') {
            return res.status(400).json({ msg: 'Only completed jobs can be rated' });
        }

        job.rating = rating;
        job.ratingComment = comment || '';
        await job.save();

        if (job.assignedTo) {
            // Check if assignedTo is a Group or User
            const group = (await LabourGroup.find()).find(g => String(g.id) === String(job.assignedTo));
            if (group) {
                // Update Group Rating
                const currentRating = group.rating || 0;
                const currentCount = group.ratingCount || 0;
                const newCount = currentCount + 1;
                // Weighted average: (currentAvg * currentCount + newRating) / newCount
                group.rating = Number(((currentRating * currentCount + rating) / newCount).toFixed(1));
                group.ratingCount = newCount;
                await group.save();

                // Also update admin's rating (optional, but good for visibility)
                const admin = await User.findById(group.adminId);
                if (admin) {
                    admin.rating = group.rating;
                    admin.ratingCount = (admin.ratingCount || 0) + 1;
                    await admin.save();
                }
            } else {
                // Update Individual User Rating
                const worker = await User.findById(job.assignedTo);
                if (worker) {
                    const currentRating = worker.rating || 0;
                    const currentCount = worker.ratingCount || 0;
                    const newCount = currentCount + 1;
                    worker.rating = Number(((currentRating * currentCount + rating) / newCount).toFixed(1));
                    worker.ratingCount = newCount;
                    await worker.save();
                }
            }
        }

        res.json({ success: true, job });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
