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
// @desc    Get all jobs for logged in user
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

module.exports = router;
