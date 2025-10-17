import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseDirectoryStructure } from '@/lib/parser';
import { TreeView } from '@/components/TreeView';
import { useTreeState } from '@/hooks/useTreeState';
import { TreeNode } from '@/lib/types';

// Test component wrapper
function TreeViewWrapper() {
  const { state, setTree, toggleExpand } = useTreeState();

  // Initialize with test data
  if (state.nodes.length === 0) {
    const input = `- root/
  - folder1/
    - file1.txt
  - folder2/
    - file2.txt`;
    
    const result = parseDirectoryStructure(input);
    if (result.success) {
      setTree(result.nodes);
    }
  }

  return (
    <TreeView 
      nodes={state.nodes} 
      onToggleExpand={toggleExpand}
    />
  );
}

describe('Expand/Collapse Integration', () => {
  it('should expand and collapse folders on click', async () => {
    const user = userEvent.setup();
    render(<TreeViewWrapper />);

    // Initially all folders are expanded
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();

    // Click on root folder to collapse
    const rootFolder = screen.getByText('root');
    await user.click(rootFolder);

    // Children should be hidden
    expect(screen.queryByText('folder1')).not.toBeInTheDocument();
    expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();

    // Click again to expand
    await user.click(rootFolder);

    // Children should be visible again
    expect(screen.getByText('folder1')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
  });

  it('should maintain expanded state of nested folders independently', async () => {
    const user = userEvent.setup();
    render(<TreeViewWrapper />);

    // Collapse folder1
    const folder1 = screen.getByText('folder1');
    await user.click(folder1);

    // file1.txt should be hidden
    expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();

    // folder2 and file2.txt should still be visible
    expect(screen.getByText('folder2')).toBeInTheDocument();
    expect(screen.getByText('file2.txt')).toBeInTheDocument();
  });

  it('should show visual indicator for expanded vs collapsed folders', () => {
    const input = `- folder/
  - file.txt`;
    
    const result = parseDirectoryStructure(input);
    if (!result.success) return;

    const mockToggle = () => {};
    const { container } = render(
      <TreeView 
        nodes={result.nodes} 
        onToggleExpand={mockToggle}
      />
    );

    // Check for chevron icon (expanded state)
    const chevronDown = container.querySelector('[class*="lucide-chevron-down"]');
    expect(chevronDown).toBeInTheDocument();
  });
});
