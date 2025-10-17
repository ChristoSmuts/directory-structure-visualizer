/**
 * Formatter module for converting TreeNode structure to text format
 */

import { TreeNode, FormatOptions } from './types';

/**
 * Formats tree nodes to markdown format
 * This format is widely compatible with email clients and word processors
 */
function formatAsMarkdown(nodes: TreeNode[], indent: string = '  '): string {
  const lines: string[] = [];
  
  function traverse(node: TreeNode, currentIndent: string) {
    // Add the node with proper indentation
    const prefix = currentIndent ? `${currentIndent}- ` : '- ';
    const suffix = node.type === 'folder' ? '/' : '';
    lines.push(`${prefix}${node.name}${suffix}`);
    
    // Recursively process children if folder is expanded or if we're preserving all structure
    if (node.children && node.children.length > 0) {
      const nextIndent = currentIndent + indent;
      for (const child of node.children) {
        traverse(child, nextIndent);
      }
    }
  }
  
  for (const node of nodes) {
    traverse(node, '');
  }
  
  return lines.join('\n');
}

/**
 * Formats tree nodes to ASCII format with box-drawing characters
 * This format provides a visual tree structure
 */
function formatAsAscii(nodes: TreeNode[]): string {
  const lines: string[] = [];
  
  function traverse(node: TreeNode, prefix: string, isLast: boolean) {
    // Determine the connector character
    const connector = isLast ? '└── ' : '├── ';
    const suffix = node.type === 'folder' ? '/' : '';
    
    lines.push(`${prefix}${connector}${node.name}${suffix}`);
    
    // Process children if they exist
    if (node.children && node.children.length > 0) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const isLastChild = i === node.children.length - 1;
        traverse(child, childPrefix, isLastChild);
      }
    }
  }
  
  // Handle root nodes
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const isLast = i === nodes.length - 1;
    
    if (i === 0 && nodes.length === 1) {
      // Single root node - no prefix
      const suffix = node.type === 'folder' ? '/' : '';
      lines.push(`${node.name}${suffix}`);
      
      if (node.children && node.children.length > 0) {
        for (let j = 0; j < node.children.length; j++) {
          const child = node.children[j];
          const isLastChild = j === node.children.length - 1;
          traverse(child, '', isLastChild);
        }
      }
    } else {
      // Multiple root nodes
      traverse(node, '', isLast);
    }
  }
  
  return lines.join('\n');
}

/**
 * Main formatter function that converts tree structure to formatted text
 * 
 * @param nodes - Array of root TreeNode objects
 * @param options - Formatting options
 * @returns Formatted text string compatible with email clients and word processors
 */
export function formatTreeToText(
  nodes: TreeNode[],
  options: FormatOptions = {}
): string {
  // Validate input
  if (!nodes || nodes.length === 0) {
    return '';
  }
  
  const {
    style = 'markdown',
    indent = '  ',
  } = options;
  
  // Format based on style
  if (style === 'ascii') {
    return formatAsAscii(nodes);
  } else {
    return formatAsMarkdown(nodes, indent);
  }
}

/**
 * Formats tree structure with only visible (expanded) nodes
 * This respects the current expanded/collapsed state of folders
 */
export function formatVisibleTree(
  nodes: TreeNode[],
  options: FormatOptions = {}
): string {
  // Filter to only include visible nodes
  function filterVisible(node: TreeNode): TreeNode {
    const filtered: TreeNode = {
      ...node,
      children: undefined,
    };
    
    // Include children only if the folder is expanded
    if (node.type === 'folder' && node.isExpanded && node.children) {
      filtered.children = node.children.map(filterVisible);
    }
    
    return filtered;
  }
  
  const visibleNodes = nodes.map(filterVisible);
  return formatTreeToText(visibleNodes, options);
}
