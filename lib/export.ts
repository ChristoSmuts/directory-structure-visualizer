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
