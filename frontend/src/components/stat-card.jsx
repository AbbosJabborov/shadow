import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({ label, value, icon: Icon, description }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="size-3.5 shrink-0" />
          <span className="truncate">{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}
