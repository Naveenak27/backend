const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Configure Nodemailer with Gmail SMTP
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

// Enhanced error handling for email endpoint
app.post('/api/send-email', async (req, res) => {
    try {
      const { from, to, cc, subject, body } = req.body;
  
      // Create mail options with explicit CC handling
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to.split(',').map(email => email.trim()),
        cc: cc ? cc.split(',').map(email => email.trim()) : [], // Handle multiple CC recipients
        subject: subject || 'No Subject', // Default subject if empty
        html: body,
        replyTo: from
      };
  
      // Log the mail options for verification
      console.log('Sending email with options:', {
        to: mailOptions.to,
        cc: mailOptions.cc,
        subject: mailOptions.subject
      });
  
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
        error: error.message
      });
    }
  });
  
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
