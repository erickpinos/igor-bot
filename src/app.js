require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Setup
const BOT_TOKEN = process.env.BOT_TOKEN; // Load your bot token from .env
const CHAT_ID = process.env.CHAT_ID; // Load your chat ID from .env (can be empty)
const bot = new TelegramBot(BOT_TOKEN, { polling: true }); // Enable polling for message logging

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
