'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, Copy, Loader2, Check, Terminal, ChevronDown } from 'lucide-react';
import { TreeNode } from '@/lib/types';
import { exportAsImage, copyAsText, isClipboardAvailable, copyAsScript, ScriptType } from '@/lib/export';
import { Alert, AlertDescription } from './ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ExportControlsProps {
  nodes: TreeNode[];
  treeViewRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}

/**
 * ExportControls component provides buttons for exporting the tree structure
 * as an image or copying it as formatted text
 */
export function ExportControls({ nodes, treeViewRef, disabled }: ExportControlsProps) {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isCopyingScript, setIsCopyingScript] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [scriptCopySuccess, setScriptCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipboardAvailable, setClipboardAvailable] = useState(true); // Default to true to avoid hydration mismatch

  // Check clipboard availability only on client side after hydration
  useEffect(() => {
    setClipboardAvailable(isClipboardAvailable());
  }, []);

  const handleExportImage = async () => {
    if (!treeViewRef.current || disabled) return;

    setIsExportingImage(true);
    setError(null);

    try {
      await exportAsImage(treeViewRef.current);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export image';
      setError(message);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleCopyText = async () => {
    if (disabled || !nodes || nodes.length === 0) return;

    setIsCopying(true);
    setError(null);
    setCopySuccess(false);

    try {
      await copyAsText(nodes, 'markdown');
      setCopySuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to copy to clipboard';
      setError(message);
    } finally {
      setIsCopying(false);
    }
  };

  const handleCopyScript = async (scriptType: ScriptType) => {
    if (disabled || !nodes || nodes.length === 0) return;

    setIsCopyingScript(true);
    setError(null);
    setScriptCopySuccess(false);

    try {
      await copyAsScript(nodes, scriptType);
      setScriptCopySuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setScriptCopySuccess(false);
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to copy script to clipboard';
      setError(message);
    } finally {
      setIsCopyingScript(false);
    }
  };

  const hasNodes = nodes && nodes.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleExportImage}
          disabled={disabled || !hasNodes || isExportingImage}
          variant="default"
          size="sm"
          className="gap-2 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          aria-label="Export directory structure as PNG image"
          aria-busy={isExportingImage}
        >
          {isExportingImage ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span className="hidden sm:inline">Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Export as Image</span>
              <span className="sm:hidden">Export</span>
            </>
          )}
        </Button>

        <Button
          onClick={handleCopyText}
          disabled={disabled || !hasNodes || isCopying || !clipboardAvailable}
          variant="outline"
          size="sm"
          className="gap-2 transition-all duration-200 hover:shadow-md hover:scale-105 hover:bg-accent/80 hover:border-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          aria-label="Copy directory structure as formatted text to clipboard"
          aria-busy={isCopying}
        >
          {isCopying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span className="hidden sm:inline">Copying...</span>
            </>
          ) : copySuccess ? (
            <>
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              <span className="hidden sm:inline text-green-600 dark:text-green-400">Copied!</span>
              <span className="sm:hidden text-green-600 dark:text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Copy as Text</span>
              <span className="sm:hidden">Copy</span>
            </>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={disabled || !hasNodes || isCopyingScript || !clipboardAvailable}
              variant="outline"
              size="sm"
              className="gap-2 transition-all duration-200 hover:shadow-md hover:scale-105 hover:bg-accent/80 hover:border-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Copy directory structure as shell script"
            >
              {isCopyingScript ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span className="hidden sm:inline">Copying...</span>
                </>
              ) : scriptCopySuccess ? (
                <>
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
                  <span className="hidden sm:inline text-green-600 dark:text-green-400">Copied!</span>
                  <span className="sm:hidden text-green-600 dark:text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Copy as Script</span>
                  <span className="sm:hidden">Script</span>
                  <ChevronDown className="w-3 h-3 ml-1" aria-hidden="true" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleCopyScript('powershell')}>
              <Terminal className="w-4 h-4 mr-2" />
              PowerShell
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyScript('cmd')}>
              <Terminal className="w-4 h-4 mr-2" />
              CMD (Batch)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyScript('bash')}>
              <Terminal className="w-4 h-4 mr-2" />
              Bash
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyScript('zsh')}>
              <Terminal className="w-4 h-4 mr-2" />
              Zsh
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive" className="animate-in slide-in-from-top-2 duration-200">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {copySuccess && (
        <div 
          role="status" 
          aria-live="polite" 
          className="sr-only"
        >
          Directory structure copied to clipboard successfully
        </div>
      )}

      {!clipboardAvailable && (
        <Alert role="alert" className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/30">
          <AlertDescription className="text-xs text-yellow-900 dark:text-yellow-100">
            Clipboard API not available in this browser
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
