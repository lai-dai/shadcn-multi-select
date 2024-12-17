import React from "react"
import { useControllableState } from "~/hooks/use-controllable-state"

const CLEAR: unique symbol = Symbol(
  process.env.NODE_ENV !== "production" ? "CLEAR" : "",
)

// Select
export type SelectionMode = "single" | "multiple"

export type Matcher =
  | boolean
  | ((selected: string) => boolean)
  | string
  | string[]

interface SelectBase {
  disabled?: Matcher | Matcher[]
  required?: boolean
}

export interface SelectSingleProps extends SelectBase {
  defaultValue?: string
  mode?: "single"
  onValueChange?: (value?: string) => void
  value?: string
}

export interface SelectMultiProps extends SelectBase {
  defaultValue?: string[]
  max?: number
  min?: number
  mode?: "multiple"
  onValueChange?: (value?: string[]) => void
  value?: string[]
}

export type SelectProps = SelectSingleProps | SelectMultiProps

function useSingle(props: SelectProps) {
  const {
    defaultValue,
    value: valueProp,
    onValueChange,
    required,
  } = props as SelectSingleProps

  const [selected, setSelected] = useControllableState({
    defaultProp: defaultValue,
    prop: valueProp,
    onChange: onValueChange,
  })

  const isSelected = React.useCallback(
    (triggerValue?: string | typeof CLEAR) => {
      return selected === triggerValue
    },
    [selected],
  )

  const onSelect = React.useCallback(
    (triggerValue: string | typeof CLEAR) => {
      let newSelected: string | undefined

      if (
        triggerValue === CLEAR ||
        (!required && selected && isSelected(triggerValue))
      ) {
        // If the value is the same, clear the selection.
        newSelected = undefined
      } else {
        newSelected = triggerValue
      }

      setSelected(newSelected)

      return newSelected
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [required, selected],
  )

  return {
    selected,
    onSelect,
    isSelected,
  }
}

function useMulti(props: SelectProps) {
  const {
    defaultValue,
    value: valueProp,
    onValueChange,
    required,
  } = props as SelectMultiProps

  const [selected, setSelected] = useControllableState({
    defaultProp: defaultValue,
    prop: valueProp,
    onChange: onValueChange,
  })

  const isSelected = React.useCallback(
    (triggerValue: string | typeof CLEAR) => {
      if (triggerValue === CLEAR) return false
      return selected?.includes(triggerValue ?? "") ?? false
    },
    [selected],
  )

  const { min, max } = props as SelectMultiProps

  const onSelect = React.useCallback(
    (triggerValue: string | typeof CLEAR) => {
      let newSelected: string[] | undefined = [...(selected ?? [])]

      if (triggerValue === CLEAR) {
        newSelected = []
      } else if (isSelected(triggerValue)) {
        if (selected?.length === min) {
          // Min value reached, do nothing
          return
        }
        if (required && selected?.length === 1) {
          // Required value already selected do nothing
          return
        }
        newSelected = selected?.filter(s => s !== triggerValue)
      } else {
        if (selected?.length === max) {
          // Max value reached, reset the selection to date
          newSelected = [triggerValue]
        } else {
          // Add the date to the selection
          newSelected = [...newSelected, triggerValue]
        }
      }

      setSelected(newSelected)

      return newSelected
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [max, min, required, selected],
  )

  return {
    selected,
    onSelect,
    isSelected,
  }
}

function useSelection(props: SelectProps) {
  const single = useSingle(props)
  const multi = useMulti(props)

  switch (props.mode) {
    case "multiple":
      return multi

    default:
      return single
  }
}

function useReactSelect(props: SelectProps) {
  const { selected, isSelected, onSelect } = useSelection(props)

  const onClear = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    e => {
      e.preventDefault()
      e.stopPropagation()

      onSelect(CLEAR)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const isDisabled = React.useCallback(
    (triggerSelect: string | typeof CLEAR) => {
      const matcher = props.disabled
      let isDisable = false

      switch (true) {
        case triggerSelect === CLEAR:
          break
        case typeof matcher === "boolean":
          isDisable = matcher
          break
        case typeof matcher === "string":
          isDisable = triggerSelect === matcher
          break
        case typeof matcher === "function":
          isDisable = matcher(triggerSelect)
          break
        case Array.isArray(matcher) &&
          matcher.every(m => typeof m === "string"):
          isDisable = matcher.includes(triggerSelect)
          break
      }
      return isDisable
    },
    [props.disabled],
  )

  const getSelectItemProps = React.useCallback(
    function <T>(props: T & { value?: string | typeof CLEAR }) {
      const { value } = props ?? {}
      const selected = isSelected(value!)
      const disabled = isDisabled(value!)

      const itemProps: Record<string, unknown> = {
        "data-state": selected ? "checked" : "unchecked",
        "aria-selected": selected,
        "data-disabled": disabled,
        "aria-disabled": disabled,
        disabled,
        role: "option",
        tabIndex: "-1",
        ...props,
      }

      if (value !== CLEAR) {
        itemProps.value = props.value
      }

      return itemProps as T
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected],
  )

  const values = {
    disabled: props.disabled,
    getSelectItemProps,
    isDisabled,
    isSelected,
    onClear,
    onSelect,
    selected,
  }

  return values
}

export { useReactSelect, CLEAR }
