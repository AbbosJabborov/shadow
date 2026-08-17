import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BUSINESSES, SECTORS } from "@/lib/businesses"
import { formatDate } from "@/lib/format"
import { REGIONS } from "@/lib/regions"
import { STATUS_BADGE, TIER_VARIANT } from "@/lib/risk"

const PAGE_SIZE = 10

const RISK_ITEMS = [
  { value: "all", label: "All Risk Tiers" },
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "Elevated", label: "Elevated" },
  { value: "Critical", label: "Critical" },
]

export default function BusinessesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")
  const [regionFilter, setRegionFilter] = useState(searchParams.get("region") ?? "all")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [page, setPage] = useState(1)

  const regionItems = useMemo(
    () => [
      { value: "all", label: "All Regions" },
      ...REGIONS.map((r) => ({ value: r.id, label: r.name })),
    ],
    []
  )
  const sectorItems = useMemo(
    () => [
      { value: "all", label: "All Sectors" },
      ...SECTORS.map((s) => ({ value: s, label: s })),
    ],
    []
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return BUSINESSES.filter((business) => {
      if (regionFilter !== "all" && business.regionId !== regionFilter) return false
      if (sectorFilter !== "all" && business.sector !== sectorFilter) return false
      if (riskFilter !== "all" && business.baselineRisk !== riskFilter) return false
      if (q && !business.name.toLowerCase().includes(q) && !business.stir.includes(q)) {
        return false
      }
      return true
    })
  }, [search, regionFilter, sectorFilter, riskFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateRegion(value) {
    setRegionFilter(value)
    setPage(1)
    setSearchParams(value === "all" ? {} : { region: value })
  }

  const selectedRegion = REGIONS.find((r) => r.id === regionFilter)

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Business Registry
        </h1>
        <p className="text-sm text-muted-foreground">
          {selectedRegion
            ? `Showing MCHJ entities registered in ${selectedRegion.name}.`
            : "All monitored MCHJ entities across every region."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Businesses</CardTitle>
          <CardDescription>
            {filtered.length} of {BUSINESSES.length} entities
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <InputGroup className="sm:w-64">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search by name or STIR"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </InputGroup>

            <Select items={regionItems} value={regionFilter} onValueChange={updateRegion}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {regionItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              items={sectorItems}
              value={sectorFilter}
              onValueChange={(value) => {
                setSectorFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {sectorItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              items={RISK_ITEMS}
              value={riskFilter}
              onValueChange={(value) => {
                setRiskFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {RISK_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Baseline Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((business) => {
                const region = REGIONS.find((r) => r.id === business.regionId)
                return (
                  <TableRow key={business.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-left whitespace-normal"
                        render={<Link to={`/businesses/${business.id}`} />}
                        nativeButton={false}
                      >
                        {business.name} MCHJ
                      </Button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{region?.name}</TableCell>
                    <TableCell className="text-muted-foreground">{business.sector}</TableCell>
                    <TableCell className="tabular-nums">{business.employees}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(business.registered)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[business.status]}>{business.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={TIER_VARIANT[business.baselineRisk]}>
                        {business.baselineRisk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No businesses match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.max(1, p - 1))
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink
                      href="#"
                      isActive={n === currentPage}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(n)
                      }}
                    >
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={
                      currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                    }
                    onClick={(e) => {
                      e.preventDefault()
                      setPage((p) => Math.min(totalPages, p + 1))
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
