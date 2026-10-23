"use client"

import { useId } from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { dateForPreset, describeDue, presetOf } from "@/lib/tasks/deadlines"
import type { DeadlinePreset, Due } from "@/lib/tasks/types"

const presets: { preset: DeadlinePreset; label: string }[] = [
  { preset: "today", label: "Today" },
  { preset: "tomorrow", label: "Tomorrow" },
  { preset: "end-of-week", label: "End of week" },
  { preset: "later", label: "Later" },
  { preset: "none", label: "None" },
]

const pressed = "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"

// Sets a deadline from a preset or the calendar. Changing the day keeps the time of day.
function DeadlinePicker({
  due,
  today,
  onChange,
  firstButtonRef,
}: {
  due: Due | null
  today: string
  onChange: (due: Due | null) => void
  firstButtonRef?: React.Ref<HTMLButtonElement>
}) {
  const timeId = useId()
  const current = presetOf(due?.date ?? null, today)

  function setDate(date: string | null) {
    onChange(date ? { date, time: due?.time ?? null } : null)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {presets.map(({ preset, label }, index) => (
          <Button
            key={preset}
            ref={index === 0 ? firstButtonRef : undefined}
            variant="outline"
            size="sm"
            aria-pressed={current === preset}
            onClick={() => setDate(dateForPreset(preset, today))}
            className={cn("h-8", current === preset && pressed)}
          >
            {label}
          </Button>
        ))}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                aria-pressed={due !== null && current === null}
                className={cn("h-8 border-dashed", due !== null && current === null && pressed)}
              />
            }
          >
            <CalendarIcon data-icon="inline-start" />
            Pick date…
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto">
            <Calendar
              mode="single"
              selected={due ? parseISO(due.date) : undefined}
              defaultMonth={parseISO(due?.date ?? today)}
              onSelect={(date) => date && setDate(format(date, "yyyy-MM-dd"))}
            />
            <div className="flex items-center gap-2 px-2 pb-1">
              <Label htmlFor={timeId} className="text-muted-foreground">
                Time
              </Label>
              <Input
                // Remount when the stored time changes so the field shows it.
                key={due?.time ?? "none"}
                id={timeId}
                type="time"
                defaultValue={due?.time ?? ""}
                disabled={!due}
                className="w-auto"
                onBlur={(event) => {
                  const time = event.currentTarget.value || null
                  if (due && time !== due.time) onChange({ date: due.date, time })
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <p className="text-xs text-muted-foreground">{due ? `Due ${describeDue(due, today)}` : "No deadline"}</p>
    </div>
  )
}

export { DeadlinePicker }
