/**
 * Part of this code is taken from react spectrum ❤️
 */

import { type ForwardedRef, type MutableRefObject } from "react"

/**
 * Merges multiple refs into one. Works with either callback or object refs.
 */
export function mergeRefs<T>(
  ...refs: Array<ForwardedRef<T> | MutableRefObject<T> | null | undefined>
): ForwardedRef<T> {
  if (refs.length === 1 && refs[0]) {
    return refs[0]
  }

  return (arg: T | null) => {
    refs.forEach(ref => {
      // eslint-disable-next-line no-restricted-syntax
      if (ref instanceof Function) {
        ref(arg)
      }
      // eslint-disable-next-line no-restricted-syntax
      else if (ref !== null && ref !== undefined) {
        ref.current = arg
      }
    })
  }
}
