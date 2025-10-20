import { describe, it, expect } from 'vitest';
import { generateScript } from '@/lib/export';
import { TreeNode } from '@/lib/types';

describe('Script Generation', () => {
  const sampleTree: TreeNode[] = [
    {
      id: '1',
      name: 'src',
      type: 'folder',
      depth: 0,
      children: [
        {
          id: '2',
          name: 'components',
          type: 'folder',
          depth: 1,
          children: [
            { id: '3', name: 'Button.tsx', type: 'file', depth: 2 },
            { id: '4', name: 'Input.tsx', type: 'file', depth: 2 },
          ],
        },
        { id: '5', name: 'index.ts', type: 'file', depth: 1 },
      ],
    },
    { id: '6', name: 'README.md', type: 'file', depth: 0 },
  ];

  describe('PowerShell Script', () => {
    it('should generate valid PowerShell script', () => {
      const script = generateScript(sampleTree, 'powershell');
      
      expect(script).toContain('# PowerShell script');
      expect(script).toContain('New-Item -ItemType Directory');
      expect(script).toContain('New-Item -ItemType File');
      expect(script).toContain('src\\components');
      expect(script).toContain('src\\components\\Button.tsx');
      expect(script).toContain('README.md');
    });
  });

  describe('CMD Script', () => {
    it('should generate valid CMD/Batch script', () => {
      const script = generateScript(sampleTree, 'cmd');
      
      expect(script).toContain('@echo off');
      expect(script).toContain('REM Batch script');
      expect(script).toContain('mkdir');
      expect(script).toContain('type nul >');
      expect(script).toContain('src\\components');
      expect(script).toContain('src\\components\\Button.tsx');
    });
  });

  describe('Bash Script', () => {
    it('should generate valid Bash script', () => {
      const script = generateScript(sampleTree, 'bash');
      
      expect(script).toContain('#!/bin/bash');
      expect(script).toContain('mkdir -p');
      expect(script).toContain('touch');
      expect(script).toContain('src/components');
      expect(script).toContain('src/components/Button.tsx');
      expect(script).toContain('README.md');
    });
  });

  describe('Zsh Script', () => {
    it('should generate valid Zsh script', () => {
      const script = generateScript(sampleTree, 'zsh');
      
      expect(script).toContain('#!/bin/zsh');
      expect(script).toContain('mkdir -p');
      expect(script).toContain('touch');
      expect(script).toContain('print');
      expect(script).toContain('src/components');
    });
  });

  describe('Path Handling', () => {
    it('should handle nested folder structures', () => {
      const deepTree: TreeNode[] = [
        {
          id: '1',
          name: 'a',
          type: 'folder',
          depth: 0,
          children: [
            {
              id: '2',
              name: 'b',
              type: 'folder',
              depth: 1,
              children: [
                {
                  id: '3',
                  name: 'c',
                  type: 'folder',
                  depth: 2,
                  children: [
                    { id: '4', name: 'file.txt', type: 'file', depth: 3 },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const bashScript = generateScript(deepTree, 'bash');
      expect(bashScript).toContain('a/b/c');
      expect(bashScript).toContain('a/b/c/file.txt');
    });

    it('should handle files at root level', () => {
      const rootFiles: TreeNode[] = [
        { id: '1', name: 'file1.txt', type: 'file', depth: 0 },
        { id: '2', name: 'file2.txt', type: 'file', depth: 0 },
      ];

      const script = generateScript(rootFiles, 'bash');
      expect(script).toContain('touch "file1.txt"');
      expect(script).toContain('touch "file2.txt"');
    });
  });
});
