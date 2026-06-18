export default [
  {
    files: ["src/**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: (await import("typescript-eslint")).parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "@typescript-eslint": (await import("typescript-eslint")).plugin
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-explicit-any": "off"
    }
  }
];
