import { CheckIcon, ChevronsDown, Search } from "lucide-react"
import React from "react"

import { Button } from "~/components/ui/button"
import { useCallbackRef } from "~/hooks/use-callback-ref"
import { useControllableState } from "~/hooks/use-controllable-state"
import {
  type ReturnSelect,
  type SelectMultipleProps,
  type SelectProps,
  type SelectValue,
  useReactSelect,
} from "~/hooks/use-react-select"

import { cn } from "~/lib/utils"
import { chain } from "~/utils/chain"

// utils
function chipPickerFilter(value: string, search: string, keywords?: string[]) {
  if (search) {
    if (keywords) {
      const strKeywords = keywords.join(", ").toLowerCase()

      return strKeywords.search(search.toLowerCase()) >= 0
    } else {
      return value.search(search) >= 0
    }
  }

  return true
}

interface ChipPickerContextValue {
  // search input
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  // filter item
  shouldFilter: boolean
  filter: (value: string, search: string, keywords?: string[]) => boolean
  // ids
  listId: string
  inputId: string
  // select
  mode?: "multiple" | "single"
  required?: boolean
  // ui
  hasToggleGroup?: boolean
}

const ChipPickerContext = React.createContext<ChipPickerContextValue | null>(
  null,
)

const useChipPicker = () => {
  const ctx = React.useContext(ChipPickerContext)
  if (!ctx) {
    throw new Error("useChip must be used within a ChipPicker")
  }
  return ctx ?? {}
}

// Chip Picker
export type BaseChipPickerProps<V extends SelectValue> = SelectProps<V> & {
  classNames?: Partial<{
    root: string
    list: string
    group: string
    item: string
    empty: string
  }>
  className?: string

  enabled?: boolean
  EmptyResultComponent?: React.ReactNode

  hasSearch?: boolean
  hasEmpty?: boolean
  hasToggleGroup?: boolean
  orientation?: "horizontal" | "vertical"

  defaultSearch?: string
  search?: string
  onSearchChange?: (search: string) => void

  filter?: (value: string, search: string, keywords?: string[]) => boolean
  shouldFilter?: boolean
}

type GroupOptions<O> = {
  heading?: React.ReactNode
  options: O[] | GroupOptions<O>[]
}

export type ChipPickerProps<
  V extends SelectValue,
  O extends Record<string, unknown>,
> = BaseChipPickerProps<V> & {
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
  groupOptions?: GroupOptions<O>[]

  renderItem?: (
    option: O,
    ctx: ReturnSelect<V, SelectProps<V>>,
  ) => React.ReactNode
  renderHeading?: (
    groupOption: GroupOptions<O>,
    ctx: ReturnSelect<V, SelectProps<V>>,
  ) => React.ReactNode

  onAllValueChange?: (values: O[]) => void
}

export function ChipPicker<
  V extends SelectValue,
  O extends Record<string, unknown>,
>(props: ChipPickerProps<V, O>) {
  const {
    fieldNames = {
      label: "label",
      value: "value",
      disabled: "disabled",
    },

    options: optionsProp = [],
    groupOptions = [{}], // yêu cầu
    renderItem,
    renderHeading,

    isLoading,
    isError,
    error,

    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,

    onAllValueChange,
    onValueChange,

    hasEmpty = true,
    hasSearch = false,
    hasToggleGroup = false,

    className,
    classNames,
    orientation = "horizontal", // hàng ngang

    EmptyResultComponent,

    defaultSearch = "",
    search,
    onSearchChange,

    shouldFilter = true,
    filter = chipPickerFilter,
    ...selectProps
  } = props

  const mapRef = React.useRef(new Map<V, O>())

  const selectCtx = useReactSelect<V>({
    ...selectProps,
    onValueChange: chain(onValueChange as (value?: V | V[]) => void, () => {
      if (onAllValueChange instanceof Function) {
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

  const getSelectItemProps = React.useCallback(
    function <Pr extends React.InputHTMLAttributes<HTMLInputElement>>(
      props: Pr & { value?: V; disabled?: boolean },
    ) {
      const {
        value,
        disabled: disabledProp = false,
        ...otherProps
      } = props ?? {}

      const selected = selectCtx.isSelected(value!)
      const disabled = disabledProp
        ? disabledProp
        : selectCtx.isDisabled(value!)

      const itemProps: Record<string, unknown> = {
        disabled: disabled ? true : undefined,
        "aria-disabled": disabled,
        "data-disabled": disabled,

        role: "option",
        "aria-selected": selected,
        "aria-checked": selected,
        "data-state": selected ? "checked" : "unchecked",
        checked: selected,

        tabIndex: -1,

        "data-value": value,
        value: value,

        ...otherProps,
      }

      return itemProps as Pr & { value?: string }
    },
    [selectCtx],
  )

  const handleHeadingSelect = React.useCallback(
    (values: SelectValue[], state: boolean | "indeterminate") => {
      if (selectProps.mode !== "multiple") {
        return
      }

      const setter = selectCtx.setSelected as (
        select: SelectMultipleProps<V>["value"],
      ) => void

      let rSelect =
        (selectCtx.selected as SelectMultipleProps<V>["value"]) ?? []

      if (state) {
        rSelect = rSelect.concat(values as V[])
      } else {
        rSelect = rSelect.filter(s => !values.includes(s))
      }

      setter(rSelect)
    },
    [selectCtx.selected, selectCtx.setSelected, selectProps.mode],
  )

  const empty =
    EmptyResultComponent ??
    (isLoading ? "Loading..." : isError ? error?.message : "Not Found!")

  const listGroups = groupOptions.map((group, idx) => {
    const groupOption: GroupOptions<O> = {
      heading: (group as GroupOptions<O>).heading,
      options: (group as GroupOptions<O>).options ?? optionsProp ?? [],
    }

    return (
      <ChipListGroup
        headingProps={{
          onSelect: handleHeadingSelect,
        }}
        className={cn(classNames?.group)}
        groupOption={groupOption}
        key={idx}
        reactSelect={selectCtx}
        renderHeading={renderHeading}>
        {option => {
          const select = parseOption(option)

          return (
            <ChipItem
              {...getSelectItemProps({
                disabled: select.disabled,
                onSelect: () => {
                  selectCtx.onSelect(select.value)
                },
                value: select.value,
              })}
              keywords={
                typeof select.label === "string" ? [select.label] : undefined
              }
              className={cn(classNames?.item)}
              key={select.value}>
              {renderItem instanceof Function ? (
                renderItem(option, selectCtx)
              ) : (
                <div className="flex items-center gap-3">
                  {selectProps.mode === "multiple" ? (
                    <ItemIndicatorMultiple />
                  ) : null}

                  <span className={"flex-1"}>{select?.label}</span>

                  {selectProps.mode === "single" ? (
                    <ItemIndicatorSingle>
                      <CheckIcon />
                    </ItemIndicatorSingle>
                  ) : null}
                </div>
              )}
            </ChipItem>
          )
        }}
      </ChipListGroup>
    )
  })

  return (
    <ChipProvider
      value={{
        filter,
        shouldFilter,
        mode: selectProps.mode,
        required: selectProps.required,
        hasToggleGroup,
      }}
      className={cn(classNames?.root, className)}
      defaultSearch={defaultSearch}
      onSearchChange={onSearchChange}
      search={search}>
      {hasSearch ? (
        <ChipSearch>
          <Search className={"mr-2 h-4 w-4 shrink-0 opacity-50"} />

          <ChipInput placeholder={"Tìm kiếm"} />
        </ChipSearch>
      ) : null}

      <ChipList className={cn(classNames?.list)}>
        {hasEmpty ? (
          <ChipEmpty className={cn(classNames?.empty)}>{empty}</ChipEmpty>
        ) : null}

        {listGroups}

        {hasNextPage ? (
          <div aria-label={"c-next-page"} className={"border-t p-1"}>
            <Button
              className={"w-full"}
              size={"sm"}
              type={"button"}
              variant={"ghost"}
              isLoading={isFetchingNextPage}
              onClick={fetchNextPage}>
              <ChevronsDown />

              {"Tải thêm"}
            </Button>
          </div>
        ) : null}
      </ChipList>
    </ChipProvider>
  )
}

interface ChipListGroupProps<
  V extends SelectValue,
  O extends Record<string, unknown>,
> {
  groupOption: GroupOptions<O>
  children: React.ReactNode | ((option: O) => React.ReactNode)
  renderHeading?: (
    groupOption: GroupOptions<O>,
    ctx: ReturnSelect<V, SelectProps<V>>,
  ) => React.ReactNode
  reactSelect: ReturnSelect<V, SelectProps<V>>
  headingProps?: ChipGroupHeadingProps<V>
  classNames?: Partial<{
    root: string
    heading: string
    group: string
  }>
  className?: string
}

function ChipListGroup<
  V extends SelectValue,
  O extends Record<string, unknown>,
>({
  groupOption,
  reactSelect,
  renderHeading,
  headingProps,
  classNames,
  className,
  ...props
}: ChipListGroupProps<V, O>) {
  const heading =
    renderHeading instanceof Function
      ? renderHeading(groupOption, reactSelect)
      : groupOption.heading

  return (
    <ChipGroup className={cn(classNames?.root)}>
      {heading ? (
        <ChipGroupHeading {...headingProps} className={cn(classNames?.heading)}>
          {heading}
        </ChipGroupHeading>
      ) : null}

      <div
        className={cn(
          heading
            ? "relative p-1 pl-2 pt-0 after:absolute after:bottom-0 after:left-2 after:top-0 after:border-l after:border-muted"
            : "",
          classNames?.group,
          className,
        )}
        aria-label={"group-items"}
        role={"group"}>
        {groupOption.options.map((option, idx) => {
          if ("heading" in option || "options" in option) {
            const subGroupOption = option as GroupOptions<O>

            return (
              <ChipListGroup
                classNames={{
                  group: "pr-0",
                }}
                groupOption={subGroupOption}
                key={idx}
                reactSelect={reactSelect}
                {...props}
              />
            )
          }

          return (
            <React.Fragment key={idx}>
              {props.children instanceof Function
                ? props.children(option)
                : props.children}
            </React.Fragment>
          )
        })}
      </div>
    </ChipGroup>
  )
}

interface ChipProviderProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  defaultSearch?: string
  search?: string
  onSearchChange?: (search: string) => void
  value: Omit<
    ChipPickerContextValue,
    "searchValue" | "setSearchValue" | "listId" | "inputId"
  >
}

function ChipProvider({
  defaultSearch,
  search,
  onSearchChange,
  value,
  ...props
}: ChipProviderProps) {
  const [searchValue, setSearchValue] = useControllableState({
    defaultProp: defaultSearch,
    prop: search,
    onChange: onSearchChange,
  })

  const listId = React.useId()
  const inputId = React.useId()

  return (
    <ChipPickerContext.Provider
      value={{
        searchValue,
        setSearchValue,
        listId,
        inputId,
        ...value,
      }}>
      <div aria-label={"chip-picker"} {...props} />
    </ChipPickerContext.Provider>
  )
}

function ChipSearch({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-label={"search"}
      className={cn("flex items-center border-b px-3", className)}
      {...props}
    />
  )
}

const ChipInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const ctx = useChipPicker()

  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-autocomplete={"list"}
      aria-controls={ctx.listId}
      aria-expanded={true}
      aria-label={"search-input"}
      autoComplete={"off"}
      autoCorrect={"off"}
      id={ctx.inputId}
      onChange={e => ctx.setSearchValue(e.target.value)}
      ref={ref}
      role={"combobox"}
      spellCheck={false}
      type={"text"}
      value={ctx.searchValue}
      {...props}
    />
  )
})
ChipInput.displayName = "ChipInput"

function ChipList({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) {
  const ctx = useChipPicker()

  return (
    <div
      className={cn(
        "[&:has(.c-group:empty)>.c-empty]:block [&:not(&:has(.c-item))>.c-empty]:block",
        className,
      )}
      aria-label={"list"}
      aria-required={ctx.required ?? false}
      id={ctx.listId}
      role={ctx.mode === "multiple" ? "listbox" : "radiogroup"}
      tabIndex={0}
      {...props}
    />
  )
}

function ChipEmpty({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden={"true"}
      aria-label={"empty"}
      className={cn("c-empty hidden py-6 text-center text-sm", className)}
      role={"presentation"}
      {...props}
    />
  )
}

function ChipGroup({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "c-group empty:hidden [&:not(&:has(.c-item))]:hidden [&:not(&:has(input:checked))_.c-heading-indeterminate]:hidden [&:not(&:has(input[aria-selected=false]))_.c-heading-checked]:block [&:not(&:has(input[aria-selected=false]))_.c-heading-indeterminate]:hidden",
        className,
      )}
      aria-label={"group"}
      role={"presentation"}
      {...props}
    />
  )
}

interface ChipGroupHeadingProps<V extends SelectValue>
  extends Omit<React.HtmlHTMLAttributes<HTMLDivElement>, "onSelect"> {
  onSelect?: (values: V[], state: boolean | "indeterminate") => void
}

function ChipGroupHeading<V extends SelectValue>({
  className,
  children,
  onSelect,
  ...props
}: ChipGroupHeadingProps<V>) {
  const ctx = useChipPicker()

  const onSelectProp = useCallbackRef(onSelect)

  const handleSelect = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    event => {
      event.stopPropagation()

      const parentEl = event.currentTarget.parentElement?.parentElement

      if (parentEl) {
        const itemCheckedEls = parentEl.querySelectorAll(
          "input[aria-selected=true]",
        )
        const itemUnCheckedEls = parentEl.querySelectorAll(
          "input[aria-selected=false]",
        )

        const values: V[] = []
        // khi bỏ chọn tất cả thì cần tất cả dữ liệu đề loại bỏ
        const valueEl =
          itemUnCheckedEls.length === 0 ? itemCheckedEls : itemUnCheckedEls

        valueEl.forEach(el => {
          const value = el.getAttribute("data-value")

          // kiểm tra chuổi có phải là số
          if (value && /^-?\d+\.?\d*$/.test(value)) {
            values.push(Number(value) as V)
          } else {
            values.push(value as V)
          }
        })

        onSelectProp(
          values,
          itemCheckedEls.length === 0 // khi mà tất cả item không được chọn
            ? true
            : itemUnCheckedEls.length === 0 // khi tất cả item được chọn
              ? false
              : "indeterminate", // khi 1 phần item đươc chọn
        )
      }
    },
    [onSelectProp],
  )

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-2.5 py-1.5 text-xs font-medium text-muted-foreground",
        className,
      )}
      aria-hidden={true}
      aria-label={"group-heading"}
      {...props}>
      {ctx.mode === "multiple" && ctx.hasToggleGroup ? (
        <div
          className={
            "grid size-4 cursor-pointer place-content-center rounded-sm border hover:bg-muted"
          }
          aria-label={"chip-toggle-group"}
          onClick={handleSelect}
          role={"presentation"}>
          <div
            className={
              "c-heading-checked mb-px hidden h-2 w-1 rotate-45 border-b-2 border-r-2 border-solid border-current"
            }
            aria-label={"check-icon"}
          />

          <div
            aria-label={"dash-icon"}
            className={"c-heading-indeterminate h-0.5 w-2 bg-current"}
          />
        </div>
      ) : null}

      {children}
    </div>
  )
}

interface ChipItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onSelect"> {
  classNames?: Partial<{
    root: string
    input: string
    label: string
  }>
  value: string
  keywords?: string[]
  onSelect?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
}

function ChipItem({
  className,
  classNames,
  children,
  value,
  keywords,
  onSelect,
  ...props
}: ChipItemProps) {
  const ctx = useChipPicker()

  const onSelectProp = useCallbackRef(onSelect)

  const id = React.useId()

  const isRender = React.useMemo(() => {
    return ctx.shouldFilter
      ? ctx.filter(value, ctx.searchValue, keywords)
      : true
  }, [ctx, keywords, value])

  if (!isRender) {
    return null
  }
  return (
    <div
      aria-label={"item"}
      aria-selected={props.checked ?? false}
      className={cn("c-item", classNames?.root)}
      id={`c-option-${id}`}
      role={"option"}>
      <input
        onChange={event => {
          event.stopPropagation()

          onSelectProp(value, event)
        }}
        className={cn("peer sr-only", classNames?.input)}
        id={`c-item-${id}`}
        type={ctx.mode === "multiple" || !ctx.required ? "checkbox" : "radio"}
        {...props}
      />

      <label
        className={cn(
          "block rounded-sm border-2 border-transparent px-2 py-1.5 text-sm outline-none hover:bg-muted/50 peer-disabled:pointer-events-none peer-disabled:opacity-50 peer-checked:[&_.c-indicator]:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          ctx.mode === "multiple"
            ? ""
            : "peer-checked:bg-accent peer-checked:text-accent-foreground",
          classNames?.label,
          className,
        )}
        htmlFor={`c-item-${id}`}>
        {children}
      </label>
    </div>
  )
}

function ItemIndicatorMultiple({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid size-4 cursor-pointer place-content-center rounded-sm border hover:bg-muted",
        className,
      )}
      aria-label={"indicator-multiple"}
      role={"presentation"}
      {...props}>
      <div
        className={
          "c-indicator mb-px h-2 w-1 rotate-45 border-b-2 border-r-2 border-solid border-current opacity-0"
        }
        aria-label={"check-icon"}
      />
    </div>
  )
}

function ItemIndicatorSingle({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-label={"indicator-single"}
      className={cn("c-indicator opacity-0", className)}
      role={"presentation"}
      {...props}
    />
  )
}
