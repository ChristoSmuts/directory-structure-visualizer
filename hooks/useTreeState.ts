import { useReducer } from 'react';
import { TreeNode, TreeState, TreeAction } from '@/lib/types';

/**
 * Initial state for the tree
 */
const initialState: TreeState = {
  nodes: [],
  selectedNodeId: null,
};

/**
 * Helper function to recursively toggle expand state of a node
 */
function toggleNodeExpand(nodes: TreeNode[], targetId: string): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === targetId && node.type === 'folder') {
      return {
        ...node,
        isExpanded: !node.isExpanded,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: toggleNodeExpand(node.children, targetId),
      };
    }
    return node;
  });
}

/**
 * Helper function to recursively rename a node
 */
function renameNode(nodes: TreeNode[], targetId: string, newName: string): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return {
        ...node,
        name: newName,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: renameNode(node.children, targetId, newName),
      };
    }
    return node;
  });
}

/**
 * Helper function to recursively delete a node
 */
function deleteNode(nodes: TreeNode[], targetId: string): TreeNode[] {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => {
      if (node.children) {
        return {
          ...node,
          children: deleteNode(node.children, targetId),
        };
      }
      return node;
    });
}

/**
 * Helper function to find a node by ID
 */
function findNodeById(nodes: TreeNode[], targetId: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Reducer function for tree state management
 */
function treeReducer(state: TreeState, action: TreeAction): TreeState {
  switch (action.type) {
    case 'SET_TREE':
      return {
        ...state,
        nodes: action.payload,
        selectedNodeId: null,
      };

    case 'TOGGLE_EXPAND':
      return {
        ...state,
        nodes: toggleNodeExpand(state.nodes, action.payload),
      };

    case 'RENAME_NODE':
      return {
        ...state,
        nodes: renameNode(state.nodes, action.payload.id, action.payload.name),
      };

    case 'DELETE_NODE':
      return {
        ...state,
        nodes: deleteNode(state.nodes, action.payload),
        selectedNodeId: state.selectedNodeId === action.payload ? null : state.selectedNodeId,
      };

    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Custom hook for managing tree state
 */
export function useTreeState() {
  const [state, dispatch] = useReducer(treeReducer, initialState);

  /**
   * Set the entire tree structure
   */
  const setTree = (nodes: TreeNode[]) => {
    dispatch({ type: 'SET_TREE', payload: nodes });
  };

  /**
   * Toggle the expanded state of a folder node
   */
  const toggleExpand = (id: string) => {
    dispatch({ type: 'TOGGLE_EXPAND', payload: id });
  };

  /**
   * Rename a node
   */
  const renameNodeById = (id: string, name: string) => {
    dispatch({ type: 'RENAME_NODE', payload: { id, name } });
  };

  /**
   * Delete a node
   */
  const deleteNodeById = (id: string) => {
    dispatch({ type: 'DELETE_NODE', payload: id });
  };

  /**
   * Select a node
   */
  const selectNode = (id: string | null) => {
    dispatch({ type: 'SELECT_NODE', payload: id });
  };

  /**
   * Find a node by its ID
   */
  const getNodeById = (id: string): TreeNode | null => {
    return findNodeById(state.nodes, id);
  };

  return {
    state,
    setTree,
    toggleExpand,
    renameNode: renameNodeById,
    deleteNode: deleteNodeById,
    selectNode,
    getNodeById,
  };
}
