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
} from "~/components/ui/command"
import {
  type SelectProps,
  useReactSelect,
  type SelectValue,
  type ReturnSelect,
} from "~/hooks/use-react-select"
import { cn } from "~/lib/utils"
import { chain } from "~/utils/chain"

type IconProps = React.HTMLAttributes<HTMLDivElement>

const Icon = {
  Check: ({
    className, ...props
  }: IconProps) => (
    <div
      className={
        cn(
          "w-1 h-2 border-current rotate-45 border-b-2 border-r-2 border-solid mb-px", className
        )
      }
      aria-label={"check-icon"}
      {...props}/>
  ),
}

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
  classNames?: Partial<{
    group: string
    item: string
  }>
  enabled?: boolean
  defaultSearch?: string
}

export type ChipPickerProps<
  V extends SelectValue,
  O extends Record<string, unknown>,
> = BaseChipPickerProps<V> & {
  error?: Error | null
  fetchNextPage?: () => void
  fieldNames?: {
    label: keyof O | ((value: O) => unknown)
    value: keyof O | ((value: O) => unknown)
    disabled?: keyof O | ((value: O) => unknown)
  }
  hasNextPage?: boolean
  isError?: boolean
  isFetchingNextPage?: boolean
  isLoading?: boolean
  onAllValueChange?: (values: O[]) => void
  options?: O[]
  renderItem?: (values: O, ctx: ReturnSelect<V, SelectProps<V>>) => React.ReactNode
}

export function ChipPicker<
  V extends SelectValue,
  O extends Record<string, unknown>,
>({
  fieldNames = {
    label: "label",
    value: "value",
    disabled: "disabled",
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
  defaultSearch,
  shouldFilter = true,
  classNames,
  onValueChange,
  renderItem,
  ...props
}: ChipPickerProps<V, O>) {
  const reactSelect = useReactSelect<V>({
    ...props,
    onValueChange: chain(
      onValueChange as (value?: V | V[]  ) => void, (value) => {
        if (typeof onAllValueChange === "function") {
          const found = options?.filter((opt) => {
            const option = parseOption(opt)

            if (props.mode === "multiple") {
              return (value as V[]).includes(option.value)
            }
            return value === option.value
          }) ?? []

          onAllValueChange(found)
        }
      }
    ),
  })

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
        disabled: typeof fieldNames.disabled === "function"
          ? fieldNames.disabled(option)
          : (fieldNames.disabled ? option[fieldNames.disabled] ?? false : false),
      } as {
        label: React.ReactNode
        value: V
        disabled: boolean
      }
    },
    [fieldNames],
  )

  const getSelectItemProps = React.useCallback(
      function <Pr>(props: Pr & { value?: V; disabled?: boolean }) {
        const { value, disabled: disabledProp = false } = props ?? {}
        const selected = reactSelect.isSelected(value!)
        const disabled = disabledProp ? disabledProp : reactSelect.isDisabled(value!)

        const itemProps: Record<string, unknown> = {
          "data-state": selected ? "checked" : "unchecked",
          "aria-selected": selected,
          "data-disabled": disabled,
          "aria-disabled": disabled,
          disabled: disabled,
          role: "option",
          tabIndex: "-1",
          ...props,
        }

        return itemProps as Pr & { value?: string }
      },
      [reactSelect],
    )

  return (
    <Command
      className={"bg-transparent rounded-none h-auto"}
      filter={filter ?? filterCommand}
      shouldFilter={shouldFilter}>
      {
        hasSearch ? (
          <CommandInput
            defaultValue={defaultSearch}
            onValueChange={onSearchChange}
            placeholder={"Tìm kiếm"}
            value={search}/>
        ) : null
      }

      <CommandList className={
        cn(
          "max-h-max", hasSearch ? "mt-1" : ""
        )
      }>
        <CommandEmpty className={"py-0"}>
          {
            isLoading ? (
              <Loading />
            ) : isError ? (
              <ErrorView error={error} />
            ) : (
              <ErrorView message={"Không tìm thấy kết quả nào"} />
            )
          }
        </CommandEmpty>

        <CommandGroup
          className={
            cn(
              "p-0 *:flex *:gap-1",
              orientation === "horizontal" ? "*:flex-wrap" : "*:flex-col",
              classNames?.group
            )
          }>
          {
            options.map((opt) => {
              const option = parseOption(opt)
              return (
                <CommandItem
                  key={option?.value}
                  {...getSelectItemProps({
                    value: option?.value,
                    onSelect: () => reactSelect.onSelect(option?.value),
                    disabled: option.disabled,
                  })}
                  className={
                    cn(
                      "group data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 rounded-lg p-0 data-[selected=true]:bg-transparent",
                      classNames?.item,
                    )
                  }
                  keywords={
                    typeof option?.label === "string"
                      ? [option?.label]
                      : undefined
                  }>
                  {
                    renderItem instanceof Function ? renderItem(
                      opt, reactSelect
                    ) : (
                      <div className={
                        cn(
                          "flex-1 px-2 py-1.5 group-data-[state=checked]:border-primary border-2 border-transparent group-data-[state=checked]:text-primary group-data-[state=checked]:bg-accent rounded-xl bg-accent flex gap-2 items-center",
                          orientation === "vertical" ? "bg-transparent group-data-[selected=true]:bg-accent" : ""
                        )
                      }>
                        {
                          props.mode === "multiple" ? (
                            <div className={"size-4 shrink-0 grid place-content-center bg-zinc-700/50 group-data-[state=checked]:bg-primary rounded-lg text-white"}>
                              <Icon.Check className={"group-data-[state=unchecked]:opacity-0"} />
                            </div>
                          ) : orientation === "vertical" ? (
                            <div className={"size-4 border-2 border-foreground/10 rounded-full group-data-[state=checked]:border-4 group-data-[state=checked]:border-primary"} />
                          ) : null
                        }

                        {option?.label}
                      </div>
                    )
                  }
                </CommandItem>
              )
            })
          }
        </CommandGroup>

        {
          hasNextPage ? (
            <CommandGroup className={"text-center border-t mt-1"}>
              <Button
                className={"w-full"}
                isLoading={isFetchingNextPage}
                onClick={fetchNextPage}
                size={"sm"}
                type={"button"}
                variant={"ghost"}>
                <Ellipsis />

                {"Tải thêm\r"}
              </Button>
            </CommandGroup>
          ) : null
        }
      </CommandList>
    </Command>
  )
}
