import { type MDXComponents } from "mdx/types"
import Image from "next/image"
import Link from "next/link"
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypePrettyCode, {
  type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { visit } from "unist-util-visit"
import { Callout } from "~/components/callout"
import { ComponentPreview } from "~/components/component-preview"
import { CopyButton } from "~/components/copy-button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { rehypeComponent } from "~/lib/rehype-component"
import { cn } from "~/lib/utils"

const components: MDXComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "font-heading mt-2 scroll-m-20 text-4xl font-bold",
        className,
      )}
      {...props}/>
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}/>
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "font-heading mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}/>
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "font-heading mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className,
      )}
      {...props}/>
  ),
  h5: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      className={cn(
        "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className,
      )}
      {...props}/>
  ),
  h6: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      className={cn(
        "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
        className,
      )}
      {...props}/>
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}/>
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn("my-6 ml-6 list-disc", className)}
      {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("my-6 ml-6 list-decimal", className)}
      {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <li
      className={cn("mt-2", className)}
      {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn("mt-6 border-l-2 pl-6 italic", className)}
      {...props}/>
  ),
  img: ({
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={cn("rounded-md", className)}
      {...props} />
  ),
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className={"my-4 md:my-8"}
      {...props} />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className={"my-6 w-full overflow-y-auto"}>
      <table
        className={cn(
          "relative w-full overflow-hidden border-none text-sm",
          className,
        )}
        {...props}/>
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn("last:border-b-none m-0 border-b", className)}
      {...props}/>
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}/>
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        "px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}/>
  ),
  pre: ({
    className,
    __rawString__,
    ...props
  }: React.HTMLAttributes<HTMLPreElement> & {
    __rawString__?: string
  }) => {
    return (
      <>
        <pre
          className={cn(
            "mb-4 mt-6 max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-950 py-4 dark:bg-zinc-900",
            className,
          )}
          {...props}/>

        {__rawString__ && (
          <CopyButton
            className={cn("absolute right-4 top-4")}
            value={__rawString__}/>
        )}
      </>
    )
  },
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className,
      )}
      {...props}/>
  ),
  Step: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "font-heading mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}/>
  ),
  Steps: ({ ...props }) => (
    <div
      className={
        "[&>h3]:step steps mb-12 ml-4 border-l pl-8 [counter-reset:step]"
      }
      {...props}/>
  ),
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}/>
  ),
  Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
    <Tabs
      className={cn("relative mt-6 w-full", className)}
      {...props} />
  ),
  TabsList: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsList>) => (
    <TabsList
      className={cn(
        "w-full justify-start rounded-none border-b bg-transparent p-0",
        className,
      )}
      {...props}/>
  ),
  TabsTrigger: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsTrigger>) => (
    <TabsTrigger
      className={cn(
        "relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
        className,
      )}
      {...props}/>
  ),
  TabsContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsContent>) => (
    <TabsContent
      className={cn(
        "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-semibold",
        className,
      )}
      {...props}/>
  ),
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  ComponentPreview,
  Image,
  Callout,
}

const options: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      rehypeComponent,
      () => tree => {
        visit(tree, node => {
          if (node?.type === "element" && node?.tagName === "pre") {
            const [codeEl] = node.children
            if (codeEl.tagName !== "code") {
              return
            }
            node.__rawString__ = codeEl.children?.[0].value
          }
        })
      },
      [
        rehypePrettyCode,
        {
          keepBackground: false,
          theme: "github-dark-dimmed",
          onVisitLine(node) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }]
            }
          },
          onVisitHighlightedLine(node) {
            node.properties.className = ["line--highlighted"]
          },
          onVisitHighlightedChars(node) {
            node.properties.className = ["chars--highlighted"]
          },
        } satisfies RehypePrettyCodeOptions,
      ],
      () => tree => {
        visit(tree, node => {
          if (node?.type === "element" && node?.tagName === "figure") {
            if (!("data-rehype-pretty-code-figure" in node.properties)) {
              return
            }

            const preElement = node.children.at(-1)
            if (preElement.tagName !== "pre") {
              return
            }

            preElement.properties.__rawString__ = node.__rawString__
          }
        })
      },
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
  },
}

interface MdxProps {
  content: string
  className?: string
}

export function Mdx({ content, className }: MdxProps) {
  return (
    <div className={cn("mdx", className)}>
      <MDXRemote
        components={components}
        options={options}
        source={content} />
    </div>
  )
}
