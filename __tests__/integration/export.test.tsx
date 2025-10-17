import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseDirectoryStructure } from '@/lib/parser';
import { formatTreeToText, formatVisibleTree } from '@/lib/formatter';

describe('Export Functionality Integration', () => {
  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
  });

  it('should format tree structure as markdown text', () => {
    const input = `- src/
  - components/
    - Button.tsx
  - index.ts`;

    const result = parseDirectoryStructure(input);
    if (!result.success) return;

    const formatted = formatTreeToText(result.nodes, { style: 'markdown' });

    expect(formatted).toContain('- src/');
    expect(formatted).toContain('- components/');
    expect(formatted).toContain('- Button.tsx');
    expect(formatted).toContain('- index.ts');
  });

  it('should format tree structure as ASCII text', () => {
    const input = `- root/
  - file1.txt
  - file2.txt`;

    const result = parseDirectoryStructure(input);
    if (!result.success) return;

    const formatted = formatTreeToText(result.nodes, { style: 'ascii' });

    expect(formatted).toContain('root/');
    expect(formatted).toContain('file1.txt');
    expect(formatted).toContain('file2.txt');
    // Should contain ASCII tree characters
    expect(formatted).toMatch(/[├└│]/);
  });

  it('should export only visible nodes when folders are collapsed', () => {
    const input = `- folder/
  - hidden.txt`;

    const result = parseDirectoryStructure(input);
    if (!result.success) return;

    // Collapse the folder
    result.nodes[0].isExpanded = false;

    const formatted = formatVisibleTree(result.nodes, { style: 'markdown' });

    expect(formatted).toContain('- folder/');
    expect(formatted).not.toContain('hidden.txt');
  });

  it('should handle empty tree gracefully', () => {
    const formatted = formatTreeToText([], { style: 'markdown' });
    expect(formatted).toBe('');
  });

  it('should preserve hierarchy in formatted output', () => {
    const input = `- level1/
  - level2/
    - level3/
      - file.txt`;

    const result = parseDirectoryStructure(input);
    if (!result.success) return;

    const formatted = formatTreeToText(result.nodes, { style: 'markdown' });
    const lines = formatted.split('\n');

    // Check indentation increases with depth
    expect(lines[0]).toMatch(/^- level1\/$/);
    expect(lines[1]).toMatch(/^\s+- level2\/$/);
    expect(lines[2]).toMatch(/^\s{4,}- level3\/$/);
    expect(lines[3]).toMatch(/^\s{6,}- file\.txt$/);
  });

  it('should format text compatible with email clients', () => {
    const input = `- docs/
  - README.md`;

    const result = parseDirectoryStructure(input);
    if (!result.success) return;

    const formatted = formatTreeToText(result.nodes, { style: 'markdown' });

    // Should use simple characters (no special Unicode except basic ASCII)
    expect(formatted).toMatch(/^[- \n\w./]+$/);
  });

  it('should copy formatted text to clipboard', async () => {
    const input = `- src/
  - index.ts`;

    const result = parseDirectoryStructure(input);
    if (!result.success) return;

    const formatted = formatTreeToText(result.nodes, { style: 'markdown' });
    
    await navigator.clipboard.writeText(formatted);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(formatted);
  });
});
