

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Enhanced payload handling
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
// Update this section in your server.js

// Updated CORS configuration
app.use(cors({
  origin: '*',  // This will allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: false
}));

// Enable pre-flight for all routes
app.options('*', cors());

// Add headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
// Enable pre-flight requests
app.options('*', cors());

// Updated database connection
const pool = mysql.createPool({
  host: process.env.RAILWAY_PRIVATE_DOMAIN,
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: 'railway',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: true
});

// Add this connection test
pool.getConnection((err, connection) => {
  if (err) {
    console.log('Database Connection Details:', {
      host: process.env.RAILWAY_PRIVATE_DOMAIN,
      database: 'railway'
    });
    console.log('Connection Error:', err);
  } else {
    console.log('Database Connected Successfully!');
    connection.release();
  }
});
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
// Database connection pool
// Update your database pool configuration

// Add this logging to track the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.log('Database Connection Failed! Bad Config: ', err);
  } else {
    console.log('Database Connected Successfully!');
    connection.release();
  }
});

// Initialize database
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

initializeDatabase();

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
// Updated CORS configuration
app.use(cors());
app.use(express.json());

// Add these headers to all responses
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
// Routes
app.get('/api/templates', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM email_templates ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM email_templates WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Failed to fetch template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

app.post('/api/seed-templates', async (req, res) => {
  try {
    const templates = [
      {
        name: 'Welcome Email',
        subject: 'Welcome to Our Platform',
        body: `
        
<h1>Welcome to Our Newsletter!</h1>

<p>Dear Valued Customer,</p>

<div style="color: #444;">
  <p>We're excited to share our latest updates with you:</p>
  
  <ul>
    <li>🚀 <strong>New Product Launch</strong> - Check out our latest innovation</li>
    <li>💡 <strong>Tips & Tricks</strong> - Maximize your productivity</li>
    <li>🎉 <strong>Special Offer</strong> - 25% off for early birds</li>
  </ul>

  <blockquote style="border-left: 4px solid #ccc; padding-left: 15px; margin: 15px 0;">
    "Success is not final, failure is not fatal: it is the courage to continue that counts."
  </blockquote>

  <h2>Featured Items</h2>
  
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
    <p>✨ <strong>Premium Package</strong></p>
    <p>Includes:</p>
    <ul>
      <li>24/7 Support</li>
      <li>Advanced Features</li>
      <li>Priority Access</li>
    </ul>
  </div>

  <p>For more information, visit our <a href="https://example.com">website</a>.</p>
</div>

<p style="color: #666;">Best regards,<br>
The Team</p>
            
            `
      },
      {
        name: 'Monthly Newsletter',
        subject: 'Your Monthly Update',
        body: `
<!-- Welcome Email Template -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #2C3E50; text-align: center; border-bottom: 2px solid #3498DB; padding-bottom: 10px;">
        🌟 Welcome to [Company Name]!
    </h1>
    
    <p style="color: #34495E; font-size: 16px;">Dear [Name],</p>
    
    <div style="background: linear-gradient(to right, #E8F4F8, #D4E6F1); padding: 20px; border-radius: 10px;">
        <p style="margin: 0;">We're thrilled to have you join our community!</p>
    </div>

    <div style="margin: 20px 0;">
        <h2 style="color: #2980B9;">Getting Started</h2>
        <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;">
                <span style="background: #3498DB; color: white; padding: 2px 8px; border-radius: 12px; margin-right: 10px;">1</span>
                Complete your profile
            </li>
            <li style="margin: 10px 0;">
                <span style="background: #3498DB; color: white; padding: 2px 8px; border-radius: 12px; margin-right: 10px;">2</span>
                Explore our features
            </li>
            <li style="margin: 10px 0;">
                <span style="background: #3498DB; color: white; padding: 2px 8px; border-radius: 12px; margin-right: 10px;">3</span>
                Connect with others
            </li>
        </ul>
    </div>
</div>
            
            `
      },
      {
        name: 'promotional template',
        subject: 'promotional',
        body: `
<!-- Promotional Email Template -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(45deg, #FF416C, #FF4B2B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">🔥 Flash Sale!</h1>
        <p style="font-size: 24px; margin: 10px 0;">50% OFF Everything</p>
        <p style="font-size: 18px;">Limited Time Only</p>
    </div>

    <div style="padding: 20px; background: #fff; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #FF416C;">SAVE50</span>
            <p>Use code at checkout</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="color: #FF416C; margin: 0;">Premium Plan</h3>
                <p style="font-size: 24px; margin: 10px 0;">$49.99</p>
                <p style="text-decoration: line-through; color: #666;">$99.99</p>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="color: #FF416C; margin: 0;">Basic Plan</h3>
                <p style="font-size: 24px; margin: 10px 0;">$24.99</p>
                <p style="text-decoration: line-through; color: #666;">$49.99</p>
            </div>
        </div>
    </div>
</div>
            
            `
      },
      {
        name: 'promotional template',
        subject: 'promotional',
        body: `
<!-- Promotional Email Template -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(45deg, #FF416C, #FF4B2B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">🔥 Flash Sale!</h1>
        <p style="font-size: 24px; margin: 10px 0;">50% OFF Everything</p>
        <p style="font-size: 18px;">Limited Time Only</p>
    </div>

    <div style="padding: 20px; background: #fff; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #FF416C;">SAVE50</span>
            <p>Use code at checkout</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="color: #FF416C; margin: 0;">Premium Plan</h3>
                <p style="font-size: 24px; margin: 10px 0;">$49.99</p>
                <p style="text-decoration: line-through; color: #666;">$99.99</p>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="color: #FF416C; margin: 0;">Basic Plan</h3>
                <p style="font-size: 24px; margin: 10px 0;">$24.99</p>
                <p style="text-decoration: line-through; color: #666;">$49.99</p>
            </div>
        </div>
    </div>
</div>
            
            `
      }
,      {
  name: 'event template',
  subject: 'Your invited',
  body: `
<!-- Event Invitation Template -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(120deg, #84fab0, #8fd3f4); padding: 40px; text-align: center; border-radius: 15px;">
        <h1 style="color: #fff; margin: 0; font-size: 32px;">You're Invited! 🎉</h1>
        <p style="color: #fff; font-size: 20px; margin: 10px 0;">Annual Tech Conference 2024</p>
    </div>

    <div style="padding: 30px; background: #fff; border-radius: 15px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
                <p style="margin: 0; color: #666;">Save the Date</p>
                <h2 style="margin: 5px 0; color: #2C3E50;">March 15, 2024</h2>
                <p style="margin: 0; color: #666;">9:00 AM - 5:00 PM</p>
            </div>
        </div>

        <h3 style="color: #2C3E50; text-align: center;">Featured Speakers</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: #e9ecef; border-radius: 50%; margin: 0 auto;"></div>
                <p style="margin: 5px 0; font-weight: bold;">John Doe</p>
                <p style="margin: 0; color: #666; font-size: 14px;">CEO, Tech Co</p>
            </div>
            <!-- Add more speakers similarly -->
        </div>
    </div>
</div>
      `
}



    ];

    for (const template of templates) {
      await pool.execute(
        'INSERT INTO email_templates (name, subject, body) VALUES (?, ?, ?)',
        [template.name, template.subject, template.body]
      );
    }

    res.json({ message: 'Templates added successfully' });
  } catch (error) {
    console.error('Failed to seed templates:', error);
    res.status(500).json({ error: 'Failed to seed templates' });
  }
});

app.post('/api/templates', async (req, res) => {
  const { name, subject, body } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO email_templates (name, subject, body) VALUES (?, ?, ?)',
      [name, subject, body]
    );
    res.status(201).json({ id: result.insertId, name, subject, body });
  } catch (error) {
    console.error('Failed to create template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

app.put('/api/templates/:id', async (req, res) => {
  const { name, subject, body } = req.body;
  try {
    await pool.execute(
      'UPDATE email_templates SET name = ?, subject = ?, body = ? WHERE id = ?',
      [name, subject, body, req.params.id]
    );
    res.json({ id: req.params.id, name, subject, body });
  } catch (error) {
    console.error('Failed to update template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM email_templates WHERE id = ?', [req.params.id]);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

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

    const info = await transporter.sendMail(mailOptions);
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
