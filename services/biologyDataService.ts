import defaultTerms from '../data/biologyTerms.json';
import { BiologyTerm } from '../types/biology';

const STORAGE_KEY = 'bio_terms_custom_db';

/**
 * Normalizes text for insensitive Vietnamese & English search:
 * removes accents, lowercases, strips special characters.
 */
export function normalizeSearchText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[?.,!/\\;:'"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips common question prefixes/suffixes like "là gì", "nghĩa là gì", "cho biết", "what is"
 */
export function cleanQuestionQuery(query: string): string {
  let cleaned = normalizeSearchText(query);
  const stopwords = [
    'la gi',
    'nghia la gi',
    'la cai gi',
    'dinh nghia',
    'giai thich',
    'cho biet',
    'khai niem',
    'thuat ngu',
    'what is',
    'define',
    'meaning of',
    'co nghia la gi',
    'the nao la',
  ];

  for (const sw of stopwords) {
    cleaned = cleaned.replace(new RegExp(`\\b${sw}\\b`, 'g'), '');
  }

  return cleaned.trim();
}

class BiologyDataService {
  private terms: BiologyTerm[] = [];

  constructor() {
    this.loadTerms();
  }

  /**
   * Loads initial terms from biologyTerms.json merged with any teacher edits in localStorage
   */
  private loadTerms(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.terms = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using default data:', e);
    }
    this.terms = (defaultTerms as unknown) as BiologyTerm[];
  }

  private saveTerms(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.terms));
    } catch (e) {
      console.error('Failed to save terms to localStorage:', e);
    }
  }

  /**
   * Get all biology terms
   */
  public async getAllTerms(): Promise<BiologyTerm[]> {
    return [...this.terms];
  }

  /**
   * Find term by ID
   */
  public async getTermById(id: string): Promise<BiologyTerm | undefined> {
    return this.terms.find((t) => t.id === id);
  }

  /**
   * Smart search across English, Vietnamese, Pronunciation, Keywords, and Topics.
   * Returns sorted results with match score.
   */
  public async searchTerm(rawQuery: string): Promise<{ bestMatch?: BiologyTerm; matches: BiologyTerm[] }> {
    if (!rawQuery || !rawQuery.trim()) {
      return { matches: [] };
    }

    const cleanedQuery = cleanQuestionQuery(rawQuery);
    const normalizedRaw = normalizeSearchText(rawQuery);
    const queryToUse = cleanedQuery.length > 0 ? cleanedQuery : normalizedRaw;

    const scoredMatches: { term: BiologyTerm; score: number }[] = [];

    for (const term of this.terms) {
      const normEnglish = normalizeSearchText(term.englishTerm);
      const normVietnamese = normalizeSearchText(term.vietnameseTerm);
      const normKeywords = term.keywords.map((k) => normalizeSearchText(k));
      const normTopic = normalizeSearchText(term.topic);

      let score = 0;

      // Exact match with English term
      if (normEnglish === queryToUse) {
        score += 100;
      } else if (normEnglish.startsWith(queryToUse)) {
        score += 80;
      } else if (normEnglish.includes(queryToUse)) {
        score += 60;
      }

      // Exact or strong match with Vietnamese term
      if (normVietnamese === queryToUse) {
        score += 95;
      } else if (normVietnamese.includes(queryToUse)) {
        score += 65;
      }

      // Check keywords
      for (const kw of normKeywords) {
        if (kw === queryToUse) {
          score += 90;
          break;
        } else if (kw.includes(queryToUse) || queryToUse.includes(kw)) {
          score += 50;
        }
      }

      // Check topic
      if (normTopic.includes(queryToUse)) {
        score += 30;
      }

      // Query appears inside definition or explanation
      const normDef = normalizeSearchText(term.definition);
      if (normDef.includes(queryToUse)) {
        score += 20;
      }

      if (score > 0) {
        scoredMatches.push({ term, score });
      }
    }

    scoredMatches.sort((a, b) => b.score - a.score);

    const matches = scoredMatches.map((item) => item.term);
    const bestMatch = scoredMatches.length > 0 && scoredMatches[0].score >= 50 ? scoredMatches[0].term : undefined;

    return { bestMatch, matches };
  }

  /**
   * Add a new term (Teacher / Admin)
   */
  public async addTerm(termData: Omit<BiologyTerm, 'id'> & { id?: string }): Promise<BiologyTerm> {
    const newId = termData.id || `BIO${String(this.terms.length + 1).padStart(3, '0')}`;
    const newTerm: BiologyTerm = {
      ...termData,
      id: newId,
      keywords: termData.keywords || [termData.englishTerm.toLowerCase(), termData.vietnameseTerm.toLowerCase()],
    };
    this.terms.unshift(newTerm);
    this.saveTerms();
    return newTerm;
  }

  /**
   * Update an existing term (Teacher / Admin)
   */
  public async updateTerm(updated: BiologyTerm): Promise<boolean> {
    const idx = this.terms.findIndex((t) => t.id === updated.id);
    if (idx === -1) return false;
    this.terms[idx] = updated;
    this.saveTerms();
    return true;
  }

  /**
   * Delete a term (Teacher / Admin)
   */
  public async deleteTerm(id: string): Promise<boolean> {
    const beforeCount = this.terms.length;
    this.terms = this.terms.filter((t) => t.id !== id);
    if (this.terms.length !== beforeCount) {
      this.saveTerms();
      return true;
    }
    return false;
  }

  /**
   * Reset database back to default initial seed
   */
  public async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.terms = (defaultTerms as unknown) as BiologyTerm[];
  }

  /**
   * Export all terms as CSV string
   */
  public exportToCsv(): string {
    const headers = [
      'id',
      'englishTerm',
      'pronunciation',
      'vietnameseTerm',
      'grade',
      'topic',
      'definition',
      'simpleExplanation',
      'example',
      'memoryTip',
      'keywords',
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = this.terms.map((t) =>
      [
        t.id,
        t.englishTerm,
        t.pronunciation,
        t.vietnameseTerm,
        t.grade,
        t.topic,
        t.definition,
        t.simpleExplanation,
        t.example,
        t.memoryTip,
        t.keywords.join('; '),
      ]
        .map(escapeCsv)
        .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Import terms from CSV text
   */
  public importFromCsv(csvText: string): number {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return 0;

    let addedCount = 0;
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV splitter respecting quotes
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = '';

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' && (j === 0 || line[j - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      if (values.length >= 8) {
        const [
          id,
          englishTerm,
          pronunciation,
          vietnameseTerm,
          grade,
          topic,
          definition,
          simpleExplanation,
          example,
          memoryTip,
          keywordsStr,
        ] = values;

        if (englishTerm && vietnameseTerm) {
          const newTerm: BiologyTerm = {
            id: id || `BIO_IMP_${Date.now()}_${i}`,
            englishTerm,
            pronunciation: pronunciation || '',
            vietnameseTerm,
            grade: (grade as any) || '12',
            topic: topic || 'Sinh học THPT',
            definition: definition || '',
            simpleExplanation: simpleExplanation || '',
            example: example || '',
            memoryTip: memoryTip || '',
            keywords: keywordsStr ? keywordsStr.split(';').map((k) => k.trim()) : [englishTerm.toLowerCase()],
          };

          const existingIdx = this.terms.findIndex((t) => t.id === newTerm.id || t.englishTerm.toLowerCase() === newTerm.englishTerm.toLowerCase());
          if (existingIdx !== -1) {
            this.terms[existingIdx] = newTerm;
          } else {
            this.terms.push(newTerm);
          }
          addedCount++;
        }
      }
    }

    if (addedCount > 0) {
      this.saveTerms();
    }
    return addedCount;
  }
}

export const biologyDataService = new BiologyDataService();
