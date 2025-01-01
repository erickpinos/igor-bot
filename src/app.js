require("dotenv").config(); // Load environment variables from .env
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Setup
const BOT_TOKEN = process.env.BOT_TOKEN; // Load your bot token from .env
const CHAT_ID = process.env.CHAT_ID; // Load your chat ID from .env
const bot = new TelegramBot(BOT_TOKEN, { polling: true }); // Enable polling for debugging/chat ID logging

// GitHub Webhook Secret
const GITHUB_SECRET = process.env.GITHUB_SECRET || "your_secret_key";

// Middleware to Capture Raw Body
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // Store raw body for signature verification
    },
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // Store raw body for signature verification
    },
  })
);

// Function to Verify GitHub Webhook Signature
const verifySignature = (req) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hash = `sha256=${crypto
    .createHmac("sha256", GITHUB_SECRET)
    .update(req.rawBody)
    .digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
};

// Webhook Endpoint for GitHub
app.post("/github-webhook", (req, res) => {
  console.log("Received webhook request");

  // Acknowledge GitHub immediately
  res.status(200).send("OK");
  console.log("Acknowledged webhook to GitHub");

  // Log headers and body for debugging
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  // Verify signature
  if (!verifySignature(req)) {
    console.log("Unauthorized request. Invalid signature.");
    return;
  }

  console.log("Signature verified");

  const event = req.headers["x-github-event"]; // Get the event type from the headers
  const payload =
    req.headers["content-type"] === "application/x-www-form-urlencoded"
      ? JSON.parse(req.body.payload)
      : req.body;

  console.log("Event type:", event);

  let message;

  try {
    switch (event) {
      case "push":
        if (payload.commits && payload.commits.length > 0) {
          const repoName = payload.repository.name;
          const pusher = payload.pusher.name;

          // Create a summary of commits
          message = `*Push Event in ${repoName}*\nPusher: ${pusher}`;
          payload.commits.forEach((commit) => {
            message += `\n\nCommit: ${commit.message}\nAuthor: ${commit.author.name}\n[View Commit](${commit.url})`;
          });
        } else {
          message = `*Push Event Detected* (No commits in this push)`;
        }
        break;

      case "pull_request":
        const pr = payload.pull_request;
        message = `*Pull Request Event*\nAction: ${payload.action}\nTitle: ${pr.title}\nAuthor: ${pr.user.login}\n[View Pull Request](${pr.html_url})`;
        break;

      case "issues":
        const issue = payload.issue;
        message = `*Issue Event*\nAction: ${payload.action}\nTitle: ${issue.title}\nAuthor: ${issue.user.login}\n[View Issue](${issue.html_url})`;
        break;

      case "star":
        const repo = payload.repository;
        message = `*Star Event*\nUser: ${payload.sender.login} starred the repository ${repo.name}\n[View Repository](${repo.html_url})`;
        break;

      default:
        message = `*Unhandled Event: ${event}*\nPayload: ${JSON.stringify(payload, null, 2)}`;
        break;
    }

    if (message) {
      console.log("Sending message to Telegram:", message);
      bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" })
        .then(() => {
          console.log(`Notification sent for ${event} event.`);
        })
        .catch((error) => {
          console.error("Failed to send Telegram message:", error.message);
        });
    }
  } catch (error) {
    console.error("Error processing webhook:", error.message);
  }
});

// Chat ID Logging (for setup/debugging purposes)
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
