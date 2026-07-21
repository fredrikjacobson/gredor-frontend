import {
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleCheck,
  Clock,
  ListChecks,
  PanelRightClose,
  Trash2,
} from "lucide-react";
import { removeTodoListItem } from "@/model/todolist/TodoList.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";

/**
 * Att-åtgärda-rail (port av ToolsTodoListContent.vue). Dockad, hopfällbar
 * kolumn på editorns högerkant: hopfälld = smal ikonremsa med antalsbadge,
 * utfälld = full lista med kryssbara uppgifter. Ersätter den permanenta
 * 320px-kolumnen från den tidigare Vue-lika layouten.
 */
export function TodoPanel({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  const edit = useArsredovisningStore((s) => s.edit);
  useArsredovisningStore((s) => s.revision);

  const items = arsredovisning?.gredorState.todoList.items ?? [];
  const count = items.length;

  if (collapsed) {
    return (
      <aside className="flex w-12 shrink-0 flex-col items-center border-l bg-card py-3">
        <button
          type="button"
          data-testid="todo-rail-toggle"
          title="Visa att åtgärda"
          aria-label="Visa att åtgärda"
          onClick={() => onCollapsedChange(false)}
          className="relative grid size-9 place-items-center rounded-md text-ink-medium hover:bg-accent hover:text-ink"
        >
          <ListChecks className="size-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {count}
            </span>
          )}
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l bg-card">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2 font-medium text-ink">
          <ListChecks className="size-4 text-primary" /> Att åtgärda
          {count > 0 && <Badge variant="secondary">{count}</Badge>}
        </div>
        <button
          type="button"
          data-testid="todo-rail-toggle"
          title="Dölj panelen"
          aria-label="Dölj panelen"
          onClick={() => onCollapsedChange(true)}
          className="grid size-8 place-items-center rounded-md text-ink-light hover:bg-accent hover:text-ink"
        >
          <PanelRightClose className="size-4" />
        </button>
      </div>

      {count === 0 ? (
        <div className="px-4 py-10 text-center text-ink-light">
          <CircleCheck className="mx-auto mb-2 size-8 text-success/70" />
          <p className="font-medium text-ink">Allt klart!</p>
          <p className="mt-1 text-xs">
            Här visas meddelanden från Gredor, t.ex. när fel upptäcks i
            årsredovisningen. Just nu finns det ingenting att åtgärda.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {items.map((item, itemIndex) => (
            <div
              key={item.id}
              data-testid={`todo-list-item-${item.id}`}
              className="rounded-lg border border-l-4 border-l-primary bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-ink">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-ink-medium">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded border bg-card px-1.5 py-0.5 text-[11px] text-ink-medium">
                    <Clock className="size-3" />
                    {new Date(item.timestamp).toLocaleDateString("sv-SE")}{" "}
                    {new Date(item.timestamp).toLocaleTimeString("sv-SE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  title="Ta bort avsnittet från att-åtgärda-listan"
                  data-testid={`todo-list-item-delete-${item.id}`}
                  className="shrink-0 text-danger hover:opacity-80"
                  onClick={() =>
                    edit((ar) =>
                      removeTodoListItem(ar.gredorState.todoList, item.id),
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {item.tasks.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t pt-2">
                  {item.tasks.map((task, taskIndex) => (
                    <li key={task.text}>
                      <button
                        type="button"
                        data-testid={`todo-list-item-${item.id}-task-${taskIndex}`}
                        aria-pressed={task.complete}
                        className="flex w-full items-start gap-2 rounded px-1 py-0.5 text-left text-xs hover:bg-primary/5"
                        onClick={() =>
                          edit((ar) => {
                            const t =
                              ar.gredorState.todoList.items[itemIndex]?.tasks[
                                taskIndex
                              ];
                            if (t) t.complete = !t.complete;
                          })
                        }
                      >
                        {task.complete ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                        ) : (
                          <Circle className="mt-0.5 size-4 shrink-0 text-ink-light" />
                        )}
                        <span
                          className={cn(
                            task.complete && "text-ink-light line-through",
                          )}
                        >
                          {task.text}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
