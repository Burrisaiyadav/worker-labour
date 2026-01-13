const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const LabourGroup = require('../models/LabourGroupJSON');
const Notification = require('../models/NotificationJSON');
const User = require('../models/UserJSON');

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { name, rate, contact, location, image } = req.body;

        const newGroup = new LabourGroup({
            name,
            rate,
            contact,
            location,
            image,
            adminId: req.user.id,
            members: [req.user.id] // Admin is the first member
        });

        await newGroup.save();

        // Update user account type if it was individual
        const user = await User.findById(req.user.id);
        if (user && user.accountType !== 'group') {
            user.accountType = 'group';
            await user.save();
        }

        const io = req.app.get('io');
        if (io) io.emit('group-updated', newGroup);

        res.json(newGroup);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/groups/my-groups
// @desc    Get groups where user is a member or admin
// @access  Private
router.get('/my-groups', auth, async (req, res) => {
    try {
        const allGroups = await LabourGroup.find();
        const myGroups = allGroups.filter(g =>
            String(g.adminId) === String(req.user.id) ||
            (Array.isArray(g.members) && g.members.some(mId => String(mId) === String(req.user.id)))
        );
        res.json(myGroups);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/groups/:id/invite
// @desc    Invite a user to a group
// @access  Private (Admin only)
router.post('/:id/invite', auth, async (req, res) => {
    try {
        const group = (await LabourGroup.find()).find(g => g.id === req.params.id);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        if (group.adminId !== req.user.id) {
            return res.status(403).json({ msg: 'Only admin can invite members' });
        }

        const { userId } = req.body;
        if (group.members.includes(userId)) {
            return res.status(400).json({ msg: 'User is already a member' });
        }

        if (!group.pendingInvites) group.pendingInvites = [];
        if (group.pendingInvites.includes(userId)) {
            return res.status(400).json({ msg: 'Invitation already pending' });
        }

        group.pendingInvites.push(userId);
        const updatedGroup = new LabourGroup(group);
        await updatedGroup.save();

        // Send notification to invited user
        const notification = new Notification({
            userId,
            title: 'Group Invitation',
            message: `You have been invited to join the group "${group.name}".`,
            type: 'job', // Using job type for invitation for now
            metadata: { groupId: group.id } // Frontend will handle this
        });
        await notification.save();

        res.json({ msg: 'Invitation sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/groups/:id/accept
// @desc    Accept invitation to join a group
// @access  Private
router.post('/:id/accept', auth, async (req, res) => {
    try {
        const groups = await LabourGroup.find();
        const groupData = groups.find(g => g.id === req.params.id);
        if (!groupData) return res.status(404).json({ msg: 'Group not found' });

        const group = new LabourGroup(groupData);

        if (!group.pendingInvites || !group.pendingInvites.includes(req.user.id)) {
            return res.status(400).json({ msg: 'No pending invitation found' });
        }

        // Add to members and remove from pending
        group.members.push(req.user.id);
        group.pendingInvites = group.pendingInvites.filter(id => id !== req.user.id);

        await group.save();

        // Notify admin
        const adminNotification = new Notification({
            userId: group.adminId,
            title: 'Member Joined',
            message: `A new member has joined your group "${group.name}".`,
            type: 'info'
        });
        await adminNotification.save();

        res.json({ msg: 'Joined group successfully', group });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/groups/:id
// @desc    Delete a group
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const groups = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../data/labourGroups.json'), 'utf8'));
        const groupIndex = groups.findIndex(g => g.id === req.params.id);

        if (groupIndex === -1) return res.status(404).json({ msg: 'Group not found' });

        if (groups[groupIndex].adminId !== req.user.id) {
            return res.status(403).json({ msg: 'Only admin can delete group' });
        }

        await LabourGroup.delete(req.params.id);

        const io = req.app.get('io');
        if (io) io.emit('group-updated', { id: req.params.id, deleted: true });

        res.json({ msg: 'Group deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/groups/:id/join
// @desc    Request to join a group
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
    try {
        const groups = await LabourGroup.find();
        const groupData = groups.find(g => g.id === req.params.id);
        if (!groupData) return res.status(404).json({ msg: 'Group not found' });

        const group = new LabourGroup(groupData);

        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ msg: 'You are already a member' });
        }

        if (group.joinRequests && group.joinRequests.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Join request already pending' });
        }

        if (!group.joinRequests) group.joinRequests = [];
        group.joinRequests.push(req.user.id);
        await group.save();

        // Notify admin
        const adminNotification = new Notification({
            userId: group.adminId,
            title: 'New Join Request',
            message: `Someone wants to join your group "${group.name}".`,
            type: 'job',
            metadata: { groupId: group.id, requesterId: req.user.id }
        });
        await adminNotification.save();

        const io = req.app.get('io');
        if (io) io.emit('group-updated', group);

        res.json({ msg: 'Join request sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/groups/:id/approve
// @desc    Approve join request
// @access  Private (Admin only)
router.post('/:id/approve', auth, async (req, res) => {
    try {
        const groups = await LabourGroup.find();
        const groupData = groups.find(g => g.id === req.params.id);
        if (!groupData) return res.status(404).json({ msg: 'Group not found' });

        const group = new LabourGroup(groupData);
        if (group.adminId !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const { userId } = req.body;
        if (!group.joinRequests || !group.joinRequests.includes(userId)) {
            return res.status(400).json({ msg: 'No such join request' });
        }

        // Move from requests to members
        group.members.push(userId);
        group.joinRequests = group.joinRequests.filter(id => id !== userId);
        await group.save();

        // Notify user
        const notification = new Notification({
            userId,
            title: 'Group Request Approved',
            message: `Your request to join "${group.name}" has been approved!`,
            type: 'info',
            metadata: { groupId: group.id }
        });
        await notification.save();

        // CRITICAL: Update user account status to 'group'
        const user = await User.findById(userId);
        if (user && user.accountType !== 'group') {
            user.accountType = 'group';
            await user.save();
        }

        const io = req.app.get('io');
        if (io) io.emit('group-updated', group);

        res.json({ msg: 'User approved', group });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/groups/:id/reject
// @desc    Reject join request
// @access  Private (Admin only)
router.post('/:id/reject', auth, async (req, res) => {
    try {
        const groups = await LabourGroup.find();
        const groupData = groups.find(g => g.id === req.params.id);
        if (!groupData) return res.status(404).json({ msg: 'Group not found' });

        const group = new LabourGroup(groupData);
        if (group.adminId !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const { userId } = req.body;
        group.joinRequests = group.joinRequests.filter(id => id !== userId);
        await group.save();

        const io = req.app.get('io');
        if (io) io.emit('group-updated', group);

        res.json({ msg: 'Join request rejected' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/groups/pending-requests
// @desc    Get groups where user has a pending join request
// @access  Private
router.get('/pending-requests', auth, async (req, res) => {
    try {
        const allGroups = await LabourGroup.find();
        const pendingGroups = allGroups.filter(g =>
            Array.isArray(g.joinRequests) && g.joinRequests.some(rId => String(rId) === String(req.user.id))
        );
        res.json(pendingGroups);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
