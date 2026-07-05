import UsuarioForm from "@/components/UsuarioForm";

export default function NovoUsuarioPage() {
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
