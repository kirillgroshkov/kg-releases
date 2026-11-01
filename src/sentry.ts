// Lazy-loaded by error.ts. Named imports (instead of `import('@sentry/browser')`) keep the chunk
// tree-shakeable: a dynamic namespace import would bundle every export (replay, feedback, tracing...)
export { captureException, init, setUser } from '@sentry/browser'
