/* eslint-disable no-restricted-syntax */
import React from "react"

import { useControllableState } from "~/hooks/use-controllable-state"

const SELECT_CLEAR: unique symbol = Symbol(
  process.env.NODE_ENV !== "production" ? "CLEAR" : "",
)

// Select
export type SelectionMode = "single" | "multiple"

export type SelectValue = string | number

type TriggerValue<V extends SelectValue> = V | typeof SELECT_CLEAR

type Matcher<V extends SelectValue> =
  | boolean
  | ((selected: V) => boolean)
  | V
  | V[]

interface SelectBase<V extends SelectValue> {
  disabled?: Matcher<V> | Matcher<V>[]
  required?: boolean
}

export interface SelectSingleProps<V extends SelectValue>
  extends SelectBase<V> {
  defaultValue?: V
  mode?: "single"
  onValueChange?: (value?: V) => void
  value?: V
}

export interface SelectMultipleProps<V extends SelectValue> extends SelectBase<V> {
  defaultValue?: V[]
  max?: number
  min?: number
  mode?: "multiple"
  onValueChange?: (value?: V[]) => void
  value?: V[]
}

export type SelectProps<V extends SelectValue> =
  | SelectSingleProps<V>
  | SelectMultipleProps<V>

function useSingle<V extends SelectValue>(props: SelectProps<V>) {
  const {
    defaultValue,
    value: valueProp,
    onValueChange,
    required,
  } = props as SelectSingleProps<V>

  const [selected, setSelected] = useControllableState({
    defaultProp: defaultValue,
    prop: valueProp,
    onChange: onValueChange,
  })

  const isSelected = React.useCallback(
    (triggerValue?: TriggerValue<V>) => {
      return selected === triggerValue
    },
    [selected],
  )

  const onSelect = React.useCallback(
    (triggerValue: TriggerValue<V>) => {
      let newSelected: V | undefined

      if (
        triggerValue === SELECT_CLEAR ||
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

function useMulti<V extends SelectValue>(props: SelectProps<V>) {
  const {
    defaultValue,
    value: valueProp,
    onValueChange,
    required,
  } = props as SelectMultipleProps<V>

  const [selected, setSelected] = useControllableState({
    defaultProp: defaultValue,
    prop: valueProp,
    onChange: onValueChange,
  })

  const isSelected = React.useCallback(
    (triggerValue: TriggerValue<V>) => {
      if (triggerValue === SELECT_CLEAR) {
        return false
      }
      return selected?.includes(triggerValue) ?? false
    },
    [selected],
  )

  const { min, max } = props as SelectMultipleProps<V>

  const onSelect = React.useCallback(
    (triggerValue: TriggerValue<V>) => {
      let newSelected: V[] | undefined = [...(selected ?? [])]

      if (triggerValue === SELECT_CLEAR) {
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
      } else if (selected?.length === max) {
        // Max value reached, reset the selection to date
        newSelected = [triggerValue]
      } else {
        // Add the date to the selection
        newSelected = [...newSelected, triggerValue]
      }

      setSelected(newSelected)

      return newSelected
    },
    [isSelected, max, min, required, selected, setSelected],
  )

  return {
    selected,
    onSelect,
    isSelected,
  }
}

function useSelection<V extends SelectValue>(props: SelectProps<V>) {
  const single = useSingle<V>(props)
  const multi = useMulti<V>(props)

  switch (props.mode) {
    case "multiple":
      return multi

    case "single":
    default:
      return single
  }
}

interface ReturnSelect<V extends SelectValue, P extends SelectProps<V>> {
  // for CommandItem
  getSelectItemProps: <Pr>(
    props: Pr & { value?: TriggerValue<V> },
  ) => Pr & { value?: string }
  isDisabled: (select: TriggerValue<V>) => boolean
  isSelected: (select: TriggerValue<V>) => boolean
  onClear: React.MouseEventHandler<HTMLElement>
  onSelect: (
    selected: TriggerValue<V>,
  ) =>
    | (P extends SelectSingleProps<V>
        ? SelectSingleProps<V>["value"]
        : SelectMultipleProps<V>["value"])
    | undefined
  selected: P extends SelectSingleProps<V>
    ? SelectSingleProps<V>["value"]
    : SelectMultipleProps<V>["value"]
}

function useReactSelect<
  V extends SelectValue,
  P extends SelectProps<V> = SelectProps<V>,
>(props: P): ReturnSelect<V, P> {
  const { selected, isSelected, onSelect } = useSelection<V>(props)

  const onClear = React.useCallback<React.MouseEventHandler<HTMLElement>>(
    e => {
      e.preventDefault()
      e.stopPropagation()

      onSelect(SELECT_CLEAR)
    },
    [onSelect],
  )

  const isDisabled = React.useCallback(
    (triggerSelect: TriggerValue<V>) => {
      const matcher = props.disabled
      let isDisable = false

      switch (true) {
        case triggerSelect === SELECT_CLEAR:
          break
        case typeof matcher === "boolean":
          isDisable = matcher
          break
        case typeof matcher === "number":
        case typeof matcher === "string":
          isDisable = triggerSelect === matcher
          break
        case typeof matcher === "function":
          isDisable = matcher(triggerSelect)
          break
        case Array.isArray(matcher) &&
          matcher.every(m => typeof m === "string" || typeof m === "number"):
          isDisable = matcher.includes(triggerSelect)
          break
      }
      return isDisable
    },
    [props.disabled],
  )

  const getSelectItemProps = React.useCallback(
    function <Pr>(props: Pr & { value?: TriggerValue<V> }) {
      const { value } = props ?? {}
      const selected = isSelected(value!)
      const disabled = isDisabled(value!)

      const itemProps: Record<string, unknown> = {
        "data-state": selected ? "checked" : "unchecked",
        "aria-selected": selected,
        "data-disabled": disabled,
        "aria-disabled": disabled,
        disabled: disabled,
        role: "option",
        tabIndex: "-1",
        ...props,
      }

      if (value !== SELECT_CLEAR) {
        itemProps.value = String(value)
      }

      return itemProps as Pr & { value?: string }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected],
  )

  const values: ReturnSelect<V, P> = {
    getSelectItemProps,
    isDisabled,
    isSelected,
    onClear,
    onSelect: onSelect as ReturnSelect<V, P>["onSelect"],
    selected: selected as ReturnSelect<V, P>["selected"],
  }

  return values
}

export { useReactSelect, SELECT_CLEAR }
