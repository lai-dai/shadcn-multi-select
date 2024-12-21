"use client"

import { Download, Save } from "lucide-react"
import Link from "next/link"
import { ChipPicker } from "~/components/chip-picker"
import { Combobox } from "~/components/combobox"
import { Button } from "~/components/ui/button"
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
    <div className={"container mx-auto max-w-xl space-y-3 p-9"}>
      <Button
        asChild={true}
        isLoading={true}>
        <Link href={"/"}>
          <Download />

          {"Button"}

          <Save />
        </Link>
      </Button>

      <Button
        isLoading={true}
        size={"icon"}>
        <Save />
      </Button>

      <Button
        isLoading={true}
        variant={'destructive'}>
        {"Button"}
      </Button>

      <Button
        isLoading={true}
        variant={'ghost'}>
        {"Button"}
      </Button>

      <Button
        isLoading={true}
        variant={'outline'}>
        {"Button"}
      </Button>

      <Combobox
        hasNextPage={true}
        hasSearch={true}
        mode={"single"}
        options={Options}
        placeholder={"Theme"} />

      <Combobox

        mode={"multiple"}
        options={Options}
        placeholder={"Theme"} />

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

      <div className={"inline-flex bg-accent/30"}>
        <ChipPicker
          mode={"single"}
          options={Options} />
      </div>
    </div>
  )
}
