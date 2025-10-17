import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseDirectoryStructure } from '@/lib/parser';
import { useTreeState } from '@/hooks/useTreeState';
import { TreeView } from '@/components/TreeView';

// Test component wrapper
function EditableTreeWrapper() {
  const { state, setTree, toggleExpand, renameNode } = useTreeState();

  // Initialize with test data
  if (state.nodes.length === 0) {
    const input = `- folder/
  - file.txt`;
    
    const result = parseDirectoryStructure(input);
    if (result.success) {
      setTree(result.nodes);
    }
  }

  return (
    <TreeView 
      nodes={state.nodes} 
      onToggleExpand={toggleExpand}
      onRename={renameNode}
    />
  );
}

describe('Inline Editing Integration', () => {
  it('should enable edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<EditableTreeWrapper />);

    const fileName = screen.getByText('file.txt');
    
    // Double-click to enter edit mode
    await user.dblClick(fileName);

    // Input field should appear
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('file.txt');
  });

  it('should save changes on Enter key', async () => {
    const user = userEvent.setup();
    render(<EditableTreeWrapper />);

    const fileName = screen.getByText('file.txt');
    await user.dblClick(fileName);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'renamed.txt');
    await user.keyboard('{Enter}');

    // New name should be displayed
    expect(screen.getByText('renamed.txt')).toBeInTheDocument();
    expect(screen.queryByText('file.txt')).not.toBeInTheDocument();
  });

  it('should cancel editing on Escape key', async () => {
    const user = userEvent.setup();
    render(<EditableTreeWrapper />);

    const fileName = screen.getByText('file.txt');
    await user.dblClick(fileName);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'changed.txt');
    await user.keyboard('{Escape}');

    // Original name should remain
    expect(screen.getByText('file.txt')).toBeInTheDocument();
    expect(screen.queryByText('changed.txt')).not.toBeInTheDocument();
  });

  it('should prevent empty names and show validation error', async () => {
    const user = userEvent.setup();
    render(<EditableTreeWrapper />);

    const fileName = screen.getByText('file.txt');
    await user.dblClick(fileName);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.keyboard('{Enter}');

    // Original name should remain after validation failure
    expect(screen.getByText('file.txt')).toBeInTheDocument();
  });

  it('should allow renaming folders', async () => {
    const user = userEvent.setup();
    render(<EditableTreeWrapper />);

    const folderName = screen.getByText('folder');
    await user.dblClick(folderName);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'renamed-folder');
    await user.keyboard('{Enter}');

    // New folder name should be displayed
    expect(screen.getByText('renamed-folder')).toBeInTheDocument();
    expect(screen.queryByText('folder')).not.toBeInTheDocument();
  });
});
