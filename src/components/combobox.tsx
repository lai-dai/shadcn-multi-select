import { Check, ChevronDown, Ellipsis, X } from "lucide-react"
import React from "react"
import { ErrorView } from "~/components/error"

import { Loading } from "~/components/loading"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import {
  type SelectProps,
  useReactSelect,
  type SelectValue,
} from "~/hooks/use-react-select"
import { cn } from "~/lib/utils"

// utils
function filterCommand(value: string, search: string, keywords?: string[]) {
  const strKeywords = keywords?.join(", ").toLowerCase() ?? ""

  if (strKeywords.search(search.toLowerCase()) >= 0) return 1
  return 0
}

// Combobox
export type BaseComboboxProps<V extends SelectValue> = SelectProps<V> & {
  align?: "center" | "end" | "start"
  className?: string
  enabled?: boolean
  filter?: (value: string, search: string, keywords?: string[]) => number
  hasSearch?: boolean
  maxCount?: number
  onSearchChange?: (search: string) => void
  placeholder?: string
  search?: string
  shouldFilter?: boolean
  TriggerComponent?: React.ReactElement
}

export type ComboboxProps<
  V extends SelectValue,
  O extends Record<string, unknown>,
> = BaseComboboxProps<V> & {
  error?: Error | null
  fetchNextPage?: () => void
  fieldNames?: Record<"label" | "value", keyof O | ((value: O) => unknown)>
  hasNextPage?: boolean
  isError?: boolean
  isFetchingNextPage?: boolean
  isLoading?: boolean
  onAllValueChange?: (values?: O) => void
  options?: O[]
}

export function Combobox<
  V extends SelectValue,
  O extends Record<string, unknown>,
>({
  fieldNames = {
    label: "label",
    value: "value",
  },
  align,
  className,
  enabled = true,
  error,
  fetchNextPage,
  filter,
  hasNextPage,
  hasSearch = false,
  isError,
  isFetchingNextPage,
  isLoading,
  maxCount = 2,
  onAllValueChange,
  onSearchChange,
  options = [],
  placeholder,
  search,
  shouldFilter = true,
  TriggerComponent,
  ...props
}: ComboboxProps<V, O>) {
  const [open, setOpen] = React.useState(false)

  const { getSelectItemProps, onSelect, isSelected, selected } =
    useReactSelect<V>(props)

  const parseOption = React.useCallback(
    function (option: O) {
      return {
        label:
          typeof fieldNames.label === "function"
            ? fieldNames.label(option)
            : (option[fieldNames.label] ?? ""),
        value:
          typeof fieldNames.value === "function"
            ? fieldNames.value(option)
            : (option[fieldNames.value] ?? ""),
      } as {
        label: React.ReactNode
        value: V
      }
    },
    [fieldNames],
  )

  const handleSelect = React.useCallback(
    (targetOption: ReturnType<typeof parseOption>) => {
      onSelect(targetOption?.value)
      // Chế độ chọn nhiều -> Không đóng popover
      setOpen(props.mode === "multiple")
      // Lấy toàn bộ giá trị của option
      if (typeof onAllValueChange === "function") {
        const allValue = options?.find(opt => {
          const option = parseOption(opt)

          return option?.value === targetOption?.value
        })
        onAllValueChange(allValue)
      }
    },
    [parseOption, onAllValueChange, onSelect, options, props.mode],
  )

  const selectedSingleMode = React.useCallback(
    (option?: O, defaultValue?: string) => {
      if (option) {
        return parseOption(option).label ?? defaultValue
      }
      return defaultValue
    },
    [parseOption],
  )

  return (
    <Popover
      onOpenChange={setOpen}
      open={open}>
      <PopoverTrigger
        asChild={true}
        disabled={!enabled}>
        {TriggerComponent ?? (
          <Button
            className={cn(
              "flex h-auto min-h-9 w-full justify-between px-3 py-0 hover:bg-transparent",
              className,
            )}
            aria-expanded={open}
            role={"combobox"}
            variant={"outline"}>
            {props.mode === "single" ? (
              <div>
                {selectedSingleMode(
                  options?.find(it => {
                    const item = parseOption(it)
                    return isSelected(item?.value)
                  }),
                  placeholder,
                )}
              </div>
            ) : props.mode === "multiple" ? (
              !selected ||
              (Array.isArray(selected) && selected.length === 0) ? (
                placeholder
              ) : Array.isArray(selected) && selected.length > maxCount ? (
                <div className={"-mx-2"}>
                  <Badge
                    className={"max-w-36 gap-1 rounded-full"}
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
                          className={"max-w-36 gap-1 rounded-sm pr-0.5"}
                          key={option?.value}
                          variant={"outline"}>
                          <div className={"truncate"}>{option?.label}</div>

                          <div
                            className={
                              "rounded-sm border border-transparent p-px hover:border-border"
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

            <ChevronDown className={"ml-2 size-4 shrink-0 opacity-50"} />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className={"w-[--radix-popover-trigger-width] min-w-52 p-0"}>
        <Command
          className={"bg-transparent"}
          filter={filter ?? filterCommand}
          shouldFilter={shouldFilter}>
          {hasSearch ? (
            <CommandInput
              onValueChange={onSearchChange}
              placeholder={"Tìm kiếm"}
              value={search}/>
          ) : null}

          <CommandList>
            {hasSearch ? (
              <CommandEmpty>
                {isLoading ? (
                  <Loading />
                ) : isError ? (
                  <ErrorView error={error} />
                ) : (
                  <ErrorView message={"Không tìm thấy kết quả nào"} />
                )}
              </CommandEmpty>
            ) : null}

            <CommandGroup>
              {options.map(opt => {
                const option = parseOption(opt)
                return (
                  <CommandItem
                    key={option?.value}
                    {...getSelectItemProps({
                      value: option?.value,
                      onSelect: () => handleSelect(option),
                    })}
                    keywords={
                      typeof option?.label === "string"
                        ? [option?.label]
                        : undefined
                    }
                    className={"[&[data-state=unchecked]>svg]:opacity-0"}>
                    <div className={"grow"}>{option?.label}</div>

                    <Check />
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {hasNextPage ? (
              <React.Fragment>
                <CommandSeparator />

                <CommandGroup className={"text-center"}>
                  <Button
                    className={"w-full"}
                    isLoading={isFetchingNextPage}
                    onClick={fetchNextPage}
                    size={"sm"}
                    type={"button"}
                    variant={"ghost"}>
                    <Ellipsis />

                    {"Tải thêm"}
                  </Button>
                </CommandGroup>
              </React.Fragment>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
