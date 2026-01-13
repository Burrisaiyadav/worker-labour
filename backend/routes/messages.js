const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Fixed path
const Message = require('../models/MessageJSON');
const User = require('../models/UserJSON');

// @route   GET api/messages/conversations
// @desc    Get list of conversations for current user
// @access  Private
router.get('/conversations', auth, async (req, res) => {
    try {
        const messages = await Message.find({});
        const myUserId = req.user.id;

        // Find all messages involving current user
        const myMessages = messages.filter(m => m.senderId === myUserId || m.receiverId === myUserId);

        // Get unique other users
        const otherUserIds = [...new Set(myMessages.map(m => m.senderId === myUserId ? m.receiverId : m.senderId))];

        const conversations = await Promise.all(otherUserIds.map(async (otherId) => {
            const user = await User.findById(otherId);
            const userHistory = myMessages.filter(m => m.senderId === otherId || m.receiverId === otherId);
            const lastMsg = userHistory[userHistory.length - 1];

            return {
                id: otherId,
                name: user ? user.name : 'Unknown User',
                otherId: otherId,
                lastMsg: lastMsg ? lastMsg.content : '',
                type: lastMsg ? lastMsg.type : 'text',
                time: lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
                unread: userHistory.filter(m => m.receiverId === myUserId && !m.read).length
            };
        }));

        res.json(conversations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/:otherId
// @desc    Get message history with another user
// @access  Private
router.get('/:otherId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            senderId: req.user.id,
            receiverId: req.params.otherId
        });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/messages/:otherId
// @desc    Send a message (REST fallback)
// @access  Private
router.post('/:otherId', auth, async (req, res) => {
    try {
        const { content, type, replyTo, isForwarded } = req.body;
        const Message = require('../models/MessageJSON');
        const newMessage = new Message({
            senderId: req.user.id,
            receiverId: req.params.otherId,
            content,
            type: type || 'text',
            replyTo,
            isForwarded
        });
        await newMessage.save();

        // Emit via socket if available
        const io = req.app.get('io');
        if (io) {
            io.to(req.user.id).to(req.params.otherId).emit('receive-message', newMessage);
        }

        res.json(newMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/messages/message/:id
// @desc    Delete a specific message
// @access  Private
router.delete('/message/:id', auth, async (req, res) => {
    try {
        const message = await Message.find({}); // This is inefficient but model doesn't have findById
        const found = message.find(m => m.id === req.params.id);

        if (!found) return res.status(404).json({ msg: 'Message not found' });
        if (found.senderId !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });

        await Message.deleteById(req.params.id);

        // Notify client via socket
        const io = req.app.get('io');
        if (io) {
            io.to(found.senderId).to(found.receiverId).emit('message-deleted', req.params.id);
        }

        res.json({ msg: 'Message deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/messages/:otherId
// @desc    Clear message history with another user
// @access  Private
router.delete('/:otherId', auth, async (req, res) => {
    try {
        await Message.deleteMany({
            senderId: req.user.id,
            receiverId: req.params.otherId
        });
        res.json({ msg: 'Chat cleared' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
