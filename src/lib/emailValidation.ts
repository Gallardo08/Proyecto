export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  
  // Validaciones adicionales
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  
  // Verificar que el dominio tenga al menos un punto y sea válido
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  
  // Verificar que la extensión tenga al menos 2 caracteres
  const extension = domainParts[domainParts.length - 1];
  if (extension.length < 2) return false;
  
  // Verificar que no haya puntos consecutivos
  if (domain.includes('..')) return false;
  
  // Verificar que el dominio no empiece o termine con punto
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  
  // Verificar que la parte local no esté vacía
  if (!localPart) return false;
  
  return true;
}
