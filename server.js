// const express = require('express');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const app = express();

// // Enhanced payload handling
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // CORS configuration
// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Enable pre-flight requests
// app.options('*', cors());

// // Local database connection
// const pool = mysql.createPool({
//   host: '127.0.0.1',  // Use this instead of localhost
//   user: 'root',
//   password: '',
//   database: 'emailtemplate',
//   port: 3306,
//   waitForConnections: true,
//   connectionLimit: 10
// });
// // Add error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json({
//     error: err.message || 'Internal Server Error',
//     details: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// // Database connection check
// pool.getConnection()
//   .then(connection => {
//     console.log('Database Connected Successfully!');
//     connection.release();
//   })
//   .catch(err => {
//     console.log('Database Connection Failed:', err);
//   });

// // Initialize database
// // Initialize database
// async function initializeDatabase() {
//   try {
//     const connection = await pool.getConnection();
    
//     // Create database
//     await connection.query('CREATE DATABASE IF NOT EXISTS emailtemplate');
    
//     // Switch to the database
//     await connection.query('USE emailtemplate');
    
//     // Create table
//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS email_templates (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         subject VARCHAR(255),
//         body TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//       )
//     `);
    
//     connection.release();
//     console.log('Database initialized successfully');
//   } catch (error) {
//     console.error('Database initialization failed:', error);
//   }
// }


const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

// Enhanced payload handling
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration - Update with your Railway frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable pre-flight requests
app.options('*', cors());

// Railway database connection configuration
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'metro.proxy.rlwy.net',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'railway',
  port: parseInt(process.env.MYSQLPORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create table
    await connection.query(`
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
