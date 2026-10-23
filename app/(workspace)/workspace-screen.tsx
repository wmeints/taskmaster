"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { InlineAddForm } from "@/components/molecules/inline-add-form";
import { PlannerTabs } from "@/components/molecules/planner-tabs";
import { ViewHeader } from "@/components/molecules/view-header";
import { ShortcutBar } from "@/components/organisms/shortcut-bar";
import { TaskDetail } from "@/components/organisms/task-detail";
import { TaskList } from "@/components/organisms/task-list";
import { ViewTemplate } from "@/components/templates/view-template";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useShortcuts } from "@/hooks/use-shortcuts";
import { viewOf } from "@/lib/tasks/deadlines";
import { headingFor } from "@/lib/tasks/headings";
import { applyChange, type Change } from "@/lib/tasks/optimistic";
import { hrefFor } from "@/lib/tasks/routes";
import { newTaskSchema, type TaskChanges } from "@/lib/tasks/schemas";
import { plannerViews, viewTitles, type Task, type View, type Workspace } from "@/lib/tasks/types";
import {
  addSubtaskAction,
  createTaskAction,
  deleteSubtaskAction,
  deleteTaskAction,
  updateSubtaskAction,
  updateTaskAction,
} from "./actions";
import { useWorkspaceShell } from "./workspace-shell";

type FocusTarget = "deadline" | "subtask";

// The main screen: one view or list, its tasks, and the open task's details, all driven by the keyboard.
// Renders inside the layout's WorkspaceShell, which owns the sidebar.
export function WorkspaceScreen({
  workspace: serverWorkspace,
  initialTaskId,
}: {
  workspace: Workspace;
  initialTaskId?: string;
}) {
  const shell = useWorkspaceShell();
  const [workspace, predict] = useOptimistic(serverWorkspace, applyChange);
  const [, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(initialTaskId ?? null);
  const [detailOpen, setDetailOpen] = useState(initialTaskId !== undefined);
  const [hideCompleted, setHideCompleted] = useState(false);
  // The sheet small screens use to add a task.
  const [adding, setAdding] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ target: FocusTarget } | null>(null);
  const quickAddRef = useRef<HTMLInputElement>(null);
  const deadlineRef = useRef<HTMLButtonElement>(null);
  const subtaskRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);

  const { scope, today } = workspace;
  const visible = hideCompleted ? workspace.todo : [...workspace.todo, ...workspace.completed];
  const selected = visible.find((task) => task.id === selectedId) ?? null;
  const open = detailOpen ? selected : null;
  const plannerView =
    "view" in scope && (plannerViews as readonly View[]).includes(scope.view) ? scope.view : null;

  useEffect(() => {
    if (selectedId) document.querySelector(`[data-task-id="${selectedId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);

  // Focus a field in the details panel once it has rendered.
  useEffect(() => {
    if (!focusRequest) return;
    (focusRequest.target === "deadline" ? deadlineRef : subtaskRef).current?.focus();
  }, [focusRequest]);

  // Keep the open task in the URL so a reload or shared link opens it again.
  useEffect(() => {
    window.history.replaceState(null, "", hrefFor(scope, open?.id));
  }, [scope, open?.id]);

  // Shows the change right away, then runs the server action; the next server render replaces the prediction.
  function mutate<T>(change: Change, action: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      startTransition(async () => {
        predict(change);
        // The sidebar lives in the layout; show it the same prediction.
        const { counts, lists } = applyChange(workspace, change);
        shell.predict({ counts, lists });
        try {
          resolve(await action());
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  function updateTask(task: Task, changes: TaskChanges) {
    if (changes.completed && hideCompleted && task.id === selectedId) selectNeighbour(task);
    return mutate({ type: "update", taskId: task.id, changes }, () => updateTaskAction(task.id, changes));
  }

  function deleteTask(task: Task) {
    selectNeighbour(task);
    setDetailOpen(false);
    return mutate({ type: "delete", taskId: task.id }, () => deleteTaskAction(task.id));
  }

  async function addTask(values: { title: string }) {
    const result = await createTaskAction(scope, values);
    if ("id" in result) setSelectedId(result.id);
    return result;
  }

  function selectNeighbour(task: Task) {
    const index = visible.indexOf(task);
    setSelectedId((visible[index + 1] ?? visible[index - 1])?.id ?? null);
  }

  function move(delta: number) {
    if (visible.length === 0) return;
    const index = selected ? visible.indexOf(selected) + delta : 0;
    setSelectedId(visible[Math.min(Math.max(index, 0), visible.length - 1)].id);
  }

  function openSelected(target?: FocusTarget) {
    const task = selected ?? visible[0];
    if (!task) return;
    setSelectedId(task.id);
    setDetailOpen(true);
    if (target) setFocusRequest({ target });
  }

  useShortcuts({
    j: () => move(1),
    k: () => move(-1),
    ArrowDown: () => move(1),
    ArrowUp: () => move(-1),
    Enter: () => openSelected(),
    Escape: () => setDetailOpen(false),
    x: () => selected && updateTask(selected, { completed: !selected.completed }),
    d: () => openSelected("deadline"),
    s: () => openSelected("subtask"),
    Backspace: () => selected && deleteTask(selected),
    Delete: () => selected && deleteTask(selected),
    n: () => quickAddRef.current?.focus(),
    h: () => setHideCompleted((hide) => !hide),
  });

  return (
    <ViewTemplate
      footer={<ShortcutBar />}
      action={
        <Button size="icon-lg" aria-label="Add task" onClick={() => setAdding(true)} className="size-14 rounded-2xl shadow-lg">
          <PlusIcon className="size-6" />
        </Button>
      }
      detail={
        open && (
          <TaskDetail
            task={open}
            lists={workspace.lists}
            today={today}
            breadcrumb={`${open.list?.name ?? "No list"} / ${viewTitles[viewOf(open.due?.date ?? null, today)]}`}
            onClose={() => setDetailOpen(false)}
            onChange={(changes) => updateTask(open, changes)}
            onDelete={() => deleteTask(open)}
            onAddSubtask={(values) =>
              mutate({ type: "add-subtask", taskId: open.id, title: values.title }, () =>
                addSubtaskAction(open.id, values),
              )
            }
            onToggleSubtask={(subtaskId, done) =>
              mutate({ type: "update-subtask", subtaskId, done }, () => updateSubtaskAction(subtaskId, { done }))
            }
            onDeleteSubtask={(subtaskId) =>
              mutate({ type: "delete-subtask", subtaskId }, () => deleteSubtaskAction(subtaskId))
            }
            deadlineRef={deadlineRef}
            subtaskInputRef={subtaskRef}
          />
        )
      }
    >
      <ViewHeader
        title={workspace.title}
        subtitle={headingFor(scope, workspace)?.subtitle}
        onNewTask={() => quickAddRef.current?.focus()}
      />
      {plannerView && (
        <PlannerTabs className="md:hidden" counts={workspace.counts} active={plannerView} onNavigate={shell.navigate} />
      )}
      <div className="max-md:hidden">
        <InlineAddForm
          label="New task"
          placeholder={`Add a task to ${workspace.title}…`}
          schema={newTaskSchema}
          inputRef={quickAddRef}
          onAdd={addTask}
        />
      </div>
      <TaskList
        todo={workspace.todo}
        completed={workspace.completed}
        today={today}
        selectedId={selectedId}
        hideCompleted={hideCompleted}
        onToggleHideCompleted={() => setHideCompleted((hide) => !hide)}
        onSelect={(taskId) => {
          setSelectedId(taskId);
          setDetailOpen(true);
        }}
        onToggle={(taskId, completed) => {
          const task = visible.find((t) => t.id === taskId);
          if (task) updateTask(task, { completed });
        }}
        onDelete={(taskId) => {
          const task = visible.find((t) => t.id === taskId);
          if (task) deleteTask(task);
        }}
      />
      <Sheet open={adding} onOpenChange={setAdding}>
        <SheetContent side="bottom" initialFocus={addRef} className="pb-[env(safe-area-inset-bottom)]">
          <SheetHeader>
            <SheetTitle>New task</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <InlineAddForm
              label="New task"
              placeholder={`Add a task to ${workspace.title}…`}
              schema={newTaskSchema}
              inputRef={addRef}
              onAdd={async (values) => {
                const result = await addTask(values);
                if ("id" in result) setAdding(false);
                return result;
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </ViewTemplate>
  );
}
