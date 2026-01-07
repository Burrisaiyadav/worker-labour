const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Notification = require('../models/NotificationJSON');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });

        // Ensure user owns notification
        if (notification.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id });
        for (const notif of notifications) {
            if (!notif.read) {
                notif.read = true;
                await notif.save();
            }
        }
        res.json({ msg: 'All marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/notifications (Internal/Dev Use)
// @desc    Create notification
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;

        if (!userId) {
            return res.status(400).json({ msg: 'Target userId is required' });
        }

        console.log(`Creating notification from ${req.user.id} to ${userId}: ${title}`);

        const newNotif = new Notification({
            userId: userId,
            title,
            message,
            type
        });
        await newNotif.save();

        // Socket Broadcast
        const io = req.app.get('io');
        if (io) {
            console.log(`Emitting notification to room ${userId}`);
            io.to(userId).emit('new-notification', newNotif);
        }

        res.json(newNotif);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
