const path = require("path");

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    include: [
      path.resolve(__dirname, "../src"),
      path.resolve(__dirname, "../stories"),
    ]
    // loader: require.resolve("ts-loader")
  });
  config.resolve.extensions.push(".ts", ".tsx");

  return config;
};
