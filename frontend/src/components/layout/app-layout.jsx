import { Fragment } from "react"
import { Link, Outlet, useLocation, useParams } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { getBusiness } from "@/lib/businesses"
import { getRegion } from "@/lib/regions"

function useBreadcrumbs() {
  const { pathname } = useLocation()
  const params = useParams()
  const segments = pathname.split("/").filter(Boolean)

  if (segments[0] === "regions" && segments[1]) {
    const region = getRegion(params.id)
    return [{ label: "Dashboard", to: "/dashboard" }, { label: region?.name ?? "Region" }]
  }

  if (segments[0] === "businesses" && segments[1]) {
    const business = getBusiness(params.id)
    return [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Businesses", to: "/businesses" },
      { label: business?.name ?? "Business" },
    ]
  }

  if (segments[0] === "businesses") {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "Businesses" }]
  }

  if (segments[0] === "methodology") {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "AI & Methodology" }]
  }

  if (segments[0] === "analytics" || segments[0] === "graph") {
    return [{ label: "Dashboard", to: "/dashboard" }, { label: "Analytics & Graph" }]
  }

  return [{ label: "Dashboard" }]
}

export function AppLayout() {
  const crumbs = useBreadcrumbs()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative">
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => (
                <Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem>
                    {crumb.to ? (
                      <BreadcrumbLink render={<Link to={crumb.to} />}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < crumbs.length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="relative z-10 flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

