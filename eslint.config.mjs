import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
    },
  },
  {
    // Серверные страницы рендерятся при запросе или пересборке ISR: чтение текущего времени здесь намеренное.
    files: ['src/app/(frontend)/**/page.tsx', 'src/app/(frontend)/**/view.tsx'],
    rules: { 'react-hooks/purity': 'off' },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'legacy/**', 'src/payload-types.ts', 'src/migrations/**', 'src/app/(payload)/admin/importMap.js', 'playwright-report/**', 'test-results/**', 'next-env.d.ts'],
  },
]

export default config
