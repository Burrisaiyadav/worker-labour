const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Payment = require('../models/PaymentJSON');
const Job = require('../models/JobJSON');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
});

// @route   POST api/payments/order
// @desc    Create a Razorpay order
// @access  Private
router.post('/order', auth, async (req, res) => {
    try {
        const { jobId, amount } = req.body;
        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: `receipt_${jobId}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/payments/verify
// @desc    Verify payment and update status
// @access  Private
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, jobId, payeeId, amount } = req.body;

        // Verify signature (Mocked for testing if keys are mock)
        if (process.env.RAZORPAY_KEY_ID) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ msg: "Invalid signature" });
            }
        }

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // Create payment record
        const payment = new Payment({
            payerId: req.user.id,
            payeeId: payeeId,
            amount: amount,
            status: 'Completed',
            details: `Razorpay Payment ID: ${razorpay_payment_id}`
        });
        await payment.save();

        job.paymentStatus = 'Paid';
        job.paymentId = payment.id;
        job.status = 'Completed';
        await job.save();

        res.json({ success: true, payment });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/payments/my
// @desc    Get current user's payments
// @access  Private
router.get('/my', auth, async (req, res) => {
    try {
        const payments = await Payment.find();
        const myPayments = payments.filter(p => p.payerId === req.user.id || p.payeeId === req.user.id);
        res.json(myPayments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
