import { CheckCircle2, Circle, CircleCheck, Clock, ListChecks, Trash2 } from "lucide-react";
import { removeTodoListItem } from "@/model/todolist/TodoList.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { cn } from "@/lib/utils.ts";

/**
 * Port av ToolsTodoListContent.vue — den persistenta att-åtgärda-panelen
 * (ersätter Vue-appens popover). Visar meddelanden från Gredor (t.ex.
 * SIE-import-varningar och kontroller) med kryssbara uppgifter.
 */
export function TodoPanel() {
  const arsredovisning = useArsredovisningStore((s) => s.arsredovisning);
  const edit = useArsredovisningStore((s) => s.edit);
  useArsredovisningStore((s) => s.revision);

  const items = arsredovisning?.gredorState.todoList.items ?? [];

  return (
    <aside className="sticky top-4 rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2 font-medium text-ink">
        <ListChecks className="size-4 text-primary" /> Att åtgärda
      </div>

      {items.length === 0 ? (
        <div className="py-6 text-center text-ink-light">
          <CircleCheck className="mx-auto mb-2 size-8 text-success/70" />
          <p className="font-medium text-ink">Allt klart!</p>
          <p className="mt-1 text-xs">
            Här visas meddelanden från Gredor, t.ex. när fel upptäcks i
            årsredovisningen. Just nu finns det ingenting att åtgärda.
          </p>
        </div>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {items.map((item, itemIndex) => (
            <div
              key={item.id}
              data-testid={`todo-list-item-${item.id}`}
              className="rounded-md border border-line border-l-4 border-l-primary bg-surface-medium p-3"
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
                  <div className="mt-1.5 inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] text-ink-medium">
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
                <ul className="mt-3 space-y-1.5 border-t border-line pt-2">
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
