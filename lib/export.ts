/**
 * Export utilities for image and text export functionality
 */

import { toPng } from 'html-to-image';
import { TreeNode } from './types';
import { formatTreeToText } from './formatter';

/**
 * Export tree view as PNG image
 * 
 * @param element - The DOM element to capture
 * @param filename - Name for the downloaded file
 * @returns Promise that resolves when export is complete
 */
export async function exportAsImage(
  element: HTMLElement,
  filename: string = 'directory-structure.png'
): Promise<void> {
  try {
    // Generate PNG from the element
    const dataUrl = await toPng(element, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2, // Higher quality export
    });

    // Create download link and trigger download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export image:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
}

/**
 * Copy tree structure as formatted text to clipboard
 * 
 * @param nodes - Tree nodes to format and copy
 * @param style - Format style ('markdown' or 'ascii')
 * @returns Promise that resolves when copy is complete
 */
export async function copyAsText(
  nodes: TreeNode[],
  style: 'markdown' | 'ascii' = 'markdown'
): Promise<void> {
  try {
    // Generate formatted text
    const text = formatTreeToText(nodes, { style });

    // Use Clipboard API to copy text
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    
    // Check if it's a permission error
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      throw new Error('Clipboard access denied. Please grant permission and try again.');
    }
    
    throw new Error('Failed to copy to clipboard. Please try again.');
  }
}

/**
 * Check if clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return typeof navigator !== 'undefined' && 
         typeof navigator.clipboard !== 'undefined' &&
         typeof navigator.clipboard.writeText === 'function';
}

/**
 * Script types for different shells/platforms
 */
export type ScriptType = 'powershell' | 'cmd' | 'bash' | 'zsh';

/**
 * Generate a shell script to create the directory structure
 * 
 * @param nodes - Tree nodes to convert to script
 * @param scriptType - Type of script to generate
 * @returns Shell script as string
 */
export function generateScript(nodes: TreeNode[], scriptType: ScriptType): string {
  const paths: { folders: string[]; files: string[] } = { folders: [], files: [] };
  
  // Collect all paths
  function collectPaths(node: TreeNode, parentPath: string = '') {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    
    if (node.type === 'folder') {
      paths.folders.push(currentPath);
      if (node.children) {
        for (const child of node.children) {
          collectPaths(child, currentPath);
        }
      }
    } else {
      paths.files.push(currentPath);
    }
  }
  
  for (const node of nodes) {
    collectPaths(node);
  }
  
  // Generate script based on type
  switch (scriptType) {
    case 'powershell':
      return generatePowerShellScript(paths);
    case 'cmd':
      return generateCmdScript(paths);
    case 'bash':
      return generateBashScript(paths);
    case 'zsh':
      return generateZshScript(paths);
    default:
      throw new Error(`Unsupported script type: ${scriptType}`);
  }
}

/**
 * Generate PowerShell script
 */
function generatePowerShellScript(paths: { folders: string[]; files: string[] }): string {
  const lines: string[] = [
    '# PowerShell script to create directory structure',
    '# Run this script in PowerShell',
    '',
  ];
  
  // Create folders
  if (paths.folders.length > 0) {
    lines.push('# Create directories');
    for (const folder of paths.folders) {
      const psPath = folder.replace(/\//g, '\\');
      lines.push(`New-Item -ItemType Directory -Force -Path "${psPath}" | Out-Null`);
    }
    lines.push('');
  }
  
  // Create files
  if (paths.files.length > 0) {
    lines.push('# Create files');
    for (const file of paths.files) {
      const psPath = file.replace(/\//g, '\\');
      lines.push(`New-Item -ItemType File -Force -Path "${psPath}" | Out-Null`);
    }
    lines.push('');
  }
  
  lines.push('Write-Host "Directory structure created successfully!" -ForegroundColor Green');
  
  return lines.join('\n');
}

/**
 * Generate CMD/Batch script
 */
function generateCmdScript(paths: { folders: string[]; files: string[] }): string {
  const lines: string[] = [
    '@echo off',
    'REM Batch script to create directory structure',
    'REM Run this script in Command Prompt',
    '',
  ];
  
  // Create folders
  if (paths.folders.length > 0) {
    lines.push('REM Create directories');
    for (const folder of paths.folders) {
      const cmdPath = folder.replace(/\//g, '\\');
      lines.push(`mkdir "${cmdPath}" 2>nul`);
    }
    lines.push('');
  }
  
  // Create files
  if (paths.files.length > 0) {
    lines.push('REM Create files');
    for (const file of paths.files) {
      const cmdPath = file.replace(/\//g, '\\');
      lines.push(`type nul > "${cmdPath}"`);
    }
    lines.push('');
  }
  
  lines.push('echo Directory structure created successfully!');
  
  return lines.join('\n');
}

/**
 * Generate Bash script
 */
function generateBashScript(paths: { folders: string[]; files: string[] }): string {
  const lines: string[] = [
    '#!/bin/bash',
    '# Bash script to create directory structure',
    '# Run: chmod +x script.sh && ./script.sh',
    '',
  ];
  
  // Create folders
  if (paths.folders.length > 0) {
    lines.push('# Create directories');
    for (const folder of paths.folders) {
      lines.push(`mkdir -p "${folder}"`);
    }
    lines.push('');
  }
  
  // Create files
  if (paths.files.length > 0) {
    lines.push('# Create files');
    for (const file of paths.files) {
      lines.push(`touch "${file}"`);
    }
    lines.push('');
  }
  
  lines.push('echo "Directory structure created successfully!"');
  
  return lines.join('\n');
}

/**
 * Generate Zsh script (similar to Bash but with Zsh-specific features)
 */
function generateZshScript(paths: { folders: string[]; files: string[] }): string {
  const lines: string[] = [
    '#!/bin/zsh',
    '# Zsh script to create directory structure',
    '# Run: chmod +x script.sh && ./script.sh',
    '',
  ];
  
  // Create folders
  if (paths.folders.length > 0) {
    lines.push('# Create directories');
    for (const folder of paths.folders) {
      lines.push(`mkdir -p "${folder}"`);
    }
    lines.push('');
  }
  
  // Create files
  if (paths.files.length > 0) {
    lines.push('# Create files');
    for (const file of paths.files) {
      lines.push(`touch "${file}"`);
    }
    lines.push('');
  }
  
  lines.push('print "Directory structure created successfully!"');
  
  return lines.join('\n');
}

/**
 * Copy generated script to clipboard
 * 
 * @param nodes - Tree nodes to convert to script
 * @param scriptType - Type of script to generate
 * @returns Promise that resolves when copy is complete
 */
export async function copyAsScript(
  nodes: TreeNode[],
  scriptType: ScriptType
): Promise<void> {
  try {
    const script = generateScript(nodes, scriptType);
    await navigator.clipboard.writeText(script);
  } catch (error) {
    console.error('Failed to copy script to clipboard:', error);
    
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      throw new Error('Clipboard access denied. Please grant permission and try again.');
    }
    
    throw new Error('Failed to copy script to clipboard. Please try again.');
  }
}
