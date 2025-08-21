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
      period: normalizePeriod(p), // Chuẩn hóa period ngay từ đầu
      plannedAmount: 0, // Mặc định 0 để người dùng nhập
    })),
  };
}

function HeaderBar() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Tài Chính · Kế hoạch & Giải Ngân</h1>
        <p className="text-sm text-muted-foreground">
          Lập kế hoạch theo tháng, sau đó nhập giải ngân thực tế và đánh dấu % hoàn thành.
        </p>
      </div>
      <NewDisbursementDialog isOnlyProject={false} />
    </div>
  );
}

export default function DisbursementPage() {
  const { requests, update: updateRequest, remove: removeRequest } = useDisbursementRequests();
  const { plans, add: addPlan, update: updatePlan } = useDisbursementPlans();
  const { projects } = useProjects();

  // Chuẩn hóa periods từ requests
  const requestPeriods = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => set.add(normalizePeriod(r.period)));
    return Array.from(set);
  }, [requests]);

  // Tính actualByPeriod với period chuẩn hóa
  const actualByPeriod = useMemo(() => {
    const map: Record<string, number> = {};
    requests
      .filter((r) => r.status !== "REJECTED")
      .forEach((r) => {
        const totals = calcDisbursement(r.items, r.advanceDeduction);
        const period = normalizePeriod(r.period); // Chuẩn hóa period
        map[period] = (map[period] || 0) + totals.payable * (r.completionPct / 100);
      });
    return map;
  }, [requests]);

  // Lấy plan từ DB hoặc tạo fallback
  const effectivePlan = useMemo(() => {
    const planFromDb = plans.length > 0 ? plans[0] : null;

    if (planFromDb) {
      // Chuẩn hóa periods trong plan từ DB
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

    // Fallback nếu không có request
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
    <div className="p-6 grid gap-6">
      <HeaderBar />

      <Tabs defaultValue="actual" className="grid gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="plan">Kế hoạch</TabsTrigger>
          <TabsTrigger value="actual">Giải ngân thực tế</TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          {effectivePlan ? (
            <PlanCard
              isTask={false}
              plan={effectivePlan}
              actualByPeriod={actualByPeriod}
              onUpdatePlan={async (updated) => {
                // Chuẩn hóa và loại bỏ trùng period
                const seen = new Set<string>();
                const dedupedItems = updated.items
                  .map((it) => ({
                    ...it,
                    period: normalizePeriod(it.period), // Chuẩn hóa period
                  }))
                  .filter((it) => {
                    if (seen.has(it.period)) return false;
                    seen.add(it.period);
                    return true;
                  });

                const cleaned: DisbursementPlan = { ...updated, items: dedupedItems };

                if (plans.length > 0) {
                  await updatePlan(cleaned.id, cleaned); // Cập nhật plan trong Firebase
                } else {
                  const { id: _tmp, ...rest } = cleaned;
                  await addPlan(rest as Omit<DisbursementPlan, "id">); // Tạo mới plan
                }
              }}
            />
          ) : (
            <div className="text-muted-foreground">Chưa có dự án để hiển thị kế hoạch.</div>
          )}
        </TabsContent>

        <TabsContent value="actual">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Đề Nghị Giải Ngân</CardTitle>
            </CardHeader>
            <CardContent>
              <ListTable
                rows={requests}
                onUpdate={(r) => updateRequest(r.id, r)}
                onDelete={(id) => removeRequest(id)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}