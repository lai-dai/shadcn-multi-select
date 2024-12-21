import { Megaphone } from "lucide-react"
import { type ComponentProps, type ReactElement } from "react"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { cn } from "~/lib/utils"

export interface ErrorMessageProps extends ComponentProps<typeof Alert> {
  error?: Error | null
  message?: string
  title?: string
  icon?: ReactElement
}

export function ErrorMessage({
  error,
  message,
  title = "Thông báo!",
  className,
  variant = "default",
  icon,
  ...props
}: ErrorMessageProps) {
  const text = message ?? error?.message
  if (!text) {
    return null
  }
  return (
    <Alert
      {...props}
      className={cn(
        variant === "default" && "border-0 bg-transparent",
        className,
      )}
      variant={variant}>
      {icon ?? <Megaphone className={"size-5"} />}

      <AlertTitle>{title}</AlertTitle>

      <AlertDescription>
        <p>{text}</p>
      </AlertDescription>
    </Alert>
  )
}
