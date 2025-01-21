"use client"

import { ChipPicker as ChipPicker2 } from "~/components/chip-picker-2"

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
    heading: "Heading 1",
    options: Options,
  },
  {
    heading: "Heading 2",
    options: [
      ...Options2,
      {
        heading: "Heading 2-1",
        options: Options3,
      },
    ],
  },
]

const otherOption = [
  {
    _id: 1,
    title: "test",
    desc: "test",
  },
  {
    _id: 2,
    title: "test 2",
    desc: "test",
  },
]

export default function HomePage() {
  return (
    <div className={"container mx-auto max-w-xl space-y-3 p-9"}>
      <div className={"py-9"}>
        <div className={"flex"}>
          <ChipPicker2
            // fieldNames={{
            //   label: option => (
            //     <div className={"abs"}>{option.title}</div>
            //   ),
            //   value: '_id',
            // }}
            groupOptions={groupOptions}
            mode={"multiple"}
          />
        </div>
      </div>
    </div>
  )
}
