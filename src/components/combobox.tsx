import { Check, ChevronDown, Ellipsis, Loader2, X } from "lucide-react"
import React from "react"

import { ErrorMessage } from "~/components/error-message"
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

function filterCommand(value: string, search: string, keywords?: string[]) {
  const strKeywords = keywords?.join(", ").toLowerCase() ?? ""

  if (strKeywords.search(search.toLowerCase()) >= 0) return 1
  return 0
}

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

  const { getSelectItemProps, onSelect, isSelected, selected } = useReactSelect<V>(props)

  const getFieldName = React.useCallback(
    function (item: O) {
      return {
        label:
          typeof fieldNames.label === "function"
            ? fieldNames.label(item)
            : (item[fieldNames.label] ?? ""),
        value:
          typeof fieldNames.value === "function"
            ? fieldNames.value(item)
            : (item[fieldNames.value] ?? ""),
      } as {
        label: string
        value: V
      }
    },
    [fieldNames],
  )

  const getValueForModeSingle = React.useCallback(
    (item?: O) => {
      if (item) {
        return getFieldName(item).label
      }
      return placeholder
    },
    [getFieldName, placeholder],
  )

  const hasEmpty = isLoading ?? isError ?? false

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
              "flex h-auto min-h-9 w-full justify-between bg-transparent px-3 py-0",
              props.mode === 'multiple' ? "hover:bg-transparent" : "",
              className,
            )}
            aria-expanded={open}
            role={"combobox"}
            variant={"outline"}>
            {props.mode === "single" ? (
              <span>
                {getValueForModeSingle(
                  options?.find(it => {
                    const item = getFieldName(it)
                    return isSelected(item?.value)
                  }),
                )}
              </span>
            ) : props.mode === "multiple" ? (
              !selected || Array.isArray(selected) && selected?.length === 0 ? (
                <span>{placeholder}</span>
              ) : Array.isArray(selected) && selected?.length > maxCount ? (
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
                  {options.map(it => {
                    const item = getFieldName(it)

                    if (isSelected(item?.value)) {
                      return (
                        <Badge
                          className={"max-w-36 gap-1.5 rounded-full pr-1"}
                          key={item?.value}
                          title={item?.label}
                          variant={"outline"}>
                          <span className={"truncate"}>{item?.label}</span>

                          <span
                            className={
                              "rounded-xl hover:bg-muted"
                            }
                            onClick={e => {
                              e.stopPropagation()
                              onSelect(item?.value)
                            }}
                            role={"button"}>
                            <X />
                          </span>
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
            {hasEmpty ? (
              <CommandEmpty className={"grid place-content-center"}>
                {isLoading ? (
                  <Loading />
                ) : isError ? (
                  <ErrorMessage error={error} />
                ) : (
                  <ErrorMessage message={"Không tìm thấy kết quả nào"} />
                )}
              </CommandEmpty>
            ) : null}

            <CommandGroup>
              {options.map(it => {
                const item = getFieldName(it)

                return (
                  <CommandItem
                    key={item?.value}
                    {...getSelectItemProps({
                      value: item?.value,
                      onSelect: () => {
                        onSelect(item?.value)
                        setOpen(props.mode === "multiple")

                        if (typeof onAllValueChange === "function") {
                          const allValue = options?.find(it => {
                            const item = getFieldName(it)

                            return item?.value === item?.value
                          })

                          onAllValueChange(allValue)
                        }
                      },
                    })}
                    className={"group/item"}
                    keywords={item?.label ? [item?.label] : undefined}>
                    <Check
                      className={
                        "size-4 opacity-0 group-data-[state=checked]/item:opacity-100"
                      }/>

                    {item?.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {hasNextPage ? (
              <CommandGroup className={"text-center"}>
                <Button
                  className={"w-full rounded-sm hover:bg-accent"}
                  onClick={fetchNextPage}
                  size={"sm"}
                  type={"button"}
                  variant={"ghost"}>
                  {isFetchingNextPage ? (
                    <Loader2 className={"animate-spin"} />
                  ) : (
                    <Ellipsis />
                  )}

                  {"Tải thêm"}
                </Button>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
