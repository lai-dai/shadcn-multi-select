"use client"

import { CheckIcon, ClipboardIcon } from "lucide-react"
import * as React from "react"

import { Button, type ButtonProps } from "~/components/ui/button"
import { cn } from "~/lib/utils"

interface CopyButtonProps extends ButtonProps {
  value: string
}

export async function copyToClipboardWithMeta(value: string) {
  await navigator.clipboard.writeText(value)
}

export function CopyButton({
  value,
  className,
  variant = "ghost",
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false)
    }, 1500)
  }, [hasCopied])

  return (
    <Button
      className={cn(
        "relative z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50 [&_svg]:h-3 [&_svg]:w-3",
        className,
      )}
      onClick={async () => {
        await copyToClipboardWithMeta(value)
        setHasCopied(true)
      }}
      size={"icon"}
      variant={variant}
      {...props}>
      <span className={"sr-only"}>{"Copy"}</span>

      {hasCopied ? <CheckIcon /> : <ClipboardIcon />}
    </Button>
  )
}
