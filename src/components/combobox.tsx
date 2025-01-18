"use client"

import { Check, ChevronDown, ChevronsDown, X } from "lucide-react"
import React from "react"

import { Badge } from "~/components/ui/badge"
import { Button, type ButtonProps } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { useCallbackRef } from "~/hooks/use-callback-ref"
import {
  type SelectProps,
  useReactSelect,
  type SelectValue,
} from "~/hooks/use-react-select"
import { cn } from "~/lib/utils"
import { chain } from "~/utils/chain"

// Combobox
export type BaseComboboxProps<V extends SelectValue> = SelectProps<V> & {
  classNames?: Partial<{
    group: string
    item: string
  }>
  className?: string

  enabled?: boolean // disable trigger
  TriggerComponent?: React.ReactElement
  EmptyResultComponent?: React.ReactNode

  hasSearch?: boolean
  hasEmpty?: boolean

  maxCount?: number
  placeholder?: string

  commandProps?: React.ComponentProps<typeof Command>
  commandInputProps?: React.ComponentProps<typeof CommandInput>
  popoverContentProps?: React.ComponentProps<typeof PopoverContent>
  commandEmptyProps?: React.ComponentProps<typeof CommandEmpty>
  commandListProps?: React.ComponentProps<typeof CommandList>
  popoverProps?: React.ComponentProps<typeof Popover>
  popoverTriggerProps?: React.ComponentProps<typeof PopoverTrigger>
  commandItemProps?: React.ComponentProps<typeof CommandItem>
}

export type ComboboxProps<
  V extends SelectValue,
  O extends Record<string, unknown>,
> = BaseComboboxProps<V> & {
  fieldNames?: {
    label: keyof O | ((option: O) => React.ReactNode)
    value: keyof O | ((option: O) => V)
    disabled?: keyof O | ((option: O) => boolean)
  }

  isLoading?: boolean
  isError?: boolean
  error?: Error | null

  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void

  options?: O[]
  renderItem?: (option: O) => React.ReactNode

  onAllValueChange?: (option: O[]) => void
}

export function Combobox<
  V extends SelectValue,
  O extends Record<string, unknown>,
>({
  fieldNames = {
    label: "label",
    value: "value",
    disabled: "disabled",
  },

  isLoading,
  isError,
  error,

  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,

  options = [],
  renderItem,

  onValueChange,
  onAllValueChange,

  className,
  classNames,
  EmptyResultComponent,
  enabled = true,
  hasSearch = false,
  hasEmpty = true,
  maxCount = 2,
  placeholder,
  TriggerComponent,
  commandProps,
  commandInputProps,
  popoverContentProps,
  commandEmptyProps,
  commandListProps,
  popoverProps,
  popoverTriggerProps,
  commandItemProps,
  ...props
}: ComboboxProps<V, O>) {
  const mapRef = React.useRef(new Map<V, O>())
  const [open, setOpen] = React.useState(false)

  const { onSelect, isSelected, selected, isDisabled } = useReactSelect<V>({
    ...props,
    onValueChange: chain(onValueChange as (value?: V | V[]) => void, () => {
      if (typeof onAllValueChange === "function") {
        const allValue = Array.from(mapRef.current.values())

        onAllValueChange(allValue)
      }
    }),
  })

  const parseOption = React.useCallback(
    (option: O) => {
      return {
        label:
          typeof fieldNames.label === "function"
            ? fieldNames.label(option)
            : (option[fieldNames.label] ?? ""),
        value:
          typeof fieldNames.value === "function"
            ? fieldNames.value(option)
            : (option[fieldNames.value] ?? ""),
        disabled:
          typeof fieldNames.disabled === "function"
            ? fieldNames.disabled(option)
            : fieldNames.disabled
              ? (option[fieldNames.disabled] ?? false)
              : false,
      } as {
        label: React.ReactNode
        value: V
        disabled: boolean
      }
    },
    [fieldNames],
  )

  const selectedSingleMode = useCallbackRef(
    (option?: O, defaultValue?: string) => {
      if (option) {
        return parseOption(option)?.label ?? defaultValue
      }
      return defaultValue
    },
  )

  const getSelectItemProps = React.useCallback(
    function <Pr>(props: Pr & { value?: V; disabled?: boolean }) {
      const {
        value,
        disabled: disabledProp = false,
        ...otherProps
      } = props ?? {}
      const selected = isSelected(value!)
      const disabled = disabledProp ? disabledProp : isDisabled(value!)

      const itemProps: Record<string, unknown> = {
        "data-state": selected ? "checked" : "unchecked",
        "aria-selected": selected,
        "data-disabled": disabled,
        "aria-disabled": disabled,
        disabled: disabled,
        role: "option",
        tabIndex: "-1",
        value: String(value),
        ...otherProps,
      }

      return itemProps as Pr & { value?: string }
    },
    [isDisabled, isSelected],
  )

  const empty = isLoading
    ? "Loading..."
    : isError
      ? (EmptyResultComponent ?? error?.message)
      : (EmptyResultComponent ?? "Not Found!")

  const listItems = options.map(opt => {
    const option = parseOption(opt)

    return (
      <CommandItem
        {...getSelectItemProps({
          value: option?.value,
          onSelect: () => {
            onSelect(option?.value)

            // Chế độ chọn nhiều -> Không đóng popover
            setOpen(props.mode === "multiple")
          },
          disabled: option.disabled,
        })}
        className={cn(
          "group p-0 data-[disabled=true]:pointer-events-none data-[selected=true]:bg-transparent data-[disabled=true]:opacity-50",
          classNames?.item,
        )}
        keywords={
          typeof option?.label === "string" ? [option?.label] : undefined
        }
        key={option?.value}
        {...commandItemProps}>
        {renderItem instanceof Function ? (
          renderItem(opt)
        ) : (
          <div
            className={
              "flex flex-1 items-center gap-1.5 px-2 py-1.5 group-data-[selected=true]:bg-muted/50 group-data-[state=checked]:bg-accent"
            }>
            <div className={"flex-1"}>{option?.label}</div>

            <div
              className={
                "grid size-4 shrink-0 place-content-center group-data-[state=unchecked]:opacity-0"
              }>
              <Check />
            </div>
          </div>
        )}
      </CommandItem>
    )
  })

  return (
    <Popover
      onOpenChange={setOpen}
      open={open}
      {...popoverProps}>
      <PopoverTrigger
        asChild={true}
        disabled={!enabled}
        {...popoverTriggerProps}>
        {TriggerComponent ?? (
          <Button
            className={cn(
              "flex h-auto min-h-9 w-full justify-between px-3 py-1 text-start hover:bg-transparent",
              className,
            )}
            aria-expanded={open}
            role={"combobox"}
            variant={"outline"}>
            {props.mode === "single" ? (
              <div className={"text-start"}>
                {selectedSingleMode(
                  options?.find(opt => {
                    const option = parseOption(opt)
                    return isSelected(option?.value)
                  }),
                  placeholder,
                )}
              </div>
            ) : props.mode === "multiple" ? (
              !selected ||
              (Array.isArray(selected) && selected.length === 0) ? (
                <div>{placeholder}</div>
              ) : Array.isArray(selected) && selected.length > maxCount ? (
                <div className={"-mx-2"}>
                  <Badge
                    className={"max-w-36 gap-1"}
                    variant={"outline"}>
                    {selected?.length}

                    {" đã chọn"}
                  </Badge>
                </div>
              ) : (
                <div className={"-mx-2 flex flex-wrap gap-1"}>
                  {options.map(opt => {
                    const option = parseOption(opt)
                    if (isSelected(option?.value)) {
                      return (
                        <Badge
                          className={"max-w-36 gap-1 pr-0.5"}
                          key={option?.value}
                          variant={"outline"}>
                          <div className={"truncate"}>{option?.label}</div>

                          <div
                            className={
                              "rounded-md border border-transparent p-px hover:border-border"
                            }
                            onClick={e => {
                              e.stopPropagation()
                              onSelect(option?.value)
                            }}
                            role={"button"}>
                            <X />
                          </div>
                        </Badge>
                      )
                    }
                  })}
                </div>
              )
            ) : null}

            <div
              className={
                "grid size-4 shrink-0 place-content-center opacity-50"
              }>
              <ChevronDown />
            </div>
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        className={"w-[--radix-popover-trigger-width] min-w-52 p-0"}
        {...popoverContentProps}>
        <Command
          className={"bg-transparent"}
          filter={filterCommand}
          {...commandProps}>
          <CommandList {...commandListProps}>
            {hasEmpty ? (
              <CommandEmpty {...commandEmptyProps}>{empty}</CommandEmpty>
            ) : null}

            {hasSearch ? <CommandInput {...commandInputProps} /> : null}

            <CommandGroup className={cn(classNames?.group)}>
              {listItems}
            </CommandGroup>

            {hasNextPage ? (
              <NextPageButton
                isLoading={isFetchingNextPage}
                onClick={fetchNextPage}/>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function filterCommand(_: string, search: string, keywords?: string[]) {
  const strKeywords = keywords?.join(", ").toLowerCase() ?? ""

  if (strKeywords.search(search.toLowerCase()) >= 0) return 1
  return 0
}

function NextPageButton(props: ButtonProps) {
  return (
    <div className={"border-t p-1"}>
      <Button
        className={"w-full"}
        size={"sm"}
        type={"button"}
        variant={"ghost"}
        {...props}>
        <ChevronsDown />

        {"Tải thêm"}
      </Button>
    </div>
  )
}
