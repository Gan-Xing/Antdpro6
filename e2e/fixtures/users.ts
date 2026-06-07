export type E2EUser = {
  email: string;
  password: string;
};

export function getAdminUser(): E2EUser {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing E2E admin credentials. Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for the target environment.',
    );
  }

  return { email, password };
}
