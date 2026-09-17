import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { Logo } from "@/components/logo";

async function authenticate(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-brand-border bg-brand-bg-elevated p-8 shadow-xl">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <h1 className="mb-1 text-center text-lg font-semibold text-brand-text">
          Acessar o sistema
        </h1>
        <p className="mb-6 text-center text-sm text-brand-text-muted">
          Entre com seu e-mail e senha
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            E-mail ou senha inválidos.
          </p>
        )}

        <form action={authenticate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-brand-text-muted">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-brand-text outline-none focus:border-brand-orange"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-brand-text-muted">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-brand-text outline-none focus:border-brand-orange"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-hover"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
