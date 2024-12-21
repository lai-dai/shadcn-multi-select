"use client"

import { ChipPicker } from "~/components/chip-picker"
import { Combobox } from "~/components/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

const Options = [
  {
    label: "text 1",
    value: 1,
  },
  {
    label: "text 2",
    value: 2,
  },
  {
    label: "text 3",
    value: 3,
  },
]

export default function HomePage() {
  return (
    <div className={"space-y-3 mx-auto container max-w-xl p-9"}>
      <Combobox
        mode={"single"}
        options={Options}
        placeholder={"Theme"}/>

      <Combobox
        mode={"multiple"}
        options={Options}
        placeholder={"Theme"}/>

      <Select>
        <SelectTrigger>
          <SelectValue placeholder={"Theme"} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={"light"}>{"Light"}</SelectItem>

          <SelectItem value={"dark"}>{"Dark"}</SelectItem>

          <SelectItem value={"system"}>{"System"}</SelectItem>
        </SelectContent>
      </Select>

      <div className={"bg-accent/30 inline-flex"}>
        <ChipPicker
          mode={"single"}
          options={Options}/>
      </div>
    </div>
  )
}
