import { useState, useEffect } from "react";
import {
  Users, CalendarCheck, Receipt, FlaskConical, ArrowRight, Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { getPatients, getVisits, getInvoices, getLabOrders, getAuditEntries, isInPeriod, getOrgSettings } from "@/lib/store";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const periods = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Date" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [data, setData] = useState({ patients: 0, visits: 0, pendingBills: 0, labOrders: 0 });
  const [recentActivity, setRecentActivity] = useState<{ text: string; time: string }[]>([]);
  const [orgName, setOrgName] = useState("Sync Clinic");

  useEffect(() => {
    const org = getOrgSettings();
    if (org.name) setOrgName(org.name);

    const fromStr = customFrom?.toISOString();
    const toStr = customTo?.toISOString();

    const patients = getPatients().filter(p => isInPeriod(p.createdAt, period, fromStr, toStr));
    const visits = getVisits().filter(v => isInPeriod(v.createdAt, period, fromStr, toStr));
    const invoices = getInvoices().filter(i => isInPeriod(i.createdAt, period, fromStr, toStr));
    const pendingBills = invoices.filter(i => i.status !== "paid").length;
    const labs = getLabOrders().filter(l => isInPeriod(l.createdAt, period, fromStr, toStr));

    setData({ patients: patients.length, visits: visits.length, pendingBills, labOrders: labs.length });

    const audit = getAuditEntries().slice(0, 5).map(a => ({
      text: `${a.action} in ${a.module}: ${a.details}`,
      time: new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));
    setRecentActivity(audit.length ? audit : [{ text: "No recent activity", time: "" }]);
  }, [period, customFrom, customTo]);

  const stats = [
    { label: "Total Patients", value: data.patients.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10", path: "/patients" },
    { label: "Visits", value: data.visits.toString(), icon: CalendarCheck, color: "text-info", bg: "bg-info/10", path: "/visits" },
    { label: "Pending Bills", value: data.pendingBills.toString(), icon: Receipt, color: "text-warning", bg: "bg-warning/10", path: "/billing" },
    { label: "Lab Orders", value: data.labOrders.toString(), icon: FlaskConical, color: "text-success", bg: "bg-success/10", path: "/laboratory" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Welcome to {orgName}. Here's your overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {period === "custom" && (
            <div className="flex items-center gap-2 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 text-xs w-[130px] justify-start", !customFrom && "text-muted-foreground")}>
                    {customFrom ? format(customFrom, "dd MMM yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customFrom}
                    onSelect={setCustomFrom}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-xs text-muted-foreground">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 text-xs w-[130px] justify-start", !customTo && "text-muted-foreground")}>
                    {customTo ? format(customTo, "dd MMM yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customTo}
                    onSelect={setCustomTo}
                    disabled={(date) => customFrom ? date < customFrom : false}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.path}
              className="group rounded-xl border border-border bg-card p-3 sm:p-5 stat-card-shadow hover:metric-glow transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-card-foreground mt-1 sm:mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} rounded-lg p-1.5 sm:p-2.5`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground">
                <span>View details</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-card-foreground mb-3 sm:mb-4">Recent Activity</h2>
          <div className="space-y-2 sm:space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground py-1.5 sm:py-2">
                <div className="h-2 w-2 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                <span className="flex-1 break-words">{item.text}</span>
                {item.time && <span className="ml-auto text-[10px] sm:text-xs shrink-0">{item.time}</span>}
              </div>
            ))}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border">
            Activity will appear here once you start using the system.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-sm sm:text-base font-semibold text-card-foreground mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { label: "Register Patient", path: "/patients/register", icon: Users },
              { label: "New Visit", path: "/visits", icon: CalendarCheck },
              { label: "Create Invoice", path: "/billing", icon: Receipt },
              { label: "Order Lab Test", path: "/laboratory", icon: FlaskConical },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.path}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border border-border bg-secondary/50 p-3 sm:p-4 text-center hover:bg-accent transition-colors"
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-[10px] sm:text-xs font-medium text-secondary-foreground">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
