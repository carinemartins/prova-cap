import { getServerSession } from "@/lib/auth";
import UsuarioForm from "@/components/UsuarioForm";

export const dynamic = "force-dynamic";

export default async function NovoUsuarioPage() {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-white/40">
        Acesso restrito a administradores.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>Novo usuário</h1>
        <p className="text-sm text-white/40 mt-1">Adicione um novo acesso à área administrativa</p>
      </div>
      <UsuarioForm />
    </div>
  );
}
