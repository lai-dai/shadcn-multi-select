import {
  Spin,
  type SpinProps,
} from "~/components/spinner"
import {
  cn,
} from "~/lib/utils"

export function Loading({
  className, ...props
}: SpinProps) {
  return (
    <div className={
      cn(
        "py-9 size-full grid place-content-center",
        className
      )
    }>
      <Spin {...props} />
    </div>
  )
}
