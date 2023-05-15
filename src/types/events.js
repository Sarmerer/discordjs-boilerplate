module.exports = {
  once(handler) {
    return {
      method: "once",
      handler,
    };
  },

  on(handler) {
    return {
      method: "on",
      handler,
    };
  },
};
