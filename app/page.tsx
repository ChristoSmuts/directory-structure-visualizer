'use client';

import { useRef, useState, useEffect } from 'react';
import { InputPanel } from '@/components/InputPanel';
import { TreeView } from '@/components/TreeView';
import { ExportControls } from '@/components/ExportControls';
import { useTreeState } from '@/hooks/useTreeState';
import { TreeNode } from '@/lib/types';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { state, setTree, toggleExpand, renameNode, deleteNode, selectNode } = useTreeState();
  const treeViewRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleParse = (nodes: TreeNode[]) => {
    setTree(nodes);
    // Auto-select first node for keyboard navigation
    if (nodes.length > 0) {
      selectNode(nodes[0].id);
    }
  };

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header 
        className="border-b border-border/50 bg-card/80 backdrop-blur-sm"
        role="banner"
      >
        <div className="container mx-auto px-4 py-4 md:py-5 lg:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-foreground tracking-tight">
                Directory Structure Visualizer
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5">
                Parse and visualize directory structures with interactive editing
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="container mx-auto px-4 py-4 md:py-6 lg:py-8 flex-1" role="main">
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4 md:gap-6 h-full">
          {/* Input Panel */}
          <section className="flex flex-col space-y-3 md:space-y-4" aria-labelledby="input-heading">
            <h2 id="input-heading" className="text-base md:text-lg font-semibold text-foreground lg:hidden">Input</h2>
            <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <InputPanel onParse={handleParse} />
            </div>
          </section>

          {/* Visualization Panel */}
          <section className="flex flex-col space-y-3 md:space-y-4" aria-labelledby="visualization-heading">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-3">
              <h2 id="visualization-heading" className="text-base md:text-lg font-semibold text-foreground">Visualization</h2>
              <ExportControls
                nodes={state.nodes}
                treeViewRef={treeViewRef}
                disabled={!state.nodes || state.nodes.length === 0}
              />
            </div>
            
            <div className="flex-1 min-h-[400px] md:min-h-[500px]">
              <TreeView
                ref={treeViewRef}
                nodes={state.nodes}
                onToggleExpand={toggleExpand}
                onRename={renameNode}
                onDelete={deleteNode}
                onSelect={selectNode}
                selectedNodeId={state.selectedNodeId}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Scroll to top button */}
      <Button
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg transition-all duration-300 z-50',
          'hover:shadow-xl hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none',
        )}
        aria-label="Scroll to top"
        size="icon"
      >
        <ArrowUp className="w-5 h-5" />
      </Button>

      {/* Footer */}
      {/* <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Built with Next.js 15, Tailwind CSS 4, and shadcn/ui
          </p>
        </div>
      </footer> */}
    </div>
  );
}
