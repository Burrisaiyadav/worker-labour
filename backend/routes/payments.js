const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Payment = require('../models/PaymentJSON');

// @route   POST /api/payments
// @desc    Process a new payment
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { payeeId, amount, details } = req.body;

        const newPayment = new Payment({
            payerId: req.user.id,
            payeeId,
            amount,
            details
        });

        const payment = await newPayment.save();
        res.json({ success: true, payment });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
