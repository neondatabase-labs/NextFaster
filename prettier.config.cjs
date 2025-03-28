/** @typedef  {import("prettier").Config} PrettierConfig */

/** @type { PrettierConfig | SortImportsConfig } */
const config = {
  semi: true,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
};

module.exports = config;
