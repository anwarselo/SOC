module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  parserOptions: { ecmaVersion: 2023 },
  ignorePatterns: [".next/", "node_modules/", "out/", "dist/", "build/"],
  rules: {
    "import/order": ["warn", { "newlines-between": "always" }]
  }
}