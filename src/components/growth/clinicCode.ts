/**
 * Clinic code format and checksum (pure, testable; no network).
 *
 * A code is 5–12 characters from [0-9A-Z]; dashes are allowed for readability and ignored
 * (`KBB-ANK-17X` ≡ `KBBANK17X`). The LAST character is a mod-36 checksum of the body:
 *   checksum = Σ value(c_i) × (i + 1)  (mod 36), i = 0-based position in the body, value in base 36.
 * Entering a code does not contact any server; it only attributes this installation to the clinic locally.
 */
export const CLINIC_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const CLINIC_BODY_MIN = 4;
export const CLINIC_BODY_MAX = 11;

/** Upper-case and drop everything except [0-9A-Z]. Turkish dotless/dotted i are folded to I. */
export function normalizeClinicCode(input: string): string {
  return input.replace(/ı/g, 'i').replace(/İ/g, 'I').toUpperCase().replace(/[^0-9A-Z]/g, '');
}

export function clinicChecksumChar(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) sum += CLINIC_ALPHABET.indexOf(body[i]) * (i + 1);
  return CLINIC_ALPHABET[((sum % 36) + 36) % 36];
}

/** True when the (normalised) code has a valid length and its last char matches the checksum. */
export function isValidClinicCode(input: string): boolean {
  const code = normalizeClinicCode(input);
  const body = code.slice(0, -1);
  if (body.length < CLINIC_BODY_MIN || body.length > CLINIC_BODY_MAX) return false;
  if ([...code].some((c) => CLINIC_ALPHABET.indexOf(c) < 0)) return false;
  return clinicChecksumChar(body) === code[code.length - 1];
}

/** Founder tooling: append the checksum to a body such as "KBBANK17" → "KBBANK17X". */
export function makeClinicCode(body: string): string {
  const b = normalizeClinicCode(body);
  if (b.length < CLINIC_BODY_MIN || b.length > CLINIC_BODY_MAX) throw new Error('clinic code body must be 4–11 characters');
  return b + clinicChecksumChar(b);
}

/** Display form: groups of 3–4 separated by dashes, e.g. KBBANK17X → KBB-ANK-17X. */
export function formatClinicCode(code: string): string {
  const c = normalizeClinicCode(code);
  const parts: string[] = [];
  for (let i = 0; i < c.length; i += 3) parts.push(c.slice(i, i + 3));
  if (parts.length > 1 && parts[parts.length - 1].length === 1) {
    const last = parts.pop()!;
    parts[parts.length - 1] += last;
  }
  return parts.join('-');
}
