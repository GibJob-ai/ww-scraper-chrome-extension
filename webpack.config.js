const path = require("path");
module.exports = {
  entry: "./src/payload.js",
  output: {
    filename: "payload.js",
    path: path.resolve(__dirname, "dist")
  }
};
