const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/payload.js",
  output: {
    filename: "payload.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [new Dotenv()],
};
