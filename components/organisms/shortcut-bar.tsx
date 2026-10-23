import { KeyHint } from "@/components/molecules/key-hint"

// The most used shortcuts, always in view under the task list.
function ShortcutBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <KeyHint keys={["J", "K"]} label="move" />
      <KeyHint keys={["↵"]} label="open" />
      <KeyHint keys={["X"]} label="complete" />
      <KeyHint keys={["D"]} label="deadline" />
      <KeyHint keys={["⌫"]} label="delete" />
      <KeyHint keys={["1", "5"]} label="switch view" range />
      <KeyHint keys={["?"]} label="all shortcuts" />
    </div>
  )
}

export { ShortcutBar }
