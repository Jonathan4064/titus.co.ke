// BACKEND IMPLEMENTATION (Node.js with Express)
// File: server.js
// This implements the STK push for phone number 0790652803

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const moment = require('moment');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables (store these in a .env file)
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'your_consumer_key';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || 'your_passkey';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || 'your_shortcode';
const CALLBACK_URL = process.env.CALLBACK_URL || 'https://example.com/api/mpesa/callback';

// Generate Access Token
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
};

// STK Push Endpoint
app.post('/api/mpesa/stk-push', async (req, res) => {
  try {
    const { amount, phoneNumber = '0790652803', accountReference, transactionDesc } = req.body;
    
    // Format phone number (remove leading zero and add country code)
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = '254' + phoneNumber.substring(1);
    }
    
    // Generate timestamp
    const timestamp = moment().format('YYYYMMDDHHmmss');
    
    // Generate password (base64 of shortcode + passkey + timestamp)
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // STK Push request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: accountReference || 'Tito\'s Foundation Donation',
        TransactionDesc: transactionDesc || 'Donation to Tito\'s Foundation'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Send response back to client
    res.status(200).json({
      success: true,
      message: 'STK push sent successfully',
      data: response.data
    });
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate STK push',
      error: error.response?.data || error.message
    });
  }
});

// Callback URL endpoint
app.post('/api/mpesa/callback', (req, res) => {
  const { Body } = req.body;
  
  console.log('M-Pesa Callback Data:', JSON.stringify(Body, null, 2));
  
  // Acknowledge receipt of callback
  res.status(200).json({
    ResultCode: 0,
    ResultDesc: 'Callback received successfully'
  });
  
  // Process callback data
  if (Body.stkCallback.ResultCode === 0) {
    // Payment successful
    console.log('Payment successful');
    
    // Here you would typically update your database
    // and possibly send a notification to the user
  } else {
    // Payment failed
    console.log('Payment failed:', Body.stkCallback.ResultDesc);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// FRONTEND IMPLEMENTATION (React/JavaScript)
// File: STKPushForm.jsx

import React, { useState } from 'react';
import axios from 'axios';

const STKPushForm = () => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('0790652803');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // Validate inputs
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Please enter a valid phone number');
      }
      
      // Send STK push request
      const res = await axios.post('http://localhost:5000/api/mpesa/stk-push', {
        amount: parseFloat(amount),
        phoneNumber,
        accountReference: 'Tito Foundation',
        transactionDesc: 'Donation'
      });
      
      setResponse(res.data);
      
      // Reset form if successful
      if (res.data.success) {
        setAmount('');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">M-Pesa Payment</h2>
      
      {response && response.success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>STK push sent successfully! Check your phone.</p>
          <p className="text-sm mt-1">Request ID: {response.data.CheckoutRequestID}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-gray-700 font-medium mb-2">
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter M-Pesa number e.g. 0790652803"
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">
            Using fixed number: 0790652803
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
            Amount (KES)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            min="1"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default STKPushForm;


// STANDALONE JAVASCRIPT VERSION (for quick testing)
// File: stkPush.js

// This version can be run directly with Node.js without needing a full server setup
const axios = require('axios');
const moment = require('moment');

// Configuration - replace with your actual credentials
const config = {
  consumerKey: 'your_consumer_key',
  consumerSecret: 'your_consumer_secret',
  passkey: 'your_passkey',
  shortcode: 'your_shortcode',
  callbackUrl: 'https://example.com/api/mpesa/callback',
  phoneNumber: '0790652803',
  amount: 1 // Minimum amount for testing
};

// Format phone number
const formatPhoneNumber = (phone) => {
  if (phone.startsWith('0')) {
    return '254' + phone.substring(1);
  }
  return phone;
};

// Get access token
const getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
};

// Initiate STK Push
const initiateSTKPush = async () => {
  try {
    // Generate timestamp
    const timestamp = moment().format('YYYYMMDDHHmmss');
    
    // Generate password
    const password = Buffer.from(
      `${config.shortcode}${config.passkey}${timestamp}`
    ).toString('base64');
    
    // Get access token
    const accessToken = await getAccessToken();
    console.log('Access token obtained');
    
    // Prepare phone number
    const formattedPhone = formatPhoneNumber(config.phoneNumber);
    
    // STK Push request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: config.amount,
        PartyA: formattedPhone,
        PartyB: config.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: config.callbackUrl,
        AccountReference: 'Test Payment',
        TransactionDesc: 'Test Payment to 0790652803'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('STK Push Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    throw error;
  }
};

// Run the function if this script is executed directly
if (require.main === module) {
  initiateSTKPush()
    .then((result) => {
      console.log('STK Push sent successfully!');
      console.log('CheckoutRequestID:', result.CheckoutRequestID);
    })
    .catch((error) => {
      console.error('Failed to send STK Push');
    });
}

module.exports = { initiateSTKPush };