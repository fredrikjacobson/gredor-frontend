import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Delad UI-state för noter-navigeringen så trädet i vänsterrailen och
 * EditNoter-panelen håller samma hopfällda kategorier och filter. Själva
 * taxonomin laddas separat i respektive komponent (getTaxonomyManager är
 * cachad per rot, så det är billigt).
 */
interface NoterNavState {
  /** Kategorier (xmlName) som är hopfällda. Öppna är standard. */
  collapsed: ReadonlySet<string>;
  toggleCategory: (key: string) => void;
  expandCategory: (key: string) => void;
  filter: string;
  setFilter: (value: string) => void;
}

const NoterNavContext = createContext<NoterNavState | null>(null);

export function NoterNavProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  const value = useMemo<NoterNavState>(
    () => ({
      collapsed,
      toggleCategory: (key) =>
        setCollapsed((prev) => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return next;
        }),
      expandCategory: (key) =>
        setCollapsed((prev) => {
          if (!prev.has(key)) return prev;
          const next = new Set(prev);
          next.delete(key);
          return next;
        }),
      filter,
      setFilter,
    }),
    [collapsed, filter],
  );

  return (
    <NoterNavContext.Provider value={value}>
      {children}
    </NoterNavContext.Provider>
  );
}

export function useNoterNav(): NoterNavState {
  const ctx = useContext(NoterNavContext);
  if (!ctx) {
    throw new Error("useNoterNav måste användas inom NoterNavProvider");
  }
  return ctx;
}
