// Auth component exports

// SSR-safe auth components
export { default as SSRSafeAuthGuard } from './SSRSafeAuthGuard'
export {
  AuthRequired,
  AdminRequired,
  RoleRequired,
  AuthenticatedOnly,
  UnauthenticatedOnly,
  AdminOnly,
  RoleOnly
} from './SSRSafeAuthGuard'

// Client-only auth components
export { default as ClientOnlyAuth } from './ClientOnlyAuth'
export {
  useClientOnlyAuth,
  withClientOnlyAuth,
  ConditionalClientAuth
} from './ClientOnlyAuth'

// Auth guard patterns
export * from './AuthGuardPatterns'