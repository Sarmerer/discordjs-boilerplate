const { once } = require(".");

module.exports = once(async function () {
  console.log("Ready!");
});
