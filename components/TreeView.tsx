'use client';

import { forwardRef, useEffect, useCallback } from 'react';
import { TreeNode as TreeNodeComponent } from './TreeNode';
import { TreeNode as TreeNodeType } from '@/lib/types';
import { FolderOpen } from 'lucide-react';

interface TreeViewProps {
  nodes: TreeNodeType[];
  onToggleExpand: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  selectedNodeId?: string | null;
}

/**
 * TreeView container component that renders the directory structure
 * Provides ref for export functionality and handles empty state
 */
export const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(
  ({ nodes, onToggleExpand, onRename, onDelete, onSelect, selectedNodeId }, ref) => {
    // Flatten tree for keyboard navigation
    const flattenNodes = useCallback((nodeList: TreeNodeType[]): TreeNodeType[] => {
      const result: TreeNodeType[] = [];
      const traverse = (nodes: TreeNodeType[]) => {
        nodes.forEach((node) => {
          result.push(node);
          if (node.type === 'folder' && node.isExpanded && node.children) {
            traverse(node.children);
          }
        });
      };
      traverse(nodeList);
      return result;
    }, []);

    // Handle keyboard navigation between nodes
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!nodes || nodes.length === 0) return;

        const flatNodes = flattenNodes(nodes);
        const currentIndex = flatNodes.findIndex((n) => n.id === selectedNodeId);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, flatNodes.length - 1);
          onSelect?.(flatNodes[nextIndex].id);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          onSelect?.(flatNodes[prevIndex].id);
        } else if (e.key === 'Home') {
          e.preventDefault();
          onSelect?.(flatNodes[0].id);
        } else if (e.key === 'End') {
          e.preventDefault();
          onSelect?.(flatNodes[flatNodes.length - 1].id);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nodes, selectedNodeId, onSelect, flattenNodes]);
    // Handle empty state
    if (!nodes || nodes.length === 0) {
      return (
        <div
          ref={ref}
          className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center bg-card/50 rounded-xl border border-dashed border-border/60 shadow-sm"
        >
          <div className="bg-muted/30 p-4 rounded-full mb-4">
            <FolderOpen className="w-12 h-12 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No directory structure loaded
          </h3>
          <p className="text-sm text-muted-foreground/80 max-w-md leading-relaxed">
            Enter a directory structure in markdown or ASCII format in the input
            panel and click Parse to visualize it here.
          </p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="w-full h-full overflow-auto p-5 md:p-6 bg-card/50 rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200"
        role="tree"
        aria-label="Directory structure tree. Use arrow keys to navigate, Enter or Space to expand/collapse folders, F2 to rename, and double-click to edit."
        aria-multiselectable="false"
      >
        <div className="min-w-max">
          {nodes.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              onToggleExpand={onToggleExpand}
              onRename={onRename}
              onDelete={onDelete}
              onSelect={onSelect}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      </div>
    );
  }
);

TreeView.displayName = 'TreeView';
