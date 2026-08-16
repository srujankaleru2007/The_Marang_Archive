/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    // Enforce no implicit any (mirrors tsconfig)
    "@typescript-eslint/no-explicit-any": "error",

    // Enforce unused variables are flagged
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],

    // Prevent empty catch blocks (Rules.md C8)
    "no-empty": ["error", { allowEmptyCatch: false }],

    // Import ordering
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
  overrides: [
    {
      // Plain JS / JSX files — disable TS-only rules
      files: ["*.js", "*.jsx", "*.cjs", "*.mjs"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-require-imports": "off",
        "import/no-unresolved": "off",
      },
    },
    {
      // React / JSX files
      files: ["*.jsx", "*.tsx"],
      env: { browser: true },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    {
      // Package stubs — relax import/no-unresolved since packages aren't built yet
      files: ["packages/*/src/**/*.ts"],
      rules: {
        "import/no-unresolved": "off",
      },
    },
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
