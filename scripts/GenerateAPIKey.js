const crypto = require("crypto");

// Generate a 32-byte key (64 characters in hex)
const apiKey = crypto.randomBytes(32).toString("hex");
console.log(apiKey);
