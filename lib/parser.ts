/**
 * Parser module for converting text-based directory structures to TreeNode format
 */

import { TreeNode, ParseResult, InputFormat } from './types';

/**
 * Detects the format of the input text
 */
function detectFormat(input: string): InputFormat {
  const asciiChars = ['├', '└', '│', '─'];
  const hasAsciiChars = asciiChars.some(char => input.includes(char));
  
  if (hasAsciiChars) {
    return 'ascii';
  }
  
  // Check for markdown-style list format (lines starting with -)
  const lines = input.trim().split('\n').filter(line => line.trim());
  const hasMarkdownFormat = lines.some(line => line.trim().startsWith('-'));
  
  if (hasMarkdownFormat) {
    return 'markdown';
  }
  
  // If no clear format detected but has content, assume markdown
  if (lines.length > 0) {
    return 'markdown';
  }
  
  return 'unknown';
}

/**
 * Generates a unique ID for a tree node
 */
function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Parses markdown format directory structure
 * Format: - folder/ or - file.txt with indentation
 */
function parseMarkdown(input: string): ParseResult {
  try {
    const lines = input.split('\n');
    const root: TreeNode[] = [];
    const stack: { node: TreeNode; indent: number }[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        continue;
      }
      
      // Calculate indentation level
      const match = line.match(/^(\s*)-\s*(.+)$/);
      if (!match) {
        // Line doesn't match markdown format, skip or treat as plain text
        const plainMatch = line.match(/^(\s*)(.+)$/);
        if (plainMatch && plainMatch[2].trim()) {
          const indent = plainMatch[1].length;
          const name = plainMatch[2].trim();
          const isFolder = name.endsWith('/');
          
          const depth = Math.floor(indent / 2);
          const node: TreeNode = {
            id: generateId(),
            name: isFolder ? name.slice(0, -1) : name,
            type: isFolder ? 'folder' : 'file',
            depth,
            isExpanded: true,
            children: isFolder ? [] : undefined,
          };
          
          // Find parent based on depth
          while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
          }
          
          if (stack.length === 0) {
            root.push(node);
          } else {
            const parent = stack[stack.length - 1].node;
            if (parent.children) {
              parent.children.push(node);
            }
          }
          
          if (isFolder) {
            stack.push({ node, indent });
          }
        }
        continue;
      }
      
      const indent = match[1].length;
      const name = match[2].trim();
      const isFolder = name.endsWith('/');
      
      const depth = Math.floor(indent / 2);
      const node: TreeNode = {
        id: generateId(),
        name: isFolder ? name.slice(0, -1) : name,
        type: isFolder ? 'folder' : 'file',
        depth,
        isExpanded: true,
        children: isFolder ? [] : undefined,
      };
      
      // Find parent based on depth
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      
      if (stack.length === 0) {
        root.push(node);
      } else {
        const parent = stack[stack.length - 1].node;
        if (parent.children) {
          parent.children.push(node);
        }
      }
      
      if (isFolder) {
        stack.push({ node, indent });
      }
    }
    
    if (root.length === 0) {
      return {
        success: false,
        error: 'No valid directory structure found in input',
      };
    }
    
    // If we have a root folder with children, adjust depths for proper indentation
    if (root.length === 1 && root[0].type === 'folder' && root[0].children && root[0].children.length > 0) {
      const adjustDepth = (nodes: TreeNode[], increment: number) => {
        nodes.forEach(node => {
          node.depth += increment;
          if (node.children) {
            adjustDepth(node.children, increment);
          }
        });
      };
      adjustDepth(root[0].children, 1);
    }
    
    return { success: true, nodes: root };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse markdown format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parses ASCII format directory structure
 * Format: Uses box-drawing characters (├──, └──, │)
 */
function parseAscii(input: string): ParseResult {
  try {
    const lines = input.split('\n');
    const root: TreeNode[] = [];
    const stack: { node: TreeNode; level: number }[] = [];
    let hasTreeChars = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        continue;
      }
      
      // Remove ASCII tree characters and calculate depth
      let cleanLine = line;
      let level = 0;
      let foundTreeChar = false;
      
      // Count the depth by looking at tree characters
      const treeChars = ['├──', '└──', '│   ', '    '];
      let pos = 0;
      
      while (pos < cleanLine.length) {
        let matched = false;
        
        for (const char of treeChars) {
          if (cleanLine.substring(pos, pos + char.length) === char) {
            foundTreeChar = true;
            hasTreeChars = true;
            if (char === '├──' || char === '└──') {
              // This is the actual node marker
              cleanLine = cleanLine.substring(pos + char.length).trim();
              matched = true;
              break;
            } else {
              // This is indentation
              level++;
              pos += char.length;
              matched = true;
              break;
            }
          }
        }
        
        if (!matched) {
          // No tree character found
          cleanLine = cleanLine.trim();
          break;
        }
      }
      
      const name = cleanLine.trim();
      if (!name) {
        continue;
      }
      
      const isFolder = name.endsWith('/');
      
      // If this is the first line and has no tree characters, it's the root folder
      // All subsequent items with tree characters should be children
      if (!foundTreeChar && i === 0 && isFolder) {
        const node: TreeNode = {
          id: generateId(),
          name: name.slice(0, -1),
          type: 'folder',
          depth: 0,
          isExpanded: true,
          children: [],
        };
        root.push(node);
        stack.push({ node, level: -1 }); // Use -1 so children at level 0 are nested under it
        continue;
      }
      
      const node: TreeNode = {
        id: generateId(),
        name: isFolder ? name.slice(0, -1) : name,
        type: isFolder ? 'folder' : 'file',
        depth: level,
        isExpanded: true,
        children: isFolder ? [] : undefined,
      };
      
      // Find parent based on level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      
      if (stack.length === 0) {
        root.push(node);
      } else {
        const parent = stack[stack.length - 1].node;
        if (parent.children) {
          parent.children.push(node);
        }
      }
      
      if (isFolder) {
        stack.push({ node, level });
      }
    }
    
    if (root.length === 0) {
      return {
        success: false,
        error: 'No valid directory structure found in input',
      };
    }
    
    // If we have a root folder with children, adjust depths for proper indentation
    if (root.length === 1 && root[0].type === 'folder' && root[0].children && root[0].children.length > 0) {
      const adjustDepth = (nodes: TreeNode[], increment: number) => {
        nodes.forEach(node => {
          node.depth += increment;
          if (node.children) {
            adjustDepth(node.children, increment);
          }
        });
      };
      adjustDepth(root[0].children, 1);
    }
    
    return { success: true, nodes: root };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse ASCII format: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Sanitizes input by removing comments and excessive whitespace
 */
function sanitizeInput(input: string): string {
  return input
    .split('\n')
    .map(line => {
      // Remove lines that start with # (full line comments)
      if (line.trim().startsWith('#')) {
        return '';
      }
      
      // Remove inline comments (everything after # including the #)
      const commentIndex = line.indexOf('#');
      if (commentIndex !== -1) {
        line = line.substring(0, commentIndex);
      }
      
      return line;
    })
    .filter(line => {
      // Remove completely empty lines
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        return false;
      }
      
      // Remove lines that only contain tree characters and whitespace, no actual folder/file names
      // Keep lines that have at least one alphanumeric character or slash
      const hasContent = /[a-zA-Z0-9_.\-/]/.test(trimmed);
      
      return hasContent;
    })
    .join('\n');
}

/**
 * Main parser function that detects format and parses accordingly
 */
export function parseDirectoryStructure(input: string): ParseResult {
  // Validate input
  if (!input || !input.trim()) {
    return {
      success: false,
      error: 'Input is empty. Please provide a directory structure.',
    };
  }
  
  // Sanitize input to remove comments and excessive whitespace
  const sanitizedInput = sanitizeInput(input);
  
  if (!sanitizedInput.trim()) {
    return {
      success: false,
      error: 'Input contains only comments or whitespace. Please provide a valid directory structure.',
    };
  }
  
  // Detect format
  const format = detectFormat(sanitizedInput);
  
  if (format === 'unknown') {
    return {
      success: false,
      error: 'Unable to detect input format. Please use markdown (- folder/) or ASCII (├── folder/) format.',
    };
  }
  
  // Parse based on detected format
  if (format === 'markdown') {
    return parseMarkdown(sanitizedInput);
  } else {
    return parseAscii(sanitizedInput);
  }
}
