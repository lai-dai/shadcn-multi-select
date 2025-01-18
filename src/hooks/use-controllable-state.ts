// This code comes from https://github.com/radix-ui/primitives/blob/main/packages/react/use-controllable-state/src/useControllableState.tsx

import React from "react"
import { useCallbackRef } from "~/hooks/use-callback-ref"

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}
const isShouldUpdate = <T>(prev: T, next: T) => prev !== next

export type UseControllableStateProps<T> = {
  prop?: T
  defaultProp?: T | (() => T)
  onChange?: (state: T) => void
  shouldUpdate?: (prev: T, next: T) => boolean
}

export type UseControllableStateReturn<T> = [T, React.Dispatch<React.SetStateAction<T>>]

export function useControllableState<T>(props: UseControllableStateProps<T>): UseControllableStateReturn<T> {
  const {
    prop, defaultProp, onChange = noop, shouldUpdate = isShouldUpdate,
  } = props

  const onChangeProp = useCallbackRef(onChange)
  const shouldUpdateProp = useCallbackRef(shouldUpdate)

  const [
    uncontrolledProp,
    setUncontrolledProp,
  ] = React.useState(defaultProp as T,)

  const isControlled = prop !== undefined
  const value = isControlled ? prop : uncontrolledProp

  const setValue = React.useCallback(
    (next: React.SetStateAction<T>) => {
      const prevState = value
      const setter = next as (prevState?: T) => T
      const nextValue = next instanceof Function ? setter(prevState) : next

      if (!shouldUpdateProp(
        prevState, nextValue
      )) {
        return
      }

      if (!isControlled) {
        setUncontrolledProp(nextValue)
      }

      onChangeProp(nextValue)
    },
    [
      isControlled,
      onChangeProp,
      shouldUpdateProp,
      value,
    ],
  )

  return [
    value,
    setValue,
  ]
}
