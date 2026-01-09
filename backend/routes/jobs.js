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

        if (status === 'In Progress' && job.status === 'Active') {
            job.assignedTo = req.user.id;
            job.status = 'In Progress';
        } else if (status === 'Completed' && (String(job.assignedTo) === String(req.user.id) || myGroups.some(gId => String(gId) === String(job.assignedTo)))) {
            job.status = 'Completed';
        } else {
            if (String(job.userId) === String(req.user.id) || String(job.assignedTo) === String(req.user.id) || myGroups.some(gId => String(gId) === String(job.assignedTo))) {
                job.status = status;
            } else {
                return res.status(401).json({ msg: 'Not authorized' });
            }
        }

        await job.save();
        const io = req.app.get('io');
        io.to(job.userId).emit('job-status-updated', job);

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
            j.status === 'In Progress'
        );

        if (activeJob) {
            activeJob.verified = true;
            activeJob.arrivedAt = new Date();
            await activeJob.save();
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

module.exports = router;
