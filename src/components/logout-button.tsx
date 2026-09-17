import { signOut } from "@/auth";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-brand-text-muted transition-colors hover:bg-brand-bg-elevated hover:text-brand-text"
      >
        Sair
      </button>
    </form>
  );
}
