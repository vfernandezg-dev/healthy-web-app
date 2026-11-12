/** Texto para buscar sin distinguir mayúsculas ni tildes («María» encuentra «maria»). */
export function searchable(text: string | null | undefined): string {
  return (text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .trim();
}

/** Si `haystack` contiene `needle`, sin distinguir mayúsculas ni tildes. Una búsqueda vacía lo encuentra todo. */
export function matches(haystack: string, needle: string): boolean {
  return searchable(haystack).includes(searchable(needle));
}
