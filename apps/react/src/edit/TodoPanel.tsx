import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleCheck,
  Clock,
  ListChecks,
  PanelRightClose,
  Trash2,
} from "lucide-react";
import {
  removeTodoListItem,
  type TodoListItem,
  type TodoListItemType,
} from "@/model/todolist/TodoList.ts";
import { useArsredovisningStore } from "@/stores/arsredovisningStore.ts";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item.tsx";
import { cn } from "@/lib/utils.ts";

/** Ordning + etiketter för typgrupperingen i listan. */
const TYPE_ORDER: TodoListItemType[] = ["validation", "import", "info"];
const TYPE_LABEL: Record<TodoListItemType, string> = {
  validation: "Kontroller",
  import: "Import",
  info: "Övrigt",
};

/** En post räknas som färdig när den har uppgifter och alla är avbockade. */
function isItemDone(item: TodoListItem): boolean {
  return item.tasks.length > 0 && item.tasks.every((t) => t.complete);
}

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
  const [hideCompleted, setHideCompleted] = useState(false);

  const items = arsredovisning?.gredorState.todoList.items ?? [];
  const count = items.length;
  // Notisbadgen räknar bara oavklarade poster.
  const unfinishedCount = items.filter((item) => !isItemDone(item)).length;

  const visibleItems = hideCompleted
    ? items.filter((item) => !isItemDone(item))
    : items;
  // Gruppera synliga poster per typ (i bestämd ordning), hoppa över tomma typer.
  const groups = TYPE_ORDER.map((type) => ({
    type,
    items: visibleItems.filter((item) => (item.type ?? "info") === type),
  })).filter((group) => group.items.length > 0);

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
          {unfinishedCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unfinishedCount}
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
          {unfinishedCount > 0 && (
            <Badge variant="secondary">{unfinishedCount}</Badge>
          )}
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

      {count > 0 && (
        <label className="flex cursor-pointer select-none items-center gap-2 border-b px-4 pb-2.5 text-xs text-ink-medium">
          <input
            type="checkbox"
            className="size-3.5 accent-primary"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            data-testid="todo-hide-completed"
          />
          Dölj färdiga
        </label>
      )}

      {count === 0 ? (
        <div className="px-4 py-10 text-center text-ink-light">
          <CircleCheck className="mx-auto mb-2 size-8 text-success/70" />
          <p className="font-medium text-ink">Allt klart!</p>
          <p className="mt-1 text-xs">
            Här visas meddelanden från Gredor, t.ex. när fel upptäcks i
            årsredovisningen. Just nu finns det ingenting att åtgärda.
          </p>
        </div>
      ) : groups.length === 0 ? (
        <div className="px-4 py-10 text-center text-ink-light">
          <CircleCheck className="mx-auto mb-2 size-8 text-success/70" />
          <p className="font-medium text-ink">Allt åtgärdat!</p>
          <p className="mt-1 text-xs">Alla poster är avbockade.</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {groups.map((group) => (
            <div key={group.type}>
              <div className="mb-2 px-0.5 text-xs font-semibold uppercase tracking-wide text-ink-light">
                {TYPE_LABEL[group.type]}
              </div>
              <ItemGroup className="gap-3">
                {group.items.map((item) => (
                  <TodoItemCard
                    key={item.id}
                    item={item}
                    hideCompletedTasks={hideCompleted}
                    onDelete={() =>
                      edit((ar) =>
                        removeTodoListItem(ar.gredorState.todoList, item.id),
                      )
                    }
                    onToggleTask={(taskIndex) =>
                      edit((ar) => {
                        const storeItem = ar.gredorState.todoList.items.find(
                          (i) => i.id === item.id,
                        );
                        const task = storeItem?.tasks[taskIndex];
                        if (task) task.complete = !task.complete;
                      })
                    }
                  />
                ))}
              </ItemGroup>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function TodoItemCard({
  item,
  hideCompletedTasks,
  onDelete,
  onToggleTask,
}: {
  item: TodoListItem;
  hideCompletedTasks: boolean;
  onDelete: () => void;
  onToggleTask: (taskIndex: number) => void;
}) {
  const done = isItemDone(item);
  // Behåll ursprungsindex så växlingen träffar rätt uppgift i storen.
  const visibleTasks = item.tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => !hideCompletedTasks || !task.complete);
  return (
    <Item
      variant="outline"
      size="sm"
      data-testid={`todo-list-item-${item.id}`}
      className={cn(
        "flex-col items-stretch gap-3 border-l-4 bg-surface",
        done ? "border-l-success opacity-70" : "border-l-primary",
      )}
    >
      <ItemHeader className="items-start">
        <ItemContent className="gap-0.5">
          <ItemTitle className="font-semibold text-ink">
            {done && <CheckCircle2 className="size-4 text-success" />}
            {item.title}
          </ItemTitle>
          {item.description && (
            <ItemDescription className="text-xs text-ink-medium">
              {item.description}
            </ItemDescription>
          )}
          <div className="mt-1.5 inline-flex w-fit items-center gap-1 rounded border bg-card px-1.5 py-0.5 text-[11px] text-ink-medium">
            <Clock className="size-3" />
            {new Date(item.timestamp).toLocaleDateString("sv-SE")}{" "}
            {new Date(item.timestamp).toLocaleTimeString("sv-SE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </ItemContent>
        <ItemActions>
          <button
            type="button"
            title="Ta bort avsnittet från att-åtgärda-listan"
            data-testid={`todo-list-item-delete-${item.id}`}
            className="shrink-0 text-danger hover:opacity-80"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </button>
        </ItemActions>
      </ItemHeader>

      {visibleTasks.length > 0 && (
        <ul className="basis-full space-y-1.5 border-t pt-2">
          {visibleTasks.map(({ task, index: taskIndex }) => (
            <li key={task.text}>
              <button
                type="button"
                data-testid={`todo-list-item-${item.id}-task-${taskIndex}`}
                aria-pressed={task.complete}
                className="flex w-full items-start gap-2 rounded px-1 py-0.5 text-left text-xs hover:bg-primary/5"
                onClick={() => onToggleTask(taskIndex)}
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
    </Item>
  );
}
