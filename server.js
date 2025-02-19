const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced payload handling with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration with multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://eclectic-kheer-b99991.netlify.app'
];

app.use(cors({
  origin: '*',  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Configure Nodemailer with secure settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

// Email sending endpoint with enhanced error handling
app.post('/api/send-email', async (req, res) => {
  try {
    const { from, to, cc, subject, body } = req.body;

    // Enhanced email configuration
    const mailOptions = {
      from: process.env.EMAIL_USER,
      replyTo: from,
      to: to.split(',').map(email => email.trim()),
      cc: cc ? cc.split(',').map(email => email.trim()) : [],
      subject: subject || 'No Subject',
      html: body,
      attachDataUrls: true,
      alternatives: [{
        contentType: 'text/html; charset=utf-8',
        content: body
      }]
    };

    // Send email with detailed response
    const info = await transporter.sendMail(mailOptions);
    
    res.status(200).json({
      success: true,
      messageId: info.messageId,
      details: {
        to: mailOptions.to,
        cc: mailOptions.cc,
        subject: mailOptions.subject,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Email Service',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: err.message,
    timestamp: new Date().toISOString()
  });
});

// Server initialization with environment info
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✨ Server running on port ${PORT}`);
  console.log(`📧 Email service configured for: ${process.env.EMAIL_USER}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
