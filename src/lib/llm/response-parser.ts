/**
 * Utilities for parsing and structuring LLM responses.
 */

export interface ParsedSection {
  heading: string;
  content: string;
}

/**
 * Parse markdown response into sections based on ## headings.
 */
export function parseMarkdownSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = markdown.split('\n');
  let currentHeading = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (currentHeading || currentContent.length > 0) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join('\n').trim(),
        });
      }
      currentHeading = headingMatch[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Push last section
  if (currentHeading || currentContent.length > 0) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join('\n').trim(),
    });
  }

  return sections;
}

/**
 * Extract numbered items from a markdown list.
 */
export function extractNumberedItems(text: string): string[] {
  const items: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const match = line.match(/^\s*\d+\.\s+(.+)/);
    if (match) {
      items.push(match[1].trim());
    }
  }

  return items;
}

/**
 * Extract a score from LLM text like "Score: 4/5" or "Severity: 3".
 */
export function extractScore(text: string, label: string): number | null {
  const patterns = [
    new RegExp(`${label}[:\\s]+(\\d+)(?:\\/\\d+)?`, 'i'),
    new RegExp(`(\\d+)(?:\\/\\d+)?\\s*[-–]?\\s*${label}`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}
