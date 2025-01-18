/**
 * Part of this code is taken from react spectrum ❤️
 */

export function chain<Args extends unknown[], Return>(
  ...callbacks: Array<((...args: Args) => Return) | undefined>
) {
  return (...args: Args) => {
    callbacks.forEach(callback => {
      // eslint-disable-next-line no-restricted-syntax
      if (callback instanceof Function) {
        // eslint-disable-next-line callback-return
        callback(...args)
      }
    })
  }
}
