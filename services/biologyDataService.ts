import defaultTerms from '../data/biologyTerms.json';
import { BiologyTerm, TermCorrection } from '../types/biology';

const STORAGE_KEY = 'bio_terms_custom_db';

/**
 * Common non-standard, legacy or misspelled terms mapped to their standard counterparts.
 */
const CORRECTION_RULES: {
  patterns: RegExp[];
  originalDisplay: string;
  targetEnglish: string;
  targetPronunciation: string;
  vietnameseTerm: string;
  note: string;
}[] = [
  {
    patterns: [/\band\b/i, /\badn\b/i],
    originalDisplay: 'AND / ADN',
    targetEnglish: 'DNA',
    targetPronunciation: '/ˌdiː.enˈeɪ/',
    vietnameseTerm: 'Axit đêôxiribônuclêic (DNA)',
    note: "Theo Chương trình GDPT 2018, danh pháp quốc tế chuẩn là 'DNA' (phát âm: /ˌdiː.enˈeɪ/), không dùng 'AND' (lỗi gõ nhầm) hoặc cách viết cũ 'ADN'.",
  },
  {
    patterns: [/\bgen\b/i],
    originalDisplay: 'Gen',
    targetEnglish: 'Gene',
    targetPronunciation: '/dʒiːn/',
    vietnameseTerm: 'Gen',
    note: "Theo Chương trình GDPT 2018, danh pháp chuẩn quốc tế đã đổi từ 'Gen' thành 'Gene' (phát âm chuẩn tiếng Anh: /dʒiːn/).",
  },
  {
    patterns: [/\barn\b/i],
    originalDisplay: 'ARN',
    targetEnglish: 'RNA',
    targetPronunciation: '/ˌɑːr.enˈeɪ/',
    vietnameseTerm: 'Axit ribônuclêic (RNA)',
    note: "SGK mới sử dụng tên gọi quốc tế chuẩn là 'RNA' (phát âm: /ˌɑːr.enˈeɪ/) thay cho cách viết cũ 'ARN'.",
  },
  {
    patterns: [/\benzim\b/i],
    originalDisplay: 'Enzim',
    targetEnglish: 'Enzyme',
    targetPronunciation: '/ˈen.zaɪm/',
    vietnameseTerm: 'Enzyme (Men sinh học)',
    note: "Trong SGK GDPT 2018, 'Enzim' được viết theo chuẩn danh pháp quốc tế là 'Enzyme' (phát âm: /ˈen.zaɪm/).",
  },
  {
    patterns: [/\baxit amin\b/i, /\baminoaxit\b/i, /\baa\b/i],
    originalDisplay: 'Axit amin',
    targetEnglish: 'Amino acid',
    targetPronunciation: '/əˌmiː.nəʊ ˈæs.ɪd/',
    vietnameseTerm: 'Axit amin (Amino acid)',
    note: "SGK GDPT 2018 sử dụng thuật ngữ quốc tế 'Amino acid' (phát âm: /əˌmiː.nəʊ ˈæs.ɪd/) thay cho 'Axit amin'.",
  },
  {
    patterns: [/\bnucleotit\b/i, /\bnuclêôtit\b/i, /\bnu\b/i],
    originalDisplay: 'Nuclêôtit',
    targetEnglish: 'Nucleotide',
    targetPronunciation: '/ˈnjuː.kli.ə.taɪd/',
    vietnameseTerm: 'Nuclêôtit (Nucleotide)',
    note: "SGK GDPT 2018 viết chuẩn quốc tế là 'Nucleotide' (phát âm: /ˈnjuː.kli.ə.taɪd/) thay cho cách viết 'Nuclêôtit'.",
  },
  {
    patterns: [/\briboxom\b/i, /\bribôxôm\b/i],
    originalDisplay: 'Ribôxôm',
    targetEnglish: 'Ribosome',
    targetPronunciation: '/ˈraɪ.bə.səʊm/',
    vietnameseTerm: 'Ribôxôm (Ribosome)',
    note: "SGK mới viết chuẩn quốc tế là 'Ribosome' (phát âm: /ˈraɪ.bə.səʊm/) thay cho 'Ribôxôm'.",
  },
  {
    patterns: [/\bnst\b/i, /\bnhiem sac the\b/i, /\bnhiễm sắc thể\b/i, /\bcromosom\b/i, /\bcromosome\b/i],
    originalDisplay: 'Nhiễm sắc thể (NST)',
    targetEnglish: 'Chromosome',
    targetPronunciation: '/ˈkrəʊ.mə.səʊm/',
    vietnameseTerm: 'Nhiễm sắc thể',
    note: "Thuật ngữ tiếng Anh chuẩn của Nhiễm sắc thể theo SGK mới là 'Chromosome' (phát âm: /ˈkrəʊ.mə.səʊm/).",
  },
  {
    patterns: [/\bmitos\b/i],
    originalDisplay: 'mitos',
    targetEnglish: 'Mitosis',
    targetPronunciation: '/maɪˈtəʊ.sɪs/',
    vietnameseTerm: 'Nguyên phân',
    note: "Bạn đã viết thiếu chữ 'is' ('mitos'). Cách viết chuẩn tiếng Anh là 'Mitosis' (phát âm: /maɪˈtəʊ.sɪs/).",
  },
  {
    patterns: [/\bmeios\b/i],
    originalDisplay: 'meios',
    targetEnglish: 'Meiosis',
    targetPronunciation: '/maɪˈəʊ.sɪs/',
    vietnameseTerm: 'Giảm phân',
    note: "Bạn đã viết thiếu chữ 'is' ('meios'). Cách viết chuẩn tiếng Anh là 'Meiosis' (phát âm: /maɪˈəʊ.sɪs/).",
  },
  {
    patterns: [/\boperonlak\b/i, /\boperon lac\b/i],
    originalDisplay: 'operonlak',
    targetEnglish: 'Operon Lac',
    targetPronunciation: '/ˈɒp.ər.ɒn læk/',
    vietnameseTerm: 'Cụm gen Operon Lac',
    note: "Cách viết chuẩn theo SGK là 'Operon Lac' (phát âm: /ˈɒp.ər.ɒn læk/).",
  },
];

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

  public async getAllTerms(): Promise<BiologyTerm[]> {
    return [...this.terms];
  }

  public async getTermById(id: string): Promise<BiologyTerm | undefined> {
    return this.terms.find((t) => t.id === id);
  }

  /**
   * Checks if the student used a misspelled or legacy term, and returns correction advice.
   */
  public detectTermCorrection(rawQuery: string): TermCorrection | undefined {
    if (!rawQuery) return undefined;
    const lower = rawQuery.toLowerCase();

    for (const rule of CORRECTION_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(lower)) {
          return {
            originalWord: rule.originalDisplay,
            standardEnglish: rule.targetEnglish,
            standardPronunciation: rule.targetPronunciation,
            vietnameseTerm: rule.vietnameseTerm,
            note: rule.note,
          };
        }
      }
    }
    return undefined;
  }

  /**
   * Smart search across English, Vietnamese, Pronunciation, Keywords, and Topics.
   * Auto-detects typos/old terms (like "and", "gen") and points to correct standard term.
   */
  public async searchTerm(rawQuery: string): Promise<{
    bestMatch?: BiologyTerm;
    matches: BiologyTerm[];
    correction?: TermCorrection;
  }> {
    if (!rawQuery || !rawQuery.trim()) {
      return { matches: [] };
    }

    // 1. Check for typos or legacy terms
    const correction = this.detectTermCorrection(rawQuery);

    let queryToSearch = rawQuery;
    if (correction) {
      // Direct query to the corrected English term
      queryToSearch = correction.standardEnglish;
    }

    const cleanedQuery = cleanQuestionQuery(queryToSearch);
    const normalizedRaw = normalizeSearchText(queryToSearch);
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
    let bestMatch = scoredMatches.length > 0 && scoredMatches[0].score >= 50 ? scoredMatches[0].term : undefined;

    // If correction was found, explicitly match with targetEnglish if available
    if (correction && (!bestMatch || bestMatch.englishTerm.toLowerCase() !== correction.standardEnglish.toLowerCase())) {
      const exactTarget = this.terms.find(
        (t) => t.englishTerm.toLowerCase() === correction.standardEnglish.toLowerCase()
      );
      if (exactTarget) {
        bestMatch = exactTarget;
      }
    }

    return { bestMatch, matches, correction };
  }

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

  public async updateTerm(updated: BiologyTerm): Promise<boolean> {
    const idx = this.terms.findIndex((t) => t.id === updated.id);
    if (idx === -1) return false;
    this.terms[idx] = updated;
    this.saveTerms();
    return true;
  }

  public async deleteTerm(id: string): Promise<boolean> {
    const beforeCount = this.terms.length;
    this.terms = this.terms.filter((t) => t.id !== id);
    if (this.terms.length !== beforeCount) {
      this.saveTerms();
      return true;
    }
    return false;
  }

  public async resetToDefaults(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.terms = (defaultTerms as unknown) as BiologyTerm[];
  }

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

  public importFromCsv(csvText: string): number {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return 0;

    let addedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
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

          const existingIdx = this.terms.findIndex(
            (t) => t.id === newTerm.id || t.englishTerm.toLowerCase() === newTerm.englishTerm.toLowerCase()
          );
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
