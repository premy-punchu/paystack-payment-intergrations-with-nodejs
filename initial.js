/**
 * Node.js script to handle both Paystack transaction initialization and verification.
 *
 * This script MUST be run on a secure server (backend) as it uses the secret key.
 * The client (HTML/Browser) will call an endpoint on your server which runs 
 * the initializeTransaction function to safely get the transaction reference.
 *
 * IMPORTANT:
 * 1. Replace the 'PAYSTACK_SECRET_KEY' placeholder in the environment variables
 * with your actual Paystack secret key.
 */

const https = require('https');

// --- Configuration ---
// Get the Secret Key from environment variables for security
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_afa7b6cf9f69cf1bc9b188234bd86da347fba15e';

// Payment details for initialization
const customerEmail = "testuser@example.com";
// Amount in kobo (or the lowest denomination of your currency). 500000 kobo = NGN 5000.00
const transactionAmount = 500000;
// URL Paystack redirects the user to after payment attempt
const CALLBACK_URL = 'https://your-domain.com/paystack-callback'; 

/**
 * 1. Initializes a new transaction and gets the authorization URL/reference.
 */
function initializeTransaction() {
  console.log('--- 1. INITIALIZING TRANSACTION ---');

  const params = JSON.stringify({
    "email": customerEmail,
    "amount": transactionAmount,
    "callback_url": CALLBACK_URL
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': params.length
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const responseBody = JSON.parse(data);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(responseBody);
        if (responseBody.status && responseBody.data) {
          console.log('\n✅ Transaction initialized successfully!');
          console.log(`Authorization URL: ${responseBody.data.authorization_url}`);
          console.log(`Reference: ${responseBody.data.reference}`);
          // Server response to client would contain the 'reference' and 'public_key'
        } else {
          console.error('\n❌ Initialization failed:', responseBody.message);
        }
      } catch (e) {
        console.error('Failed to parse JSON response:', data);
      }
    });
  }).on('error', error => {
    console.error('\n❌ HTTPS Request Error during Initialization:', error.message);
  });

  req.write(params);
  req.end();
}


/**
 * 2. Verifies a transaction using the provided reference.
 * This is the crucial step to confirm payment.
 * @param {string} reference The transaction reference to verify.
 */
function verifyTransaction(reference) {
  console.log('\n--- 2. VERIFYING TRANSACTION ---');
  console.log(`Verification Reference: ${reference}`);

  if (!reference || reference === 'YOUR_REF_HERE') {
    console.error('Please provide a valid transaction reference to verify.');
    return;
  }

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    // The reference must be dynamically inserted into the path
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      // Use the securely loaded secret key
      Authorization: `Bearer ${SECRET_KEY}`
    }
  };

  const req = https.request(options, res => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const responseBody = JSON.parse(data);
        console.log(`Status Code: ${res.statusCode}`);
        console.log(responseBody);

        if (responseBody.status && responseBody.data && responseBody.data.status === 'success') {
          console.log(`\n🎉 Verification successful! Amount paid: NGN ${responseBody.data.amount / 100}.00`);
          // FULFILL THE ORDER HERE
        } else if (responseBody.status && responseBody.data) {
          console.warn(`\n⚠️ Transaction status is not 'success': ${responseBody.data.status}`);
        } else {
          console.error('\n❌ Verification failed or reference not found.', responseBody.message);
        }
      } catch (e) {
        console.error('Failed to parse JSON response:', data);
      }
    });
  }).on('error', error => {
    console.error('\n❌ HTTPS Request Error during Verification:', error.message);
  });

  req.end();
}

// --- Main Execution Flow ---
function main() {
    // This is a demonstration. In production, these functions would be
    // attached to separate server endpoints.

    // To test initialization:
    // initializeTransaction();

    // To test verification:
    const transactionReference = 'YOUR_REF_HERE';
    // verifyTransaction(transactionReference);
}

main();
