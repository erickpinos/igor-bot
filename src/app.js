require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Setup
const BOT_TOKEN = process.env.BOT_TOKEN; // Load your bot token from .env
const CHAT_ID = process.env.CHAT_ID; // Load your chat ID from .env (can be empty)
const bot = new TelegramBot(BOT_TOKEN, { polling: true }); // Enable polling for message logging

// GitHub Webhook Secret
const GITHUB_SECRET = process.env.GITHUB_SECRET || "your_secret_key";

// Middleware to Parse JSON Body
app.use(bodyParser.json());

// Function to Verify GitHub Webhook Signature
const verifySignature = (req) => {
    const signature = req.headers["x-hub-signature-256"];
    if (!signature) return false;
  
    const hash = `sha256=${crypto
      .createHmac("sha256", GITHUB_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex")}`;
  
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
  };

  // Webhook Endpoint for GitHub
app.post("/github-webhook", async (req, res) => {
    if (!verifySignature(req)) {
      console.log("Unauthorized request. Invalid signature.");
      return res.status(403).send("Unauthorized");
    }
  
    const payload = req.body;
  
    if (payload.commits && payload.commits.length > 0) {
      const repoName = payload.repository.name;
      const pusher = payload.pusher.name;
  
      for (const commit of payload.commits) {
        const message = `
  *New Commit in ${repoName}!*
  Pusher: ${pusher}
  Author: ${commit.author.name}
  Message: ${commit.message}
  [View Commit](${commit.url})
        `;
        try {
          await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
          console.log("Commit notification sent to Telegram.");
        } catch (error) {
          console.error("Failed to send Telegram message:", error.message);
        }
      }
    } else {
      console.log("No commits found in the webhook payload.");
    }
  
    res.status(200).send("OK");
  });
  
bot.on("message", (msg) => {
  console.log("Chat ID:", msg.chat.id); // Logs the Chat ID of the sender
  console.log("Message received:", msg.text); // Logs the message content
});
console.log("Chat ID logging is enabled. Send a message to the bot on Telegram to see your Chat ID.");

// Function to send a test message to the specified CHAT_ID
const sendTestMessage = async () => {
  if (!CHAT_ID) {
    console.log("CHAT_ID is not set. Skipping test message.");
    return;
  }
  try {
    await bot.sendMessage(CHAT_ID, "🚀 Server is up and running on port " + PORT);
    console.log("Test Telegram message sent successfully!");
  } catch (error) {
    console.error("Failed to send Telegram message:", error.message);
  }
};

// Start Express Server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await sendTestMessage(); // Send Telegram message after the server starts (if CHAT_ID is set)
});
