/**
 * Genera un ID único que funciona en cualquier navegador y contexto
 * Formato: timestamp + random = "la2b5k9mn4x7z"
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36); // Base36 del timestamp
  const randomPart = Math.random().toString(36).substring(2, 11); // 9 caracteres random
  return timestamp + randomPart;
}

/**
 * Valida si un string es un ID válido (formato esperado)
 */
export function isValidId(id: string): boolean {
  // ID válido: 8-17 caracteres alfanuméricos (base36)
  return /^[a-z0-9]{8,17}$/i.test(id);
} 