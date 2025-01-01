const crypto = require("crypto");

const verifySignature = (req, secret) => {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hash = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
};

module.exports = verifySignature;
