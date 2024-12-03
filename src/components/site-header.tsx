"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { GithubLink } from "./github-link"
import { Icons } from "./icon"
import { ThemeToggle } from "./theme-toggle"
import { SidebarTrigger } from "./ui/sidebar"
import { siteConfig } from "~/config/site"

export function SiteHeader() {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={
        "sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur data-[sticky=true]:shadow-md supports-[backdrop-filter]:bg-background/60 dark:border-border"
      }
      data-sticky={isSticky}>
      <div className={"flex h-16 items-center justify-between px-3"}>
        <div className={"mr-4 flex items-center gap-2 lg:mr-6"}>
          <SidebarTrigger className={"mr-1 md:hidden"} />

          <Link
            className={"items-center gap-2 font-bold hidden md:flex"}
            href={"https://ui.shadcn.com/"}
            referrerPolicy={"no-referrer"}>
            <Icons.logo className={"h-6 w-6"} />

            {"Shadcn"}
          </Link>

          <Link
            className={"max-md:font-bold md:text-sm md:text-muted-foreground"}
            href={"/"}>
            {siteConfig.name}
          </Link>
        </div>

        <div className={"flex items-center gap-3"}>
          <GithubLink />

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
