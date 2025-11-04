/**
 * Full Paystack Integration Backend (Express + Axios)
 * ---------------------------------------------------
 * 1. Initializes payments securely from your server
 * 2. Verifies payments
 * 3. Handles Paystack webhooks (optional)
 * 4. Serves a simple frontend for testing
 *
 * Setup:
 *   npm install express axios dotenv body-parser
 *   node server.js
 */

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// =========================
// 🔐 Configuration
// =========================
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY not set in .env");

const CALLBACK_URL = 'http://localhost:3000/api/paystack/verify'; // Adjust for production

// =========================
// 🏠 Homepage
// =========================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =========================
// 1️⃣ Initialize Transaction
// =========================
app.post('/api/paystack/initialize', async (req, res) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: 'Email and amount are required.' });
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount, // amount in kobo
        callback_url: CALLBACK_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('❌ Initialization error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// =========================
// 2️⃣ Verify Transaction
// =========================
app.get('/api/paystack/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) return res.status(400).json({ error: 'Reference required' });

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${SECRET_KEY}` },
      }
    );

    const data = response.data;
    console.log('Verification result:', data);

    if (data.status && data.data.status === 'success') {
      console.log(`🎉 Payment successful! ₦${data.data.amount / 100}`);
    }

    res.json(data);
  } catch (err) {
    console.error('❌ Verification error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// =========================
// 3️⃣ Webhook (optional)
// =========================
app.post('/api/paystack/webhook', (req, res) => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  const signature = req.headers['x-paystack-signature'];
  if (hash !== signature) {
    console.warn('⚠️ Invalid webhook signature!');
    return res.sendStatus(400);
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    console.log('🎉 Webhook: Payment success for', event.data.reference);
  }

  res.sendStatus(200);
});

// =========================
// 🚀 Start Server
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
