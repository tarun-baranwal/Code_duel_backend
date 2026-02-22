/**
 * Email Test Script
 * Run: node test-email.js
 */

require("dotenv").config();

const { verifyEmailConfig, sendEmail } = require("./src/config/email");
const { 
  sendWelcomeEmail, 
  sendStreakReminder, 
  sendStreakBrokenNotification,
  sendWeeklySummary 
} = require("./src/services/email.service");

// Change this to the email you want to send to
const TEST_EMAIL = "25dit007@charusat.edu.in"; // <-- YAHAN DUSRE KA EMAIL DAALO!
const TEST_USERNAME = "HET BHIMANI";

async function testEmail() {
  console.log("\n🔧 Email Configuration Test\n");
  console.log("=".repeat(50));

  // Check config
  console.log("\n📋 Current Config:");
  console.log(`   SMTP Host: ${process.env.SMTP_HOST || "NOT SET"}`);
  console.log(`   SMTP Port: ${process.env.SMTP_PORT || "NOT SET"}`);
  console.log(`   SMTP User: ${process.env.SMTP_USER || "NOT SET"}`);
  console.log(`   SMTP Pass: ${process.env.SMTP_PASS ? "****" : "NOT SET"}`);
  console.log(`   Email Enabled: ${process.env.EMAIL_ENABLED || "NOT SET"}`);

  // Verify connection
  console.log("\n🔌 Verifying SMTP Connection...");
  const isVerified = await verifyEmailConfig();

  if (!isVerified) {
    console.log("\n❌ SMTP verification failed!");
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Check your SMTP credentials in .env");
    console.log("   2. For Gmail, use App Password (not regular password)");
    console.log("   3. Make sure 2FA is enabled on your Google account");
    return;
  }

  console.log("✅ SMTP Connection verified!\n");

  // Test 1: Simple email
  console.log("📧 Test 1: Sending simple test email...");
  const result1 = await sendEmail({
    to: TEST_EMAIL,
    subject: "🧪 Code Duel - Test Email",
    html: `
      <h1>Test Email</h1>
      <p>If you're reading this, your email configuration is working! 🎉</p>
      <p>Sent at: ${new Date().toISOString()}</p>
    `,
  });

  if (result1.success) {
    console.log(`   ✅ Simple email sent! Message ID: ${result1.messageId}`);
  } else {
    console.log(`   ❌ Failed: ${result1.reason}`);
  }

  // Test 2: Welcome email template
  console.log("\n📧 Test 2: Sending welcome email template...");
  const result2 = await sendWelcomeEmail(TEST_EMAIL, TEST_USERNAME);

  if (result2.success) {
    console.log(`   ✅ Welcome email sent! Message ID: ${result2.messageId}`);
  } else {
    console.log(`   ❌ Failed: ${result2.reason}`);
  }

  // Test 3: Streak Reminder email
  console.log("\n📧 Test 3: Sending streak reminder email...");
  const result3 = await sendStreakReminder(TEST_EMAIL, TEST_USERNAME, 7, "30 Days DSA Challenge");

  if (result3.success) {
    console.log(`   ✅ Streak reminder sent! Message ID: ${result3.messageId}`);
  } else {
    console.log(`   ❌ Failed: ${result3.reason}`);
  }

  // Test 4: Streak Broken notification
  console.log("\n📧 Test 4: Sending streak broken notification...");
  const result4 = await sendStreakBrokenNotification(TEST_EMAIL, TEST_USERNAME, 15, "30 Days DSA Challenge");

  if (result4.success) {
    console.log(`   ✅ Streak broken notification sent! Message ID: ${result4.messageId}`);
  } else {
    console.log(`   ❌ Failed: ${result4.reason}`);
  }

  // Test 5: Weekly Summary
  console.log("\n📧 Test 5: Sending weekly summary...");
  const mockStats = {
    weekStart: "Feb 15, 2026",
    weekEnd: "Feb 22, 2026",
    problemsSolved: 12,
    daysCompleted: 5,
    currentStreak: 7,
    longestStreak: 15,
    activeChallenges: [
      { name: "30 Days DSA Challenge", rank: 3, streak: 7, completionRate: 71 },
      { name: "LeetCode Daily", rank: 5, streak: 5, completionRate: 60 },
    ],
  };
  const result5 = await sendWeeklySummary(TEST_EMAIL, TEST_USERNAME, mockStats);

  if (result5.success) {
    console.log(`   ✅ Weekly summary sent! Message ID: ${result5.messageId}`);
  } else {
    console.log(`   ❌ Failed: ${result5.reason}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✨ Test complete! Check your inbox at:", TEST_EMAIL);
  console.log("   (Also check spam folder)\n");
}

// Run test
testEmail().catch(console.error);
