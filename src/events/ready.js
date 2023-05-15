const { once } = require("../types/events");

module.exports = once(async function () {
  console.log("Ready!");
});
