"use client"

import { Command, CommandItem, CommandList } from "~/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useReactSelect } from "~/hooks/use-react-select"

const options = [
  {
    label: "text 1",
    value: "1",
  },
  {
    label: "text 2",
    value: "2",
  },
]

export default function HomePage() {
  const { getSelectItemProps, onSelect } = useReactSelect({
    mode: "single",
    required: true,
  })

  return (
    <div>
      <Command>
        <CommandList>
          {options.map(({ label, value }) => (
            <CommandItem
              key={value}
              {...getSelectItemProps({
                value,
                onSelect: value => onSelect(value),
              })}
              className={
                "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
              }>
              {label}
            </CommandItem>
          ))}
        </CommandList>
      </Command>

      <Select>
        <SelectTrigger className={"w-[180px]"}>
          <SelectValue placeholder={"Theme"} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={"light"}>{"Light"}</SelectItem>

          <SelectItem value={"dark"}>{"Dark"}</SelectItem>

          <SelectItem value={"system"}>{"System"}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
