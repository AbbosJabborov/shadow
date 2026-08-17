import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatCard({ label, value, icon: Icon, description, colorScheme = "blue", badge }) {
  const schemeClasses = {
    blue: {
      border: "border-sky-500/20 hover:border-sky-500/40",
      bg: "bg-sky-500/5",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      valueColor: "text-sky-950 dark:text-sky-100",
    },
    green: {
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      bg: "bg-emerald-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      valueColor: "text-emerald-950 dark:text-emerald-100",
    },
    rose: {
      border: "border-rose-500/20 hover:border-rose-500/40",
      bg: "bg-rose-500/5",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      valueColor: "text-rose-950 dark:text-rose-100",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/40",
      bg: "bg-amber-500/5",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      valueColor: "text-amber-950 dark:text-amber-100",
    },
  }[colorScheme] || {
    border: "border-border",
    bg: "bg-card",
    iconBg: "bg-muted text-muted-foreground border-border",
    valueColor: "text-foreground",
  }

  return (
    <Card className={`transition-all duration-200 border ${schemeClasses.border} ${schemeClasses.bg}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className={`p-2 rounded-lg border ${schemeClasses.iconBg}`}>
            <Icon className="size-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${schemeClasses.valueColor}`}>
            {value}
          </div>
          {badge && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-background/80 border font-medium">
              {badge}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          {description}
        </div>
      </CardContent>
    </Card>
  )
}
