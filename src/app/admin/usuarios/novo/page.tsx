import UsuarioForm from "@/components/UsuarioForm";

export default function NovoUsuarioPage() {
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Novo Usuário</h1>
      <UsuarioForm />
    </div>
  );
}
