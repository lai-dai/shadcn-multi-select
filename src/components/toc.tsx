"use client"

import * as React from "react"

import { type TableOfContents } from "~/lib/toc"
import { cn } from "~/lib/utils"

interface TocProps {
  toc: TableOfContents
}

export function DashboardTableOfContents({ toc }: TocProps) {
  const itemIds = React.useMemo(
    () =>
      toc.items
        ? toc.items
            .flatMap(item => [item.url, item?.items?.map(item => item.url)])
            .flat()
            .filter(Boolean)
            .map(id => id?.split("#")[1])
        : [],
    [toc],
  )
  const activeHeading = useActiveItem(itemIds as string[])

  if (!toc?.items?.length) {
    return null
  }

  return (
    <div className={"space-y-2"}>
      <p className={"font-medium"}>{"On This Page"}</p>

      <Tree
        activeItem={activeHeading}
        tree={toc} />
    </div>
  )
}

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string>()

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: `0% 0% -80% 0%` },
    )

    itemIds?.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      itemIds?.forEach(id => {
        const element = document.getElementById(id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [itemIds])

  return activeId
}

interface TreeProps {
  tree: TableOfContents
  level?: number
  activeItem?: string
}

function Tree({ tree, level = 1, activeItem }: TreeProps) {
  return tree?.items?.length && level < 3 ? (
    <ul className={cn("m-0 list-none", { "pl-4": level !== 1 })}>
      {tree.items.map((item, index) => {
        return (
          <li
            className={cn("mt-0 pt-2")}
            key={index}>
            <a
              className={cn(
                "inline-block no-underline transition-colors hover:text-foreground",
                item.url === `#${activeItem}`
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
              href={item.url}>
              {item.title}
            </a>

            {item.items?.length ? (
              <Tree
                activeItem={activeItem}
                level={level + 1}
                tree={item} />
            ) : null}
          </li>
        )
      })}
    </ul>
  ) : null
}
