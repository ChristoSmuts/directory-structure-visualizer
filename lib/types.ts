/**
 * Core data models for the Directory Structure Visualizer
 */

/**
 * Represents a single node in the directory tree structure
 */
export interface TreeNode {
  /** Unique identifier for the node */
  id: string;
  /** Display name of the file or folder */
  name: string;
  /** Type of the node */
  type: 'file' | 'folder';
  /** Child nodes (only for folders) */
  children?: TreeNode[];
  /** Whether the folder is expanded (only for folders) */
  isExpanded?: boolean;
  /** Depth level in the tree hierarchy (0 for root) */
  depth: number;
}

/**
 * Application state for the tree structure
 */
export interface TreeState {
  /** Array of root-level tree nodes */
  nodes: TreeNode[];
  /** ID of the currently selected node, if any */
  selectedNodeId: string | null;
}

/**
 * Actions for tree state management
 */
export type TreeAction =
  | { type: 'SET_TREE'; payload: TreeNode[] }
  | { type: 'TOGGLE_EXPAND'; payload: string }
  | { type: 'RENAME_NODE'; payload: { id: string; name: string } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'ADD_NODE'; payload: { parentId: string; nodeType: 'file' | 'folder' } };

/**
 * Result type for parsing operations
 */
export type ParseResult =
  | { success: true; nodes: TreeNode[] }
  | { success: false; error: string };

/**
 * Parser function type that converts text input to tree structure
 */
export type ParserFunction = (input: string) => ParseResult;

/**
 * Formatter function type that converts tree structure to text output
 */
export type FormatterFunction = (nodes: TreeNode[]) => string;

/**
 * Supported input formats for directory structures
 */
export type InputFormat = 'markdown' | 'ascii' | 'unknown';

/**
 * Options for formatting output text
 */
export interface FormatOptions {
  /** Whether to include expanded state in output */
  preserveExpandedState?: boolean;
  /** Indentation string (default: '  ') */
  indent?: string;
  /** Format style to use */
  style?: 'markdown' | 'ascii';
}
