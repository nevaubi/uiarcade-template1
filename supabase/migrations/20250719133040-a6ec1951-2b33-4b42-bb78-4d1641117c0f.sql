-- Add default email configurations for the new email types
INSERT INTO public.email_configs (config_type, enabled, template_subject, from_name, template_html) VALUES 
(
  'welcome_email2',
  true,
  'Welcome to our premium platform!',
  'Our Team',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Email 2</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
    <h1 style="color: #333333; text-align: center;">Welcome to Our Premium Platform!</h1>
    <p style="color: #666666; line-height: 1.6;">
      Hello [USER_NAME],
    </p>
    <p style="color: #666666; line-height: 1.6;">
      Thank you for joining our premium platform! We''re excited to have you on board.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="[DASHBOARD_URL]" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Get Started
      </a>
    </div>
    <p style="color: #666666; line-height: 1.6;">
      Best regards,<br>
      The Team
    </p>
  </div>
</body>
</html>'
),
(
  'new_subscription',
  true,
  'Your subscription is now active!',
  'Our Team',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Subscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
    <h1 style="color: #333333; text-align: center;">Subscription Activated!</h1>
    <p style="color: #666666; line-height: 1.6;">
      Hello [USER_NAME],
    </p>
    <p style="color: #666666; line-height: 1.6;">
      Your subscription has been successfully activated. You now have access to all premium features.
    </p>
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <h3 style="color: #333333; margin: 0 0 10px 0;">Subscription Details:</h3>
      <p style="color: #666666; margin: 5px 0;">Plan: [SUBSCRIPTION_PLAN]</p>
      <p style="color: #666666; margin: 5px 0;">Next billing: [NEXT_BILLING_DATE]</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="[DASHBOARD_URL]" style="background-color: #28a745; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Access Premium Features
      </a>
    </div>
    <p style="color: #666666; line-height: 1.6;">
      Best regards,<br>
      The Team
    </p>
  </div>
</body>
</html>'
),
(
  'new_subscription2',
  true,
  'Welcome to your new subscription tier!',
  'Our Team',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Subscription 2</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
    <h1 style="color: #333333; text-align: center;">Welcome to Your New Tier!</h1>
    <p style="color: #666666; line-height: 1.6;">
      Hello [USER_NAME],
    </p>
    <p style="color: #666666; line-height: 1.6;">
      Congratulations on upgrading to our enhanced subscription tier! You now have access to even more powerful features.
    </p>
    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #2196f3;">
      <h3 style="color: #333333; margin: 0 0 10px 0;">What''s New:</h3>
      <ul style="color: #666666; margin: 0; padding-left: 20px;">
        <li>Enhanced AI capabilities</li>
        <li>Priority support</li>
        <li>Advanced analytics</li>
        <li>Custom integrations</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="[DASHBOARD_URL]" style="background-color: #2196f3; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Explore New Features
      </a>
    </div>
    <p style="color: #666666; line-height: 1.6;">
      Best regards,<br>
      The Team
    </p>
  </div>
</body>
</html>'
);