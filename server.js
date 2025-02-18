const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced payload handling for images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors({
    origin: ['http://localhost:3000', 'backend-production-1051.up.railway.app', 'https://railway.app'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight requests
app.options('*', cors());

// Headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

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

// Enhanced email endpoint with image handling
app.post('/api/send-email', async (req, res) => {
    try {
        const { from, to, cc, subject, body } = req.body;

        // Enhanced mail options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to.split(',').map(email => email.trim()),
            cc: cc ? cc.split(',').map(email => email.trim()) : [],
            subject: subject || 'No Subject',
            html: body,
            replyTo: from,
            attachDataUrls: true,
            alternatives: [{
                contentType: 'text/html; charset=utf-8',
                content: body
            }]
        };

        // Verification logging
        console.log('Sending email with options:', {
            to: mailOptions.to,
            cc: mailOptions.cc,
            subject: mailOptions.subject
        });

        // Send email with enhanced image support
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
