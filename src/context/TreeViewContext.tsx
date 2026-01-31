import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface TreeViewContextValue {
  expandLevel: number;
  expandOneLevel: () => void;
  collapseAll: () => void;
  filterMode: boolean;
  toggleFilterMode: () => void;
  ancestorPaths: Set<string>;
  maxDepth: number;
}

const EMPTY_SET = new Set<string>();
const DEFAULT_EXPAND_LEVEL = 4;

const TreeViewContext = createContext<TreeViewContextValue>({
  expandLevel: DEFAULT_EXPAND_LEVEL,
  expandOneLevel: () => {},
  collapseAll: () => {},
  filterMode: false,
  toggleFilterMode: () => {},
  ancestorPaths: EMPTY_SET,
  maxDepth: 0,
});

export function TreeViewProvider({
  children,
  ancestorPaths = EMPTY_SET,
  maxDepth = 0,
}: {
  children: ReactNode;
  ancestorPaths?: Set<string>;
  maxDepth?: number;
}) {
  const [expandLevel, setExpandLevel] = useState(DEFAULT_EXPAND_LEVEL);
  const [filterMode, setFilterMode] = useState(false);

  const expandOneLevel = useCallback(
    () => setExpandLevel((l) => Math.min(l + 1, maxDepth + 1)),
    [maxDepth],
  );
  const collapseAll = useCallback(
    () => setExpandLevel(0),
    [],
  );
  const toggleFilterMode = useCallback(
    () => setFilterMode((f) => !f),
    [],
  );

  return (
    <TreeViewContext.Provider
      value={{
        expandLevel,
        expandOneLevel,
        collapseAll,
        filterMode,
        toggleFilterMode,
        ancestorPaths,
        maxDepth,
      }}
    >
      {children}
    </TreeViewContext.Provider>
  );
}

export function useTreeView() {
  return useContext(TreeViewContext);
}
