/**
 * Tenant context from auth. tenantId is set from JWT after login.
 */
import { useAuth } from '../context/AuthContext';

export function useTenant() {
  const { tenantId, user } = useAuth();
  return { tenantId, tenantName: user?.tenantId ? undefined : undefined };
}
