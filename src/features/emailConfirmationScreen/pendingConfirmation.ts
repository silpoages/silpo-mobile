import type { Credentials } from '@/features/auth/services/authService';
import { ApiError } from '@/services/apiClient';

let pendingConfirmation: Credentials | null = null;

export function setPendingConfirmation(credentials: Credentials): void {
  pendingConfirmation = credentials;
}

export function getPendingConfirmation(): Credentials | null {
  return pendingConfirmation;
}

export function clearPendingConfirmation(): void {
  pendingConfirmation = null;
}

export function isEmailNotConfirmedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}
