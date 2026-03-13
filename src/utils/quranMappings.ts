import pageToChapter from '../data/quran/page-to-chapter-mappings.json';
import rubElHizbToChapter from '../data/quran/rub-el-hizb-to-chapter-mappings.json';
import juzToChapterVerse from '../data/quran/juz-to-chapter-verse-mappings.json';
import juzToChapter from '../data/quran/juz-to-chapter-mappings.json';
import hizbToChapter from '../data/quran/hizb-to-chapter-mappings.json';

/**
 * Utility for Quran mappings (Juz, Page, Hizb, etc.)
 */
export const QuranMappings = {
  /**
   * Get chapters in a specific Juz
   */
  getChaptersByJuz: (juzId: number | string): string[] => {
    return (juzToChapter as any)[String(juzId)] || [];
  },

  /**
   * Get chapters and verses range in a specific Juz
   */
  getVerseMappingByJuz: (juzId: number | string): Record<string, string> => {
    return (juzToChapterVerse as any)[String(juzId)] || {};
  },

  /**
   * Get chapters in a specific Page
   */
  getChaptersByPage: (pageId: number | string): string[] => {
    return (pageToChapter as any)[String(pageId)] || [];
  },

  /**
   * Get chapters in a specific Hizb
   */
  getChaptersByHizb: (hizbId: number | string): string[] => {
    return (hizbToChapter as any)[String(hizbId)] || [];
  },

  /**
   * Get chapters in a specific Rub el Hizb
   */
  getChaptersByRubElHizb: (rubId: number | string): string[] => {
    return (rubElHizbToChapter as any)[String(rubId)] || [];
  },

  /**
   * Find which Juz a chapter belongs to (first occurrence)
   */
  getJuzByChapter: (chapterId: number | string): number | null => {
    const chapterStr = String(chapterId);
    for (const [juzId, chapters] of Object.entries(juzToChapter)) {
      if ((chapters as string[]).includes(chapterStr)) {
        return parseInt(juzId);
      }
    }
    return null;
  }
};
