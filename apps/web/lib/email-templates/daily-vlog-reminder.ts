export function getDailyVlogReminderTemplate(params: {
  displayName: string;
  appUrl: string;
}) {
  const { displayName, appUrl } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Vlog Reminder</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
    }
    .logo {
      max-width: 150px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .button {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${appUrl}/logo2.webp" alt="Olly Logo" class="logo">
    </div>
    <div class="content">
      <h1>Hi ${displayName},</h1>
      <p>We noticed you haven't created your daily vlog entry yet today.</p>
      <p>Taking a few minutes to reflect on your day can help you stay mindful and track your progress over time.</p>
      <p>Your daily vlog is a great way to:</p>
      <ul>
        <li>Reflect on your achievements</li>
        <li>Process your thoughts and feelings</li>
        <li>Set intentions for tomorrow</li>
        <li>Build a meaningful journal over time</li>
      </ul>
      <div style="text-align: center;">
        <a href="${appUrl}/dashboard/daily-vlog" class="button">Create Your Entry Now</a>
      </div>
      <p>Remember, you can choose to enhance your entry with AI (for 0.5 credits) or create it as-is (for free).</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Olly. All rights reserved.</p>
      <p>If you no longer wish to receive these reminders, you can disable them in your daily vlog settings.</p>
    </div>
  </div>
</body>
</html>
  `;
} 