import { auth } from "@/auth";
import { changePassword } from "@/lib/actions/account";
import { PageHeader, Card, Input, Field, Button } from "@/components/ui";

const ERROR_MESSAGES: Record<string, string> = {
  campos: "Preencha todos os campos.",
  curta: "A nova senha precisa ter pelo menos 6 caracteres.",
  confirmacao: "A confirmação não bate com a nova senha.",
  atual: "Senha atual incorreta.",
};

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;
  const session = await auth();

  return (
    <div>
      <PageHeader title="Minha conta" description="Dados de acesso e senha." />

      <Card className="max-w-md">
        <p className="mb-1 text-sm text-foreground-muted">Nome</p>
        <p className="mb-4 text-sm font-medium text-foreground">{session?.user?.name}</p>
        <p className="mb-1 text-sm text-foreground-muted">E-mail</p>
        <p className="mb-6 text-sm font-medium text-foreground">{session?.user?.email}</p>

        <h2 className="mb-4 text-sm font-semibold text-foreground">Trocar senha</h2>

        {success && (
          <p className="mb-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            Senha alterada com sucesso.
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {ERROR_MESSAGES[error] ?? "Não foi possível trocar a senha."}
          </p>
        )}

        <form action={changePassword} className="flex flex-col gap-3">
          <Field label="Senha atual *">
            <Input name="currentPassword" type="password" required autoComplete="current-password" />
          </Field>
          <Field label="Nova senha *">
            <Input name="newPassword" type="password" required minLength={6} autoComplete="new-password" />
          </Field>
          <Field label="Confirmar nova senha *">
            <Input name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" />
          </Field>
          <Button type="submit" className="mt-1 self-start">
            Salvar nova senha
          </Button>
        </form>
      </Card>
    </div>
  );
}
