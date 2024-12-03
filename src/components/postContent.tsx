import { Mdx } from "./mdx-components"

interface PostContentProps {
  content: string
  slug: string
  title: string
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div className={"post prose mb-5 mt-8 max-w-full rounded-lg p-4"}>
      <Mdx content={content} />

      <div className={"mt-10"}>
        <div className={"divider text-xl"}>{"Support"}</div>

        <p
          className={"mx-auo mb-0 mt-8 flex justify-center text-xs md:text-lg"}>
          {"\\ Please support me by buying me a coffee /"}
        </p>
      </div>
    </div>
  )
}
