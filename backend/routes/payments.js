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

// @route   GET /api/payments/wallet
// @desc    Get user wallet balance and transactions
// @access  Private
router.get('/wallet', auth, async (req, res) => {
    try {
        const payments = await Payment.find({});
        const userId = req.user.id;

        // Filter payments involving this user
        const userPayments = payments.filter(p => p.payerId === userId || p.payeeId === userId);

        let balance = 0;
        const transactions = userPayments.map(p => {
            const isCredit = p.payeeId === userId;
            if (isCredit) {
                balance += parseFloat(p.amount);
            } else {
                balance -= parseFloat(p.amount);
            }
            return {
                id: p.id,
                type: isCredit ? 'credit' : 'debit',
                amount: p.amount,
                date: p.createdAt,
                desc: p.details || 'Payment',
                from: isCredit ? p.payerId : 'Self' // In real app, fetch name
            };
        });

        // Current balance (assuming initial 0). 
        // Note: Real apps use transaction ledger. Here simply summing all history.

        res.json({
            balance,
            transactions: transactions.reverse() // Newest first
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
