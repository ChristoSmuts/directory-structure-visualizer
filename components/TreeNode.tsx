'use client';

import { TreeNode as TreeNodeType } from '@/lib/types';
import { ChevronRight, ChevronDown, Folder, File, Pencil, Trash2, X, Check, FolderPlus, FilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface TreeNodeProps {
  node: TreeNodeType;
  onToggleExpand: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  onAddNode?: (parentId: string, nodeType: 'file' | 'folder') => void;
  selectedNodeId?: string | null;
}

export function TreeNode({
  node,
  onToggleExpand,
  onRename,
  onDelete,
  onSelect,
  onAddNode,
  selectedNodeId,
}: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.name);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isFolder = node.type === 'folder';
  const isExpanded = node.isExpanded ?? false;
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Focus management: return focus to node after editing
  useEffect(() => {
    if (!isEditing && isSelected && nodeRef.current) {
      nodeRef.current.focus();
    }
  }, [isEditing, isSelected]);

  const handleClick = () => {
    if (isFolder) {
      onToggleExpand(node.id);
    }
    onSelect?.(node.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent keyboard handling when editing
    if (isEditing) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        // Toggle expand/collapse for folders
        e.preventDefault();
        if (isFolder) {
          onToggleExpand(node.id);
        }
        break;
      case 'F2':
        // Enable editing mode
        e.preventDefault();
        setIsEditing(true);
        setEditValue(node.name);
        setValidationError(null);
        break;
      case 'ArrowRight':
        // Expand folder if collapsed
        e.preventDefault();
        if (isFolder && !isExpanded) {
          onToggleExpand(node.id);
        }
        break;
      case 'ArrowLeft':
        // Collapse folder if expanded
        e.preventDefault();
        if (isFolder && isExpanded) {
          onToggleExpand(node.id);
        }
        break;
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(node.name);
    setValidationError(null);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(node.name);
    setValidationError(null);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(node.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddNode) {
      onAddNode(node.id, 'folder');
    }
  };

  const handleAddFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddNode) {
      onAddNode(node.id, 'file');
    }
  };

  const handleEditComplete = () => {
    const trimmedValue = editValue.trim();
    
    // Validate non-empty name
    if (trimmedValue === '') {
      setValidationError('Name cannot be empty');
      setEditValue(node.name);
      setIsEditing(false);
      return;
    }

    // Update tree state with new name
    if (trimmedValue !== node.name && onRename) {
      onRename(node.id, trimmedValue);
    }

    setIsEditing(false);
    setValidationError(null);
  };

  const handleEditCancel = () => {
    setEditValue(node.name);
    setIsEditing(false);
    setValidationError(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditComplete();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };

  const handleBlur = () => {
    handleEditComplete();
  };

  // Calculate indentation based on depth
  const indentationStyle = {
    paddingLeft: `${node.depth * 20}px`,
  };

  return (
    <div className="select-none">
      {/* Node row */}
      <div
        ref={nodeRef}
        className={cn(
          'flex items-center gap-1.5 py-2 px-2.5 cursor-pointer rounded-lg group',
          'transition-all duration-200 ease-in-out',
          'hover:bg-accent/60',
          'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-1',
          isSelected && 'bg-accent/80',
        )}
        style={indentationStyle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="treeitem"
        aria-expanded={isFolder ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-label={`${isFolder ? 'Folder' : 'File'}: ${node.name}${isFolder && hasChildren ? `, ${isExpanded ? 'expanded' : 'collapsed'}` : ''}`}
        tabIndex={isSelected ? 0 : -1}
      >
        {/* Expand/collapse chevron for folders */}
        {isFolder ? (
          <div className="flex items-center justify-center w-4 h-4 transition-transform duration-200 ease-out">
            {hasChildren && (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                )}
              </>
            )}
          </div>
        ) : (
          <div className="w-4 h-4" />
        )}

        {/* Folder/File icon */}
        <div className="flex items-center justify-center w-4 h-4">
          {isFolder ? (
            <Folder
              className={cn(
                'w-4 h-4 transition-all duration-200 ease-in-out',
                isExpanded 
                  ? 'text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300' 
                  : 'text-yellow-600 dark:text-yellow-500 group-hover:text-yellow-700 dark:group-hover:text-yellow-400',
                'group-hover:scale-110',
              )}
            />
          ) : (
            <File className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200" />
          )}
        </div>

        {/* Node name or edit input */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleBlur}
            className={cn(
              'text-sm font-mono px-2 py-1 rounded-md border-2 border-primary/60',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'bg-background shadow-sm',
              'transition-all duration-200',
              'flex-1',
              isFolder && 'font-semibold',
            )}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Edit ${isFolder ? 'folder' : 'file'} name`}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? `${node.id}-error` : undefined}
          />
        ) : showDeleteConfirm ? (
          <>
            <span className="text-sm text-destructive font-medium flex-1">
              Delete {isFolder ? 'folder' : 'file'}?
            </span>
            
            {/* Confirm delete button */}
            <button
              onClick={handleDeleteConfirm}
              className={cn(
                'p-1.5 rounded-md bg-destructive/10 hover:bg-destructive/20 cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-destructive/50',
                'transition-colors duration-200',
              )}
              aria-label="Confirm delete"
              tabIndex={-1}
            >
              <Check className="w-3.5 h-3.5 text-destructive" />
            </button>
            
            {/* Cancel delete button */}
            <button
              onClick={handleDeleteCancel}
              className={cn(
                'p-1.5 rounded-md hover:bg-accent-foreground/10 cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-ring/50',
                'transition-colors duration-200',
              )}
              aria-label="Cancel delete"
              tabIndex={-1}
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </>
        ) : (
          <>
            <span
              className={cn(
                'text-sm font-mono transition-colors duration-200 flex-1',
                'group-hover:text-foreground',
                isFolder && 'font-semibold text-foreground',
                !isFolder && 'text-muted-foreground',
              )}
              onDoubleClick={handleDoubleClick}
            >
              {node.name}
            </span>
            
            {/* Add folder button (only for folders) */}
            {isFolder && (
              <button
                onClick={handleAddFolder}
                className={cn(
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer',
                  'p-1.5 rounded-md hover:bg-accent-foreground/10',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/50',
                )}
                aria-label="Add folder"
                tabIndex={-1}
              >
                <FolderPlus className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
              </button>
            )}
            
            {/* Add file button (only for folders) */}
            {isFolder && (
              <button
                onClick={handleAddFile}
                className={cn(
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer',
                  'p-1.5 rounded-md hover:bg-accent-foreground/10',
                  'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/50',
                )}
                aria-label="Add file"
                tabIndex={-1}
              >
                <FilePlus className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
              </button>
            )}
            
            {/* Edit button */}
            <button
              onClick={handleEditClick}
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer',
                'p-1.5 rounded-md hover:bg-accent-foreground/10',
                'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring/50',
              )}
              aria-label={`Edit ${isFolder ? 'folder' : 'file'} name`}
              tabIndex={-1}
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
            </button>
            
            {/* Delete button */}
            <button
              onClick={handleDeleteClick}
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer',
                'p-1.5 rounded-md hover:bg-destructive/10',
                'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive/50',
              )}
              aria-label={`Delete ${isFolder ? 'folder' : 'file'}`}
              tabIndex={-1}
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors duration-200" />
            </button>
          </>
        )}
        
        {/* Validation error message */}
        {validationError && (
          <span 
            id={`${node.id}-error`}
            className="text-xs text-destructive ml-2 animate-in slide-in-from-left-2 duration-200"
            role="alert"
            aria-live="polite"
          >
            {validationError}
          </span>
        )}
      </div>

      {/* Recursive rendering of children */}
      {isFolder && isExpanded && hasChildren && (
        <div
          className={cn(
            'transition-all duration-250 ease-out',
            'animate-in slide-in-from-top-2 fade-in',
          )}
          role="group"
        >
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onToggleExpand={onToggleExpand}
              onRename={onRename}
              onDelete={onDelete}
              onSelect={onSelect}
              onAddNode={onAddNode}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
