import React from "react"

export function useLazyRef<T>(fn: T | (() => T)) {
  const ref = React.useRef<T>()

  if (ref.current === undefined) {
    ref.current = fn instanceof Function ? fn() : fn
  }

  return ref as React.MutableRefObject<T>
}
