const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Job = require('../models/JobJSON');

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const newJob = new Job({
            userId: req.user.id,
            title: req.body.title,
            date: req.body.date,
            workers: req.body.workers,
            cost: req.body.cost,
            description: req.body.description,
            location: req.body.location, // Added location
            status: 'Active'
        });

        const job = await newJob.save();
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
        res.json(job);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
