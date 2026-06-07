export type E2EUser = {
  email: string;
  password: string;
};

const allowDefaultAdmin =
  process.env.E2E_ALLOW_DEFAULT_ADMIN === 'true' || process.env.CI !== 'true';

export function getAdminUser(): E2EUser {
  const email = process.env.E2E_ADMIN_EMAIL || (allowDefaultAdmin ? 'admin@example.com' : '');
  const password = process.env.E2E_ADMIN_PASSWORD || (allowDefaultAdmin ? 'admin123' : '');

  if (!email || !password) {
    throw new Error(
      'Missing E2E admin credentials. Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD, or set E2E_ALLOW_DEFAULT_ADMIN=true for a seeded environment.',
    );
  }

  return { email, password };
}
