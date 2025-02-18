const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced payload handling
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Allowed origins
const allowedOrigins = [
  'https://eclectic-kheer-b99991.netlify.app/',
  'https://eclectic-kheer-b99991.netlify.app', // without trailing slash
  'http://localhost:3000',
  'https://backend-production-1051.up.railway.app'
];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Configure Nodemailer
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

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { from, to, cc, subject, body } = req.body;

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

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    res.status(200).json({
      success: true,
      messageId: info.messageId,
      details: {
        to: mailOptions.to,
        cc: mailOptions.cc,
        subject: mailOptions.subject
      }
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email service configured for: ${process.env.EMAIL_USER}`);
});