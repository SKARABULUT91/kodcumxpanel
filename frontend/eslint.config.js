/**
 * SNR ENGINE V2 - ESLint Configuration
 * Path: C:\Users\SONER\Desktop\SNR_ENGINE_V2\frontend\eslint.config.js
 */
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "build", "test/setup.ts"] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022, // Daha modern özellikler için güncellendi
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Kullanılmayan değişkenler için uyarı ver ama alt tire (_) ile başlayanları görmezden gel
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      // Tip güvenliğini artırmak için 'any' kullanımında uyarı ver
      "@typescript-eslint/no-explicit-any": "warn",
      // React Hook'ları için ek güvenlik
      "react-hooks/exhaustive-deps": "warn",
    },
  },
);