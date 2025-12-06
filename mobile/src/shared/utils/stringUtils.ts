// src/shared/utils/stringUtils.ts
// Meslektaş Design System - String Utilities
// Oku: mobile-development-guide/ui-ux-modernization/14-SPRINT-IMPLEMENTATION-PLAN.md

/**
 * Truncate text with ellipsis
 *
 * @example
 * truncate('Meslektaş uygulaması', 10) // "Meslektaş…"
 */
export function truncate(text: string, maxLength: number, suffix: string = '…'): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Truncate in the middle of text
 *
 * @example
 * truncateMiddle('very_long_filename.pdf', 15) // "very_l…me.pdf"
 */
export function truncateMiddle(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  const charsToShow = maxLength - 1;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return text.slice(0, frontChars) + '…' + text.slice(-backChars);
}

/**
 * Capitalize first letter
 *
 * @example
 * capitalize('merhaba') // "Merhaba"
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 *
 * @example
 * capitalizeWords('merhaba dünya') // "Merhaba Dünya"
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Convert to title case (for Turkish)
 *
 * @example
 * titleCase('MERHABA DÜNYA') // "Merhaba Dünya"
 */
export function titleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}

/**
 * Convert to slug format
 *
 * @example
 * slugify('Merhaba Dünya!') // "merhaba-dunya"
 */
export function slugify(text: string): string {
  if (!text) return '';

  const turkishChars: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    Ç: 'c',
    Ğ: 'g',
    İ: 'i',
    Ö: 'o',
    Ş: 's',
    Ü: 'u',
  };

  return text
    .toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, char => turkishChars[char] || char)
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Remove extra whitespace
 *
 * @example
 * normalizeWhitespace('  hello   world  ') // "hello world"
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Check if string is empty or whitespace only
 */
export function isBlank(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

/**
 * Check if string is not empty
 */
export function isNotBlank(text: string | null | undefined): text is string {
  return !isBlank(text);
}

/**
 * Extract initials from name
 *
 * @example
 * getInitials('Ahmet Yılmaz') // "AY"
 * getInitials('Mehmet') // "M"
 */
export function getInitials(name: string, maxLength: number = 2): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return words
    .slice(0, maxLength)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Generate a username from full name
 *
 * @example
 * generateUsername('Ahmet Yılmaz') // "ahmetyilmaz"
 */
export function generateUsername(name: string): string {
  return slugify(name).replace(/-/g, '');
}

/**
 * Mask sensitive text (email, phone)
 *
 * @example
 * maskEmail('test@example.com') // "t***@example.com"
 * maskPhone('5551234567') // "555***4567"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;

  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 3))}${local.slice(-1)}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  const digits = phone.replace(/\D/g, '');
  return digits.slice(0, 3) + '***' + digits.slice(-4);
}

/**
 * Highlight search term in text
 *
 * @example
 * getHighlightedParts('Hello World', 'wor')
 * // [{ text: 'Hello ', highlight: false }, { text: 'Wor', highlight: true }, { text: 'ld', highlight: false }]
 */
export interface HighlightPart {
  text: string;
  highlight: boolean;
}

export function getHighlightedParts(text: string, searchTerm: string): HighlightPart[] {
  if (!text) return [];
  if (!searchTerm) return [{ text, highlight: false }];

  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter(part => part.length > 0)
    .map(part => ({
      text: part,
      highlight: part.toLowerCase() === searchTerm.toLowerCase(),
    }));
}

/**
 * Escape special regex characters
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remove emoji from text
 */
export function removeEmoji(text: string): string {
  return text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    '',
  );
}

/**
 * Count words in text
 */
export function wordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Count characters (excluding whitespace)
 */
export function charCount(text: string, includeWhitespace: boolean = true): number {
  if (!text) return 0;
  return includeWhitespace ? text.length : text.replace(/\s/g, '').length;
}

/**
 * Extract hashtags from text
 *
 * @example
 * extractHashtags('Hello #world #türkiye') // ['world', 'türkiye']
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#[\wğüşıöçĞÜŞİÖÇ]+/gi);
  return matches ? matches.map(tag => tag.slice(1)) : [];
}

/**
 * Extract mentions from text
 *
 * @example
 * extractMentions('Hello @ahmet @mehmet') // ['ahmet', 'mehmet']
 */
export function extractMentions(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/@[\w]+/gi);
  return matches ? matches.map(mention => mention.slice(1)) : [];
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Format username with @ prefix
 */
export function formatUsername(username: string): string {
  if (!username) return '';
  return username.startsWith('@') ? username : `@${username}`;
}

/**
 * Remove @ prefix from username
 */
export function cleanUsername(username: string): string {
  if (!username) return '';
  return username.startsWith('@') ? username.slice(1) : username;
}
