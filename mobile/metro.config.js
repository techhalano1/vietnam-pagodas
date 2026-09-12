const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
// The website's JSON datasets live one level up; share them instead of duplicating.
const dataRoot = path.resolve(projectRoot, "../src/data");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [...(config.watchFolders ?? []), dataRoot];

module.exports = config;
