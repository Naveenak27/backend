const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced payload handling for images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Updated CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'https://backend-production-1051.up.railway.app', 'https://railway.app', 'https://eclectic-kheer-b99991.netlify.app/'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Updated headers middleware
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'https://backend-production-1051.up.railway.app', 'https://railway.app', 'https://eclectic-kheer-b99991.netlify.app/'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    
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

        // Verification logging
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
