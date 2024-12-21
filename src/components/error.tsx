import {
  ErrorMessage,
  type ErrorMessageProps,
} from "~/components/error-message"
import { cn } from "~/lib/utils"

export function ErrorView({ className, ...props }: ErrorMessageProps) {
  return (
    <div className={cn("grid size-full place-content-center py-9", className)}>
      <ErrorMessage {...props} />
    </div>
  )
}
