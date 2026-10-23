/**
 * Hachage des mots de passe avec PBKDF2-SHA256 (Web Crypto API).
 *
 * Le mot de passe n'est jamais enregistré : seul un « hash » dérivé avec un sel
 * aléatoire est conservé. Même en lisant le localStorage, on ne retrouve pas
 * le mot de passe d'origine.
 */

const ITERATIONS = 210_000 // recommandation OWASP pour PBKDF2-SHA256
const KEY_LENGTH_BITS = 256
const SALT_BYTES = 16

export type PasswordHash = {
  algo: "PBKDF2-SHA256"
  iterations: number
  salt: string // base64
  hash: string // base64
}

function toBase64(bytes: Uint8Array): string {
  let binary = ""
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0))
}

function getSubtle(): SubtleCrypto {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Le chiffrement n'est pas disponible : ouvrez CineScope en HTTPS ou sur localhost.")
  }
  return globalThis.crypto.subtle
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const subtle = getSubtle()
  const key = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"])
  const bits = await subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, KEY_LENGTH_BITS)
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derive(password, salt, ITERATIONS)
  return { algo: "PBKDF2-SHA256", iterations: ITERATIONS, salt: toBase64(salt), hash: toBase64(hash) }
}

/** Comparaison en temps constant pour ne pas laisser deviner le hash octet par octet. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const computed = await derive(password, fromBase64(stored.salt), stored.iterations)
  return constantTimeEqual(computed, fromBase64(stored.hash))
}

export type PasswordCheck = { score: 0 | 1 | 2 | 3 | 4; label: string; errors: string[] }

/** Règles minimales et indicateur de robustesse affiché à l'inscription. */
export function checkPassword(password: string, context: string[] = []): PasswordCheck {
  const errors: string[] = []
  if (password.length < 8) errors.push("au moins 8 caractères requis")
  if (!/[a-zA-Z]/.test(password)) errors.push("au moins une lettre requise")
  if (!/\d/.test(password)) errors.push("au moins un chiffre requis")
  const lowered = password.toLowerCase()
  if (context.some(word => word.length >= 3 && lowered.includes(word.toLowerCase()))) {
    errors.push("ne doit pas contenir votre pseudo ou votre e-mail")
  }

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++
  if (errors.length) score = Math.min(score, 1)

  const labels = ["Très faible", "Faible", "Correct", "Bon", "Excellent"]
  return { score: score as PasswordCheck["score"], label: labels[score], errors }
}
