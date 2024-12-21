import { Ellipsis } from "lucide-react"
import React from "react"
import { ErrorView } from "~/components/error"

import { Loading } from "~/components/loading"
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

// Chip Picker
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
      // Lấy toàn bộ giá trị của option
      if (typeof onAllValueChange === "function") {
        const allValue = options?.find(opt => {
          const option = parseOption(opt)

          return option?.value === targetOption?.value
        })
        onAllValueChange(allValue)
      }
    },
    [parseOption, onAllValueChange, onSelect, options],
  )

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

        <CommandGroup
          className={cn(
            orientation === "horizontal" ? "*:flex *:flex-wrap *:gap-3" : "",
          )}>
          {options.map(opt => {
            const option = parseOption(opt)
            return (
              <CommandItem
                key={option?.value}
                {...getSelectItemProps({
                  value: option?.value,
                  onSelect: () => handleSelect(option),
                })}
                className={cn(
                  "data-[disabled=true]:pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[disabled=true]:opacity-50",
                  // orientation === "horizontal" ? "bg-accent" : "",
                )}
                keywords={
                  typeof option?.label === "string"
                    ? [option?.label]
                    : undefined
                }>
                {option?.label}
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
  )
}
