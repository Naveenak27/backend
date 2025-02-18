INSERT INTO email_templates (name, subject, body) VALUES
('Welcome Template', 'Welcome to Our Platform', 
'<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
    <div style="background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 5px;">
        <h1 style="color: white; margin: 0;">Welcome Aboard! 🚀</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 5px;">
        <h2 style="color: #4CAF50;">Hello {name},</h2>
        <p>We''re thrilled to have you join our platform! Get ready for an amazing journey with us.</p>
        <ul style="list-style-type: none; padding: 0;">
            <li style="margin: 10px 0;">✨ Explore our features</li>
            <li style="margin: 10px 0;">📚 Check out our documentation</li>
            <li style="margin: 10px 0;">🤝 Connect with the community</li>
        </ul>
        <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Get Started</a>
        </div>
    </div>
</div>'),

('Newsletter Template', 'Monthly Newsletter', 
'<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
    <div style="background-color: #2196F3; padding: 20px; text-align: center; border-radius: 5px;">
        <h1 style="color: white; margin: 0;">Monthly Newsletter 📰</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 5px;">
        <h2 style="color: #2196F3;">Latest Updates</h2>
        <div style="border-left: 4px solid #2196F3; padding-left: 15px; margin: 20px 0;">
            <h3>Feature Updates</h3>
            <p>We''ve added exciting new features this month!</p>
        </div>
        <div style="border-left: 4px solid #2196F3; padding-left: 15px; margin: 20px 0;">
            <h3>Community Highlights</h3>
            <p>Check out what our community has been up to.</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #2196F3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Read More</a>
        </div>
    </div>
</div>'),

('Meeting Invitation', 'Team Meeting Invitation', 
'<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
    <div style="background-color: #9C27B0; padding: 20px; text-align: center; border-radius: 5px;">
        <h1 style="color: white; margin: 0;">Team Meeting 📅</h1>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9; margin-top: 20px; border-radius: 5px;">
        <h2 style="color: #9C27B0;">Meeting Details</h2>
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Time:</strong> {time}</p>
            <p><strong>Location:</strong> {location}</p>
        </div>
        <p>Please join us for our upcoming team meeting where we''ll discuss:</p>
        <ul>
            <li>Project updates</li>
            <li>Quarterly goals</li>
            <li>Team collaboration</li>
        </ul>
        <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #9C27B0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">Add to Calendar</a>
        </div>
    </div>
</div>');