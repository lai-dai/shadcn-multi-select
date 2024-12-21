import { Spin, type SpinProps } from "~/components/spinner"
import { cn } from "~/lib/utils"

export function Loading({ className, ...props }: SpinProps) {
  return (
    <div className={cn("grid size-full place-content-center py-6", className)}>
      <Spin {...props} />
    </div>
  )
}
