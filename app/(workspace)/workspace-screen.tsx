"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { InlineAddForm } from "@/components/molecules/inline-add-form";
import { ViewHeader } from "@/components/molecules/view-header";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { CommandMenu } from "@/components/organisms/command-menu";
import { ShortcutBar } from "@/components/organisms/shortcut-bar";
import { ShortcutsDialog } from "@/components/organisms/shortcuts-dialog";
import { TaskDetail } from "@/components/organisms/task-detail";
import { TaskList } from "@/components/organisms/task-list";
import { WorkspaceTemplate } from "@/components/templates/workspace-template";
import { useShortcuts } from "@/hooks/use-shortcuts";
import { dateForPreset, describeDate, timeZoneCookie, viewOf } from "@/lib/tasks/deadlines";
import { applyChange, type Change } from "@/lib/tasks/optimistic";
import { hrefFor } from "@/lib/tasks/routes";
import { newTaskSchema, type TaskChanges } from "@/lib/tasks/schemas";
import { viewTitles, type Task, type View, type Workspace } from "@/lib/tasks/types";
import {
  addSubtaskAction,
  createListAction,
  createTaskAction,
  deleteSubtaskAction,
  deleteTaskAction,
  updateSubtaskAction,
  updateTaskAction,
} from "./actions";

type FocusTarget = "deadline" | "subtask";

// The main screen: one view or list, its tasks, and the open task's details, all driven by the keyboard.
export function WorkspaceScreen({
  workspace: serverWorkspace,
  account,
  initialTaskId,
}: {
  workspace: Workspace;
  account: React.ComponentProps<typeof AppSidebar>["account"];
  initialTaskId?: string;
}) {
  const router = useRouter();
  const [workspace, predict] = useOptimistic(serverWorkspace, applyChange);
  const [, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(initialTaskId ?? null);
  const [detailOpen, setDetailOpen] = useState(initialTaskId !== undefined);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ target: FocusTarget } | null>(null);
  const quickAddRef = useRef<HTMLInputElement>(null);
  const deadlineRef = useRef<HTMLButtonElement>(null);
  const subtaskRef = useRef<HTMLInputElement>(null);

  const { scope, today } = workspace;
  const visible = hideCompleted ? workspace.todo : [...workspace.todo, ...workspace.completed];
  const selected = visible.find((task) => task.id === selectedId) ?? null;
  const open = detailOpen ? selected : null;

  useTimeZoneCookie(router.refresh);

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
    "?": () => setShortcutsOpen(true),
    "mod+k": () => setSearchOpen(true),
    ...Object.fromEntries(
      (Object.keys(viewTitles) as View[]).map((view, index) => [String(index + 1), () => router.push(hrefFor({ view }))]),
    ),
  });

  return (
    <>
      <WorkspaceTemplate
        sidebar={
          <AppSidebar
            counts={workspace.counts}
            lists={workspace.lists}
            scope={scope}
            account={account}
            signOutAction={signOut}
            onSearch={() => setSearchOpen(true)}
            onShowShortcuts={() => setShortcutsOpen(true)}
            onCreateList={async (values) => {
              const result = await createListAction(values);
              if ("id" in result) router.push(hrefFor({ listId: result.id }));
              return result;
            }}
          />
        }
        footer={<ShortcutBar />}
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
          subtitle={subtitleFor(workspace)}
          onNewTask={() => quickAddRef.current?.focus()}
        />
        <InlineAddForm
          label="New task"
          placeholder={`Add a task to ${workspace.title}…`}
          schema={newTaskSchema}
          inputRef={quickAddRef}
          onAdd={async (values) => {
            const result = await createTaskAction(scope, values);
            if ("id" in result) setSelectedId(result.id);
            return result;
          }}
        />
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
        />
      </WorkspaceTemplate>
      <CommandMenu
        open={searchOpen}
        onOpenChange={setSearchOpen}
        lists={workspace.lists}
        searchable={workspace.searchable}
        onNavigate={(href) => router.push(href)}
        onNewTask={() => quickAddRef.current?.focus()}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}

function subtitleFor({ scope, today, todo }: Workspace): string | undefined {
  if ("listId" in scope) return `${todo.length} open ${todo.length === 1 ? "task" : "tasks"}`;
  if (scope.view === "today") return describeDate(today);
  if (scope.view === "tomorrow") return describeDate(dateForPreset("tomorrow", today)!);
}

// The server works out "today" from this cookie, so keep it in sync with the browser's time zone.
function useTimeZoneCookie(refresh: () => void) {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cookie = `${timeZoneCookie}=${timeZone}`;
    if (!document.cookie.split("; ").includes(cookie)) {
      document.cookie = `${cookie}; path=/; max-age=31536000; samesite=lax`;
      refresh();
    }
  }, [refresh]);
}
