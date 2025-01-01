const express = require("express");
const router = express.Router();
const { sendMessage } = require("../services/telegram");
const verifySignature = require("../utils/verifySignature");
const { CHAT_ID, GITHUB_SECRET } = require("../config/settings");

router.post("/github-webhook", (req, res) => {
  if (!verifySignature(req, GITHUB_SECRET)) {
    return res.status(403).send("Unauthorized");
  }

  const payload = req.body;
  if (payload.commits && payload.commits.length > 0) {
    const repoName = payload.repository.name;
    payload.commits.forEach((commit) => {
      const message = `
*New Commit to ${repoName}!*
Author: ${commit.author.name}
Message: ${commit.message}
[View Commit](${commit.url})
      `;
      sendMessage(CHAT_ID, message);
    });
  }

  res.status(200).send("OK");
});

module.exports = router;
