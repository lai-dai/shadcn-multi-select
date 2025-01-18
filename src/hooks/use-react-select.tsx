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

interface BaseSelectProps<V extends SelectValue> {
  disabled?: Matcher<V>
  required?: boolean
}

export interface SelectSingleProps<V extends SelectValue>
  extends BaseSelectProps<V> {
  defaultValue?: V
  mode?: "single"
  onValueChange?: (value?: V) => void
  value?: V
}

export interface SelectMultipleProps<V extends SelectValue>
  extends BaseSelectProps<V> {
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

function useSingle<V extends SelectValue>(props: SelectProps<V> = {}) {
  const {
    defaultValue,
    value: valueProp,
    onValueChange,
    required,
  } = props as SelectSingleProps<V>

  const [selected, setSelected] = useControllableState<V | undefined>({
    defaultProp: defaultValue,
    prop: valueProp,
    onChange: onValueChange,
  })

  return React.useMemo(() => {
    const isSelected = (triggerValue?: V | TriggerValue<V>) => {
      if (triggerValue === SELECT_CLEAR) {
        return false
      }
      return selected === triggerValue
    }

    return {
      selected,
      setSelected,
      isSelected,
      onSelect: (triggerValue: V | TriggerValue<V>) => {
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
    }
  }, [required, selected, setSelected])
}

function useMulti<V extends SelectValue>(props: SelectProps<V> = {}) {
  const {
    defaultValue,
    value: valueProp,
    onValueChange,
    required,
    min,
    max,
  } = props as SelectMultipleProps<V>

  const [selected, setSelected] = useControllableState({
    defaultProp: defaultValue,
    prop: valueProp,
    onChange: onValueChange,
  })

  return React.useMemo(() => {
    const isSelected = (triggerValue: V | TriggerValue<V>) => {
      if (triggerValue === SELECT_CLEAR) {
        return false
      }
      return selected?.includes(triggerValue) ?? false
    }

    return {
      selected,
      setSelected,
      isSelected,
      onSelect: (triggerValue: V | TriggerValue<V>) => {
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
          newSelected = selected?.filter(s => s !== triggerValue) ?? []
        } else if (selected?.length === max) {
          // Max value reached, reset the selection to value
          newSelected = [triggerValue]
        } else {
          // Add the value to the selection
          newSelected = [...newSelected, triggerValue]
        }

        setSelected(newSelected)

        return newSelected
      },
    }
  }, [max, min, required, selected, setSelected])
}

function useSelection<V extends SelectValue>(props?: SelectProps<V>) {
  const single = useSingle<V>(props)
  const multi = useMulti<V>(props)

  switch (props?.mode) {
    case "multiple":
      return multi

    case "single":
    default:
      return single
  }
}

export interface ReturnSelect<
  V extends SelectValue,
  P extends SelectProps<V> = SelectProps<V>,
> {
  isDisabled: (select: V | TriggerValue<V>) => boolean
  isSelected: (select: V | TriggerValue<V>) => boolean
  onClear: React.MouseEventHandler<HTMLElement> | (() => void)
  onSelect: (
    selected: V | TriggerValue<V>,
  ) =>
    | (P extends SelectSingleProps<V>
        ? SelectSingleProps<V>["value"]
        : SelectMultipleProps<V>["value"])
    | undefined
  selected: P extends SelectSingleProps<V>
    ? SelectSingleProps<V>["value"]
    : SelectMultipleProps<V>["value"]
  setSelected: P extends SelectSingleProps<V>
    ? (select: SelectSingleProps<V>["value"]) => void
    : (select: SelectMultipleProps<V>["value"]) => void
}

function useReactSelect<
  V extends SelectValue,
  P extends SelectProps<V> = SelectProps<V>,
>(props?: P): ReturnSelect<V, P> {
  const { selected, isSelected, onSelect, setSelected } = useSelection<V>(props)

  const onClear = React.useCallback<React.MouseEventHandler<HTMLElement>>(
    e => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      onSelect(SELECT_CLEAR)
    },
    [onSelect],
  )

  const isDisabled = React.useCallback(
    (triggerSelect: V | TriggerValue<V>) => {
      const matcher = props?.disabled
      let isDisable = false

      switch (true) {
        case triggerSelect === SELECT_CLEAR:
          isDisable = false
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
        case Array.isArray(matcher):
          isDisable = matcher.includes(triggerSelect)
          break
      }
      return isDisable
    },
    [props?.disabled],
  )

  return {
    isDisabled,
    isSelected,
    onClear,
    onSelect: onSelect as ReturnSelect<V, P>["onSelect"],
    selected: selected as ReturnSelect<V, P>["selected"],
    setSelected: setSelected as ReturnSelect<V, P>["setSelected"],
  } as ReturnSelect<V, P>
}

export { useReactSelect, SELECT_CLEAR }
