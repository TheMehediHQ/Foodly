import js from "@eslint/js";
import globals from "globals";

/**
 * Shared ESLint flat-config foundation for the Foodly monorepo.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.node=false]   Enable Node.js globals (e.g. require, process, __dirname).
 * @param {boolean} [opts.browser=false] Enable browser globals.
 * @param {boolean} [opts.jsx=false]    Enable JSX parsing.
 * @returns {Array<object>} ESLint flat config array.
 */
export default function foodlyConfig(opts = {}) {
  const { node = false, browser = false, jsx = false } = opts;

  const envGlobals = {
    ...(browser ? globals.browser : {}),
    ...(node ? globals.node : {}),
  };

  return [
    {
      ignores: [
        "dist",
        "node_modules",
        ".turbo",
        "build",
        ".next",
        "*.local",
        ".env*",
        "*.log",
        "firebase-debug.log*",
      ],
    },
    js.configs.recommended,
    {
      languageOptions: {
        ecmaVersion: 2022,
        sourceType: node ? "commonjs" : "module",
        parserOptions: {
          ecmaFeatures: { jsx },
        },
        globals: envGlobals,
      },
      rules: {
        ...js.configs.recommended.rules,
        "no-unused-vars": [
          "error",
          {
            varsIgnorePattern: "^[A-Z_]",
            argsIgnorePattern: "^[A-Z_]",
            ignoreRestSiblings: true,
          },
        ],
        "no-console": node ? "off" : "warn",
      },
    },
    {
      files: ["eslint.config.js", "*.mjs", "*.test.js"],
      languageOptions: {
        sourceType: "module",
      },
    },
  ];
}
