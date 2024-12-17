import { Slot } from "@radix-ui/react-slot"
import * as React from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { useControllableState } from "~/hooks/use-controllable-state"
import { useUpdateEffect } from "~/hooks/use-update-effect"

import { cn } from "~/lib/utils"
import { chain } from "~/utils/chain"
import { mergeRefs } from "~/utils/merge-ref"

// Select
export type SelectionMode = "single" | "multiple"
export type ValueState = string | string[] | undefined

interface SelectBase {
  disabled?: boolean
  required?: boolean
  initialFocus?: boolean
}

export interface SelectSingleProps extends SelectBase {
  defaultValue?: string
  mode?: "single"
  onValueChange?: (value?: string) => void
  value?: string
}

export interface SelectMultipleProps extends SelectBase {
  defaultValue?: string[]
  max?: number
  min?: number
  mode?: "multiple"
  onValueChange?: (value?: string[]) => void
  value?: string[]
}

export type SelectProps = React.ComponentProps<typeof Popover> &
  (SelectSingleProps | SelectMultipleProps)

interface SelectContextValue extends SelectBase {
  getModifierSelect: (value: string) => Record<string, boolean | undefined>
  handleClear: React.MouseEventHandler<HTMLButtonElement>
  handleRemove: (value: string) => React.MouseEventHandler<HTMLButtonElement>
  handleSelect: (value: string) => void
  max?: number
  min?: number
  mode: SelectionMode
  value: SelectProps["value"]
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

const useSelect = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("useSelect must be used within a Select")
  }
  return context
}

function Select(props: SelectProps) {
  const {
    disabled = false,
    initialFocus = true,
    max = 0,
    min = 0,
    mode = "single",
    required = true,

    defaultOpen = false,
    open: openProp,
    onOpenChange,

    defaultValue,
    value: valueProp,
    onValueChange,

    ...popoverProps
  } = props as SelectProps & { min?: number; max?: number }

  const [open, setOpen] = useControllableState({
    defaultProp: defaultOpen,
    prop: openProp,
    onChange: onOpenChange,
  })

  const [value, setValue] = useControllableState<ValueState>({
    defaultProp: defaultValue,
    prop: valueProp,
    onChange: onValueChange as (state: ValueState) => void,
  })

  useUpdateEffect(() => {
    if (!valueProp) {
      setValue(undefined)
    }
  }, [valueProp])

  const handleSelectSingle = React.useCallback(
    (triggerValue: string) => {
      const selected = value as SelectSingleProps["value"]
      let newDate: string | undefined = triggerValue
      if (!required && selected && triggerValue === selected) {
        // If the value is the same, clear the selection.
        newDate = undefined
      }
      return newDate
    },
    [required, value],
  )

  const handleSelectMulti = React.useCallback(
    (triggerValue: string) => {
      const selected = (value as SelectMultipleProps["value"]) ?? []
      let newDates: string[] | undefined = [...selected]
      if (selected.includes(triggerValue)) {
        if (selected?.length === min) {
          // Min value reached, do nothing
          return
        }
        if (required && selected?.length === 1) {
          // Required value already selected do nothing
          return
        }
        newDates = selected?.filter(it => it !== triggerValue)
      } else if (selected?.length === max) {
        // Max value reached, reset the selection to date
        newDates = [triggerValue]
      } else {
        // Add the date to the selection
        newDates = [...newDates, triggerValue]
      }
      return newDates
    },
    [max, min, required, value],
  )

  const handleSelect = React.useCallback(
    (triggerValue: string) => {
      let newValue: SelectProps["value"]

      switch (mode) {
        case "single":
          newValue = handleSelectSingle(triggerValue)
          // chọn 1 -> đóng popover
          setOpen(false)
          break

        case "multiple":
          newValue = handleSelectMulti(triggerValue)
          break
      }

      setValue(newValue)
    },
    [mode, setValue, handleSelectSingle, setOpen, handleSelectMulti],
  )

  const handleRemove = React.useCallback(
    (triggerValue: string): React.MouseEventHandler<HTMLButtonElement> =>
      e => {
        e.preventDefault()
        e.stopPropagation()

        let newValue: SelectProps["value"]

        switch (mode) {
          case "single":
            newValue = undefined
            break

          case "multiple":
            newValue = handleSelectMulti(triggerValue)
            break
        }

        setValue(newValue)
      },
    [handleSelectMulti, mode, setValue],
  )

  const handleClear = React.useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    e => {
      e.preventDefault()
      e.stopPropagation()

      setValue(undefined)
    },
    [setValue],
  )

  const getModifierSelect = React.useCallback(
    (triggerValue: string) => {
      const dataAttributes: Record<string, boolean | undefined> = {}
      switch (mode) {
        case "single":
          dataAttributes.checked = value === triggerValue
          break

        case "multiple":
          dataAttributes.checked = value?.includes(triggerValue)
          break
      }
      return dataAttributes
    },
    [mode, value],
  )

  const contextValue: SelectContextValue = {
    disabled,
    getModifierSelect,
    handleClear,
    handleRemove,
    handleSelect,
    initialFocus,
    max,
    min,
    mode,
    required,
    value,
  }
  return (
    <SelectContext.Provider value={contextValue}>
      <Popover
        onOpenChange={setOpen}
        open={open}
        {...popoverProps} />
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { disabled } = useSelect()
  return (
    <PopoverTrigger
      onClickCapture={e => {
        if (disabled) {
          e.preventDefault()
        }
      }}
      asChild={true}
      disabled={disabled}>
      <div
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-full border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          className,
        )}
        data-disabled={disabled}
        ref={ref}
        role={"button"}
        {...props}/>
    </PopoverTrigger>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectIcon = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ children, className, ...props }, ref) => (
  <Slot
    className={cn("shrink-0 opacity-50", className)}
    ref={ref}
    {...props}>
    {children ?? (
      <svg
        className={"shrink-0 opacity-50"}
        fill={"none"}
        height={"15"}
        viewBox={"0 0 15 15"}
        width={"15"}
        xmlns={"http://www.w3.org/2000/svg"}>
        <path
          d={
            "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
          }
          clipRule={"evenodd"}
          fill={"currentColor"}
          fillRule={"evenodd"}/>
      </svg>
    )}
  </Slot>
))
SelectIcon.displayName = "SelectIcon"

interface SelectValueProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  placeholder?: string
  children: React.ReactNode | ((context: SelectContextValue) => React.ReactNode)
  asChild?: boolean
}

const SelectValue = React.forwardRef<HTMLDivElement, SelectValueProps>(
  ({ className, placeholder, children, asChild, ...props }, ref) => {
    const context = useSelect()
    const getModifier = React.useCallback(() => {
      let state
      switch (context.mode) {
        case "single":
          state = Boolean(context.value)
          break

        case "multiple":
          state = context.value && context.value?.length > 0
          break
      }
      return state
    }, [context.mode, context.value])
    const Comp = asChild ? Slot : "div"
    return (
      <Comp
        {...props}
        className={cn(
          "flex grow flex-wrap items-center gap-1",
          placeholder &&
            "before:text-muted-foreground before:content-[attr(data-placeholder)] data-[state=true]:before:hidden",
          className,
        )}
        data-placeholder={placeholder}
        data-state={getModifier()}
        ref={ref}>
        {children instanceof Function ? children(context) : children}
      </Comp>
    )
  },
)
SelectValue.displayName = "SelectValue"

interface SelectValueItemContextValue {
  value?: string
}

const SelectValueItemContext = React.createContext<
  SelectValueItemContextValue | undefined
>(undefined)

const useSelectValueItem = () => {
  const context = React.useContext(SelectValueItemContext)
  if (!context) {
    throw new Error("useSelectValueItem must be used within a SelectValueItem")
  }
  return context
}

interface SelectValueItemProps extends React.ComponentProps<typeof Slot> {
  value: string
  asChild?: boolean
}

const SelectValueItem = React.forwardRef<HTMLDivElement, SelectValueItemProps>(
  ({ value: valueProp, asChild, ...props }, ref) => {
    const { mode, value } = useSelect()
    let isRender
    switch (mode) {
      case "single":
        isRender = value && value === valueProp
        break

      case "multiple":
        isRender = value?.includes(valueProp)
        break
    }
    if (!isRender) {
      return null
    }
    const Comp = asChild ? Slot : "div"
    return (
      <SelectValueItemContext.Provider
        value={{
          value: valueProp,
        }}>
        <Comp
          {...props}
          ref={ref} />
      </SelectValueItemContext.Provider>
    )
  },
)
SelectValueItem.displayName = "SelectValueItem"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof PopoverContent>
>(({ className, ...props }, ref) => (
  <PopoverContent
    className={cn("w-[--radix-popover-trigger-width] min-w-32 p-0", className)}
    ref={ref}
    {...props}/>
))
SelectContent.displayName = "SelectContent"

const SelectBox = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Command>
>((props, ref) => {
  const innerRef = React.useRef<HTMLDivElement>(null)

  const { mode, value, initialFocus } = useSelect()

  React.useEffect(() => {
    if (innerRef.current && initialFocus) {
      innerRef.current.focus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getDefaultValue = React.useCallback(() => {
    let defaultValue
    switch (mode) {
      case "single":
        defaultValue = value
        break

      case "multiple":
        defaultValue = value && value?.length > 0 ? value[0] : undefined
        break
    }
    return defaultValue as string
  }, [mode, value])

  return (
    <Command
      defaultValue={getDefaultValue()}
      ref={mergeRefs(ref, innerRef)}
      {...props}/>
  )
})
SelectBox.displayName = "SelectBox"

const SelectInput = CommandInput

interface SelectListProps
  extends Omit<React.ComponentProps<typeof CommandList>, "children"> {
  children: React.ReactNode | ((context: SelectContextValue) => React.ReactNode)
}

const SelectList = React.forwardRef<HTMLDivElement, SelectListProps>(
  ({ children, ...props }, ref) => {
    const context = useSelect()
    return (
      <CommandList
        ref={ref}
        {...props}>
        {children instanceof Function ? children(context) : children}
      </CommandList>
    )
  },
)
SelectList.displayName = "SelectList"

const SelectEmpty = CommandEmpty

const SelectGroup = CommandGroup

const SelectSeparator = CommandSeparator

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandItem>
>(({ value: valueProp, className, onSelect, ...props }, ref) => {
  const { getModifierSelect, handleSelect } = useSelect()
  const { checked } = getModifierSelect(valueProp!)
  return (
    <CommandItem
      className={cn(
        "group/selectItem gap-2 rounded-lg [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      data-checked={checked}
      onSelect={chain(onSelect, handleSelect)}
      ref={ref}
      value={valueProp}
      {...props}/>
  )
})
SelectItem.displayName = "SelectItem"

const SelectIndicator = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ children, className, ...props }, ref) => {
  return (
    <Slot
      className={cn(
        "opacity-0 group-data-[checked=true]/selectItem:opacity-100",
        className,
      )}
      ref={ref}
      {...props}>
      {children ?? (
        <svg
          className={
            "lucide lucide-check opacity-0 group-data-[checked=true]/selectItem:opacity-100"
          }
          fill={"none"}
          height={"24"}
          stroke={"currentColor"}
          strokeLinecap={"round"}
          strokeLinejoin={"round"}
          strokeWidth={"2"}
          viewBox={"0 0 24 24"}
          width={"24"}
          xmlns={"http://www.w3.org/2000/svg"}>
          <path d={"M20 6 9 17l-5-5"} />
        </svg>
      )}
    </Slot>
  )
})
SelectIndicator.displayName = "SelectIndicator"

const SelectValueRemove = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ onClick, className, asChild, ...props }, ref) => {
  const { handleRemove } = useSelect()
  const { value } = useSelectValueItem()
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      onClick={chain(onClick, handleRemove(value!))}
      ref={ref}
      type={"button"}
      {...props}/>
  )
})
SelectValueRemove.displayName = "SelectValueRemove"

const SelectValueClear = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ onClick, className, asChild, ...props }, ref) => {
  const { handleClear } = useSelect()
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      onClick={chain(onClick, handleClear)}
      ref={ref}
      type={"button"}
      {...props}/>
  )
})
SelectValueClear.displayName = "SelectValueClear"

export {
  Select,
  SelectBox,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectIcon,
  SelectIndicator,
  SelectInput,
  SelectItem,
  SelectList,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectValueClear,
  SelectValueItem,
  SelectValueRemove,
  useSelect,
}
