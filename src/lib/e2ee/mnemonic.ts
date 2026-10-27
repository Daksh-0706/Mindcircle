/**
 * BIP-39 mnemonic handling — the same algorithm as every wallet implements,
 * over the generated `wordlist.ts`. 16 random bytes become exactly 12 words;
 * decode verifies the 4-bit checksum so typos fail loudly instead of
 * "successfully" deriving a wrong key.
 */

import { BIP39_WORDLIST } from './wordlist'
import { sha256 } from './crypto'

const WORD_TO_INDEX = new Map<string, number>(BIP39_WORDLIST.map((w, i) => [w, i]))

/** 16 bytes -> 12 words (BIP-39: 128-bit entropy, 4-bit checksum). */
export async function entropyToMnemonic(entropy: Uint8Array): Promise<string[]> {
  if (entropy.length !== 16) throw new Error('Recovery phrase needs exactly 128 bits of entropy')
  const hash = await sha256(entropy)

  const bits: number[] = []
  for (const b of entropy) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1)
  for (let i = 0; i < 4; i++) bits.push((hash[0] >> (7 - i)) & 1)

  const words: string[] = []
  for (let i = 0; i < bits.length; i += 11) {
    let index = 0
    for (let j = 0; j < 11; j++) index = (index << 1) | bits[i + j]
    words.push(BIP39_WORDLIST[index])
  }
  return words
}

/** Words -> 16 bytes, or an error when a word/checksum fails. */
export async function mnemonicToEntropy(words: string[]): Promise<Uint8Array> {
  if (words.length !== 12) throw new Error('A recovery phrase is exactly 12 words')
  const bits: number[] = []
  for (const raw of words) {
    const w = raw.toLowerCase().trim()
    const index = WORD_TO_INDEX.get(w)
    if (index === undefined) throw new Error(`Not a recovery word: ${raw.trim()}`)
    for (let i = 10; i >= 0; i--) bits.push((index >> i) & 1)
  }
  if (bits.length !== 132) throw new Error('Malformed recovery phrase')

  const entropy = new Uint8Array(16)
  for (let i = 0; i < 128; i++) entropy[i >> 3] |= bits[i] << (7 - (i % 8))
  const checksum = bits.slice(128)

  const hash = await sha256(entropy)
  for (let i = 0; i < 4; i++) {
    const want = (hash[0] >> (7 - i)) & 1
    if (checksum[i] !== want) throw new Error('One word is wrong (checksum mismatch)')
  }
  return entropy
}

export function randomEntropy(): Uint8Array {
  const out = new Uint8Array(16)
  crypto.getRandomValues(out)
  return out
}

export async function generateMnemonic(): Promise<string[]> {
  return entropyToMnemonic(randomEntropy())
}

export async function mnemonicFromText(input: string): Promise<string[]> {
  const words = input
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  await mnemonicToEntropy(words) // throws on typos/checksum
  return words
}

export function isWord(input: string): boolean {
  return WORD_TO_INDEX.has(input.toLowerCase().trim())
}
