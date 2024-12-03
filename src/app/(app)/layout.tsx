import { AppSidebar } from "~/components/app-sidebar"
import { SiteFooter } from "~/components/site-footer"
import { SiteHeader } from "~/components/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider
      className={"border-border/40 dark:border-border"}
      data-wrapper={""}>
      <div
        className={
          "mx-auto w-full border-border/40 dark:border-border min-[1800px]:max-w-[1536px] min-[1800px]:border-x"
        }>
        <SiteHeader />

        <SidebarInset
          className={
            "flex-1 items-start md:grid md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] md:gap-6 lg:gap-10 min-h-[calc(100vh-4rem)]"
          }>
          <AppSidebar />

          {children}
        </SidebarInset>

        <SiteFooter />
      </div>
    </SidebarProvider>
  )
}
