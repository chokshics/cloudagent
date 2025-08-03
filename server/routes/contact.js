const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Contact form submission endpoint
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, requirements, to, subject } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !requirements) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Create email content
    const emailContent = `
      <h2>New Project Inquiry from Go AIz Website</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Requirements:</strong></p>
      <p>${requirements.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>This inquiry was submitted from the Go AIz Technologies website contact form.</em></p>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: to || 'sales@goaiz.com',
      subject: subject || 'New Project Inquiry from Go AIz Website',
      html: emailContent
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Inquiry sent successfully' 
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send inquiry. Please try again.' 
    });
  }
});

module.exports = router; 