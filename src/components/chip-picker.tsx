import { Ellipsis, Loader2 } from "lucide-react"
import React from "react"

import { ErrorMessage } from "~/components/error-message"
import { Loading } from "~/components/loading"
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

export type BaseChipPickerProps<V extends SelectValue> = SelectProps<V> & {
  filter?: (value: string, search: string, keywords?: string[]) => number
  hasSearch?: boolean
  onSearchChange?: (search: string) => void
  orientation?: "horizontal" | "vertical"
  search?: string
  shouldFilter?: boolean
}

export type ChipPickerProps<
  V extends SelectValue,
  O extends Record<string, unknown>,
> = BaseChipPickerProps<V> & {
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

export function ChipPicker<
  V extends SelectValue,
  O extends Record<string, unknown>,
>({
  fieldNames = {
    label: "label",
    value: "value",
  },
  error,
  fetchNextPage,
  filter,
  hasNextPage,
  hasSearch = false,
  isError,
  isFetchingNextPage,
  isLoading,
  onAllValueChange,
  onSearchChange,
  options = [],
  orientation = "horizontal",
  search,
  shouldFilter = true,
  ...props
}: ChipPickerProps<V, O>) {
  const { getSelectItemProps, onSelect } = useReactSelect<V>(props)

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

  const hasEmpty = isLoading ?? isError ?? false

  return (
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

        <CommandGroup
          className={cn(
            orientation === "horizontal" ? "*:flex *:flex-wrap *:gap-3" : "",
          )}>
          {options.map(it => {
            const item = getFieldName(it)

            return (
              <CommandItem
                key={item?.value}
                {...getSelectItemProps({
                  value: item?.value,
                  onSelect: () => {
                    onSelect(item?.value)

                    if (typeof onAllValueChange === "function") {
                      const allValue = options?.find(it => {
                        const item = getFieldName(it)

                        return item?.value === item?.value
                      })

                      onAllValueChange(allValue)
                    }
                  },
                })}
                className={cn(
                  "data-[disabled=true]:pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[disabled=true]:opacity-50",
                  orientation === "horizontal" ? "bg-accent" : "",
                )}
                keywords={item?.label ? [item?.label] : undefined}
                title={item?.label}>
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
  )
}
