import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewDisbursementDialog } from "../disbursement/NewDisbursementDialog";
import { calcDisbursement } from "@/utils/calcDisbursement";
import { ListTable, PlanCard } from "../disbursement/DisbursementHelper";
import { useProjects } from "@/hooks/project/useProjects";
import { useDisbursementPlans } from "@/hooks/disbursement/useDisbursementPlans";
import { useDisbursementRequests } from "@/hooks/disbursement/useDisbursementRequests";
import { DisbursementPlan } from "@/types/disbursement";
import { format } from "date-fns";
import { normalizePeriod } from "@/utils/period";

function makePlanFromRequests(projectId: string, periods: string[]): DisbursementPlan {
  return {
    id: Math.random().toString(36).slice(2),
    projectId,
    items: periods.sort().map((p, idx) => ({
      id: `pl-${idx + 1}`,
      period: normalizePeriod(p),
      plannedAmount: 0,
    })),
  };
}

function HeaderBar() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold break-words">Tài Chính · Kế hoạch & Giải Ngân</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lập kế hoạch theo tháng, sau đó nhập giải ngân thực tế và đánh dấu % hoàn thành.
        </p>
      </div>
      <div className="self-start sm:self-auto">
        <NewDisbursementDialog isOnlyProject={false} />
      </div>
    </div>
  );
}

export default function DisbursementPage() {
  const { requests, update: updateRequest, remove: removeRequest } = useDisbursementRequests();
  const { plans, add: addPlan, update: updatePlan } = useDisbursementPlans();
  const { projects } = useProjects();

  const requestPeriods = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => set.add(normalizePeriod(r.period)));
    return Array.from(set);
  }, [requests]);

  const actualByPeriod = useMemo(() => {
    const map: Record<string, number> = {};
    requests
      .filter((r) => r.status !== "REJECTED")
      .forEach((r) => {
        const totals = calcDisbursement(r.items, r.advanceDeduction);
        const period = normalizePeriod(r.period);
        map[period] = (map[period] || 0) + totals.payable * (r.completionPct / 100);
      });
    return map;
  }, [requests]);

  const effectivePlan = useMemo(() => {
    const planFromDb = plans.length > 0 ? plans[0] : null;

    if (planFromDb) {
      return {
        ...planFromDb,
        items: planFromDb.items.map((item) => ({
          ...item,
          period: normalizePeriod(item.period),
        })),
      };
    }

    if (!projects[0]?.id) return null;

    const pid = projects[0].id;
    if (requestPeriods.length > 0) {
      return makePlanFromRequests(pid, requestPeriods);
    }

    const d = new Date();
    const ym = (off: number) => normalizePeriod(format(new Date(d.getFullYear(), d.getMonth() + off, 1), "yyyy-MM"));
    return {
      id: Math.random().toString(36).slice(2),
      projectId: pid,
      items: [
        { id: "pl1", period: ym(0), plannedAmount: 300_000_000 },
        { id: "pl2", period: ym(1), plannedAmount: 400_000_000 },
        { id: "pl3", period: ym(2), plannedAmount: 300_000_000 },
      ],
    } satisfies DisbursementPlan;
  }, [plans, projects, requestPeriods]);

  return (
    <div className="grid gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
      <HeaderBar />

      <Tabs defaultValue="actual" className="grid gap-4 sm:gap-6">
        {/* TabsList: cho phép scroll ngang trên mobile */}
        <TabsList className="w-full overflow-x-auto whitespace-nowrap">
          <TabsTrigger className="shrink-0" value="plan">Kế hoạch</TabsTrigger>
          <TabsTrigger className="shrink-0" value="actual">Giải ngân thực tế</TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          {effectivePlan ? (
            <div className="overflow-x-auto">
              {/* Nếu PlanCard quá rộng, container này sẽ cho phép lướt ngang trên mobile */}
              <PlanCard
                isTask={false}
                plan={effectivePlan}
                actualByPeriod={actualByPeriod}
                onUpdatePlan={async (updated) => {
                  const seen = new Set<string>();
                  const dedupedItems = updated.items
                    .map((it) => ({ ...it, period: normalizePeriod(it.period) }))
                    .filter((it) => {
                      if (seen.has(it.period)) return false;
                      seen.add(it.period);
                      return true;
                    });

                  const cleaned: DisbursementPlan = { ...updated, items: dedupedItems };

                  if (plans.length > 0) {
                    await updatePlan(cleaned.id, cleaned);
                  } else {
                    const { id: _tmp, ...rest } = cleaned;
                    await addPlan(rest as Omit<DisbursementPlan, "id">);
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-muted-foreground">Chưa có dự án để hiển thị kế hoạch.</div>
          )}
        </TabsContent>

        <TabsContent value="actual">
          <Card className="shadow-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Đề Nghị Giải Ngân</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <ListTable
                  rows={requests}
                  onUpdate={(r) => updateRequest(r.id, r)}
                  onDelete={(id) => removeRequest(id)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
