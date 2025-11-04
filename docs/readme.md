Accept Payments

To accept a payment, create a transaction using our Paystack API, our client Javascript library, Popup JS, or our SDKs. Every transaction includes a link that can be used to complete payment.

Paystack Popup is a Javascript library that allow developers to build a secure and convenient payment flow for their web applications. You can add it to your frontend application via CDN, NPM or Yarn:

npm i @paystack/inline-js or use the inline javascrip below 
<script src="https://js.paystack.co/v2/inline.js">

    ******If you used NPM or Yarn, ensure you import the library as shown below:****
    import PaystackPop from '@paystack/inline-js';

With the library successfully installed, you can now begin the three-step integration process:

-Initialize transaction
-Complete transaction
-Verify transaction status

Initialize transaction
To get started, you need to initialize the transaction from your backend. Initializing the transaction from the backend ensures you have full control of the transaction details. To do this, make a POST request from your backend to the Initialize TransactionAPI endpoint: