import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { parseDirectoryStructure } from '@/lib/parser';
import { TreeView } from '@/components/TreeView';

describe('Parsing and Rendering Integration', () => {
  it('should parse markdown format and render tree structure', () => {
    const markdownInput = `- src/
  - components/
    - Button.tsx
  - utils/
    - helpers.ts
- README.md`;

    const result = parseDirectoryStructure(markdownInput);
    
    expect(result.success).toBe(true);
    if (!result.success) return;

    const mockToggle = () => {};
    render(
      <TreeView 
        nodes={result.nodes} 
        onToggleExpand={mockToggle}
      />
    );

    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('components')).toBeInTheDocument();
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    expect(screen.getByText('utils')).toBeInTheDocument();
    expect(screen.getByText('helpers.ts')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();
  });

  it('should parse ASCII format and render tree structure', () => {
    const asciiInput = `project/
├── src/
│   ├── index.ts
│   └── types.ts
└── package.json`;

    const result = parseDirectoryStructure(asciiInput);
    
    expect(result.success).toBe(true);
    if (!result.success) return;

    const mockToggle = () => {};
    render(
      <TreeView 
        nodes={result.nodes} 
        onToggleExpand={mockToggle}
      />
    );

    expect(screen.getByText('project')).toBeInTheDocument();
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('types.ts')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('should handle parsing errors gracefully', () => {
    const emptyInput = '';
    const result = parseDirectoryStructure(emptyInput);
    
    expect(result.success).toBe(false);
    if (result.success) return;
    
    expect(result.error).toContain('empty');
  });

  it('should render empty state when no nodes provided', () => {
    const mockToggle = () => {};
    render(
      <TreeView 
        nodes={[]} 
        onToggleExpand={mockToggle}
      />
    );

    expect(screen.getByText('No directory structure loaded')).toBeInTheDocument();
  });
});
