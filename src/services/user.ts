const STUB_DELAY_MS = 600;

export async function deleteCurrentUser(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, STUB_DELAY_MS));
}
