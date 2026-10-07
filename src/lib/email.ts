// Usado no navegador e no servidor para validar o e-mail da pesquisa.

/** Remove espaços e caracteres invisíveis que o teclado do celular costuma inserir. */
export function limparEmail(email: string): string {
  return email.replace(/[\s\u200B-\u200D\uFEFF]/g, "");
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limparEmail(email));
}
