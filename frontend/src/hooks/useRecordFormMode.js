/**
 * Distinguishes create (/resource/new), read-only view (/resource/:id), and edit (/resource/:id/edit).
 */
import { useParams, useLocation } from 'react-router-dom';

export function useRecordFormMode() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const isEditRoute = pathname.endsWith('/edit');
  const hasRecordId = Boolean(id);
  const readOnly = hasRecordId && !isEditRoute;
  const isCreate = !hasRecordId;
  return { id, readOnly, isEditRoute, isCreate };
}
