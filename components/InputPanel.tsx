'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { parseDirectoryStructure } from '@/lib/parser';
import { TreeNode } from '@/lib/types';
import { AlertCircle, FileText } from 'lucide-react';

interface InputPanelProps {
  onParse: (nodes: TreeNode[], text: string) => void;
  inputText?: string;
}

const EXAMPLE_MARKDOWN = `- src/
  - components/
    - Button.tsx
    - Input.tsx
  - lib/
    - utils.ts
- package.json
- README.md`;

const EXAMPLE_ASCII = `src/
├── components/
│   ├── Button.tsx
│   └── Input.tsx
├── lib/
│   └── utils.ts
package.json
README.md`;

export function InputPanel({ onParse, inputText = '' }: InputPanelProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync input with external inputText prop
  useEffect(() => {
    if (inputText && inputText !== input) {
      setInput(inputText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  const handleParse = () => {
    setError(null);
    
    const result = parseDirectoryStructure(input);
    
    if (result.success) {
      onParse(result.nodes, input);
      setShowExamples(false);
    } else {
      setError(result.error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (error) {
      setError(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Prevent default scroll behavior when pasting large content
    const textarea = textareaRef.current;
    if (textarea) {
      // Store current scroll position
      const scrollTop = textarea.scrollTop;
      
      // Let the paste happen naturally
      setTimeout(() => {
        // Restore scroll position after paste
        textarea.scrollTop = scrollTop;
        // Also scroll page to top if needed
        if (window.scrollY > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 0);
    }
  };

  const loadExample = (example: string) => {
    setInput(example);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-5 md:p-6">
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label htmlFor="directory-input" className="text-sm font-semibold text-foreground">
            Directory Structure Input
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs hover:bg-accent/80 transition-colors duration-200"
            aria-label={showExamples ? 'Hide example formats' : 'Show example formats'}
            aria-expanded={showExamples}
          >
            <FileText className="w-4 h-4" />
            {showExamples ? 'Hide' : 'Show'} Examples
          </Button>
        </div>

        <Button
          onClick={handleParse}
          disabled={!input.trim()}
          className="w-full transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Parse directory structure"
        >
          Parse Structure
        </Button>

        <Textarea
          ref={textareaRef}
          id="directory-input"
          value={input}
          onChange={handleInputChange}
          onPaste={handlePaste}
          placeholder="Paste your directory structure here..."
          className="flex-1 font-mono text-sm resize-none min-h-[300px] border-border/60 focus:border-primary/50 transition-colors duration-200 bg-background/50"
          aria-label="Directory structure input"
          aria-invalid={!!error}
        />

        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-200">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Parsing Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {showExamples && (
        <div className="border-t border-border/50 pt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-semibold text-foreground">Example Formats</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Markdown Format</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(EXAMPLE_MARKDOWN)}
                  className="text-xs hover:bg-accent/80 hover:border-primary/30 transition-all duration-200"
                  aria-label="Load markdown format example"
                >
                  Load Example
                </Button>
              </div>
              <pre className="bg-muted/50 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-border/30 hover:border-border/60 transition-colors duration-200">
                {EXAMPLE_MARKDOWN}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">ASCII Format</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(EXAMPLE_ASCII)}
                  className="text-xs hover:bg-accent/80 hover:border-primary/30 transition-all duration-200"
                  aria-label="Load ASCII format example"
                >
                  Load Example
                </Button>
              </div>
              <pre className="bg-muted/50 p-3 rounded-lg text-xs font-mono overflow-x-auto border border-border/30 hover:border-border/60 transition-colors duration-200">
                {EXAMPLE_ASCII}
              </pre>
            </div>

            <div className="text-xs text-muted-foreground space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border/20">
              <p className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Folders should end with a forward slash (/)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use consistent indentation (2 or 4 spaces)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Both markdown (-) and ASCII (├──, └──) formats are supported</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
