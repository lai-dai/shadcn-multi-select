"use client"

import { Download, Save } from "lucide-react"
import Link from "next/link"
import { ChipPicker } from "~/components/chip-picker"
import { ChipPicker as ChipPicker2 } from "~/components/chip-picker-2"
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
    label: "abc 123",
    value: 1,
  },
  {
    label: "def 456",
    value: 2,
  },
  {
    label: "ghik 789",
    value: 3,
  },
]
const Options2 = [
  {
    label: "ơ nơi phương xa ấy",
    value: 4,
  },
  {
    label: "người có nhớ tới ko",
    value: 5,
  },
  {
    label: "dẫu cho đổi thay",
    value: 6,
  },
]
const Options3 = [
  {
    label: "tôi cô đơn",
    value: 7,
  },
  {
    label: "tôi nhớ ai",
    value: 8,
  },
  {
    label: "tôi làm gì",
    value: 9,
  },
]

const groupOptions = [
  {
    // heading: "Heading 1",
    options: Options,
  },
  {
    // heading: "Heading 2",
    options: [
      ...Options2,
      {
        // heading: "Heading 2-1",
        options: Options3,
      },
    ],
  },
]

export default function HomePage() {
  return (
    <div className={"container mx-auto max-w-xl space-y-3 p-9"}>
      <div className={"py-9"}>
        <div className={"flex"}>
          <div className={"border"}>
            <ChipPicker2 mode={"multiple"} options={groupOptions} />
          </div>
        </div>
      </div>

      <Button asChild={true} isLoading={true}>
        <Link href={"/"}>
          <Download />

          {"Button"}

          <Save />
        </Link>
      </Button>

      <Button isLoading={true} size={"icon"}>
        <Save />
      </Button>

      <Button isLoading={true} variant={"destructive"}>
        {"Button"}
      </Button>

      <Button isLoading={true} variant={"ghost"}>
        {"Button"}
      </Button>

      <Button isLoading={true} variant={"outline"}>
        {"Button"}
      </Button>

      <Combobox
        hasNextPage={true}
        hasSearch={true}
        mode={"single"}
        options={Options}
        placeholder={"Theme"}
      />

      <Combobox
        mode={"single"}
        options={Options}
        placeholder={"Theme"}
        required={true}
      />

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
        <ChipPicker mode={"single"} options={Options} />
      </div>
    </div>
  )
}
