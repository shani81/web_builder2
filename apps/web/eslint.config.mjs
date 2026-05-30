import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * Next.js 16 ships native flat configs, so we spread them directly
 * (no FlatCompat bridge needed).
 */
const config = [
  { ignores: ['.next/**', 'node_modules/**'] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
