import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Send, ReceiptText, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { BaseDisbursementPlan, DisbursementPlan, DisbursementRequest, PlanItem } from "@/types/disbursement";
import { calcDisbursement } from "@/utils/calcDisbursement";
import { formatMoney } from "@/utils/formatMoney";
import { Project } from "@/types/project";
import { useProjects } from "@/hooks/project/useProjects";
// PLAN VIEW
export function PlanCard({
  isTask,
  plan,
  actualByPeriod,
  onUpdatePlan,
  budget,
}: {
  project?: Project;
  budget?: number;
  isTask: boolean;
  plan: DisbursementPlan;
  actualByPeriod: Record<string, number>;
  onUpdatePlan: (p: BaseDisbursementPlan) => void;
}) {
  const totalPlan = plan.items.reduce((s, i) => s + i.plannedAmount, 0);
  const totalActual = plan.items.reduce((s, i) => s + (actualByPeriod[i.period] || 0), 0);
  const pctTotal = totalPlan ? Math.round((totalActual / totalPlan) * 100) : 0;

  function addRow() {
    const existing = new Set(plan.items.map(i => i.period));

    const d = new Date();
    let ym = format(d, "yyyy-MM");
    while (existing.has(ym)) {
      d.setMonth(d.getMonth() + 1);
      ym = format(d, "yyyy-MM");
    }

    const actual = actualByPeriod[ym] || 0;

    const newItem: PlanItem = {
      id: Math.random().toString(36).slice(2),
      period: ym,
      plannedAmount: actual,
    };

    onUpdatePlan({
      ...plan,
      items: [...plan.items, newItem],
    });
  }


  function update(idx: number, patch: Partial<PlanItem>) {
    const items = [...plan.items]; items[idx] = { ...items[idx], ...patch } as PlanItem; onUpdatePlan({ ...plan, items });
  }
  function remove(idx: number) { onUpdatePlan({ ...plan, items: plan.items.filter((_, i) => i !== idx) }); }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Kế hoạch giải ngân theo tháng</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <Button size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1" />Thêm kế hoạch</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tháng</TableHead>
              <TableHead className="text-right">Kế hoạch</TableHead>
              <TableHead className="text-right">Thực hiện (VNĐ)</TableHead>
              <TableHead className="text-right">(%) Hoàn thiện so kế hoạch</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plan.items.map((it, idx) => {
              const act = actualByPeriod[it.period] || 0;
              const pct = it.plannedAmount ? Math.min(100, Math.round(act / it.plannedAmount * 100)) : 0;
              return (
                <TableRow key={it.id}>
                  <TableCell className="flex items-center gap-2"><Calendar className="w-4 h-4" />{it.period}
                    <Input className="ml-3 w-36" value={it.period} onChange={e => update(idx, { period: e.target.value })} />
                  </TableCell>
                  <TableCell className="text-right"><Input className="w-44 ml-auto text-right" type="number" value={it.plannedAmount} onChange={e => update(idx, { plannedAmount: Number(e.target.value) || 0 })} /></TableCell>
                  <TableCell className="text-right">{formatMoney(act)} VNĐ</TableCell>
                  <TableCell className="text-right w-56">
                    <div className="flex flex-col gap-1">
                      <Progress value={pct} />
                      <div className="text-xs text-muted-foreground text-right">{pct}%</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => remove(idx)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              );
            })}
            {plan.items.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Chưa có dòng kế hoạch.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className={`grid gap-4 ${isTask && budget !== undefined ? "grid-cols-4" : "grid-cols-3"}`}>
          {isTask && budget !== undefined && (
            <Stat label="Ngân sách ban đầu " value={`${formatMoney(budget)} VNĐ`} muted={true} />
          )}
          <Stat label="Tổng kế hoạch" value={`${formatMoney(totalPlan)} VNĐ`} />
          <Stat label="Tổng thực hiện " value={`${formatMoney(totalActual)} VNĐ`} />
          <Stat label="Tỷ lệ hoàn thành KH" value={`${pctTotal}%`} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, muted = false }: { muted?: boolean; label: string; value: string }) {
  return (
    <Card className={muted ? "bg-muted/80" : "bg-muted/30"}>
      <CardContent className="p-4">
        <div className="text-muted-foreground text-sm">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

// LIST (ACTUAL)
function StatusBadge({ s }: { s: DisbursementRequest["status"] }) {
  return <Badge variant={s === "APPROVED" ? "outline" : s === "PAID" ? "destructive" : "secondary"}>{s}</Badge>;
}

export function ListTable({
  rows,
  onUpdate,
  onEdit,
  onDelete
}: {
  rows: DisbursementRequest[];
  onUpdate: (r: DisbursementRequest) => void;
  onEdit?: (r: DisbursementRequest) => void;
  onDelete?: (id: string, r?: DisbursementRequest) => void;
}) {

  const { projects, getById } = useProjects();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã</TableHead>
          <TableHead>Tháng</TableHead>
          <TableHead>Dự án</TableHead>
          <TableHead>Mốc quan trọng</TableHead>
          <TableHead>Đề nghị</TableHead>
          <TableHead>Phải trả</TableHead>
          <TableHead>% hoàn thành</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">Chưa có đề nghị.</TableCell>
          </TableRow>
        )}
        {rows.map((r) => {
          const base = calcDisbursement(r.items, r.advanceDeduction);
          const factor = (r.completionPct ?? 100) / 100;

          const totals = {
            requested: base.requested * factor,
            tax: base.tax * factor,
            retention: base.retention * factor,
            payable: base.payable * factor,
          };

          return (
            <TableRow key={r.id}>
              <TableCell>{r.code}</TableCell>
              <TableCell>{r.period}</TableCell>
              <TableCell>{getById(r.projectId)?.name ?? "—"}</TableCell>

              <TableCell>
                {Array.isArray(r.milestones)
                  ? (r.milestones[0]?.milestioneName ?? "_")
                  : (r as any).milestones?.milestioneName ?? "_"}
              </TableCell>

              <TableCell>{formatMoney(totals.requested)} VNĐ</TableCell>
              <TableCell className="font-medium">{formatMoney(totals.payable)} VNĐ</TableCell>

              <TableCell>
                <div className="min-w-40">
                  <Progress value={r.completionPct} />
                  <div className="text-xs text-muted-foreground">{r.completionPct}%</div>
                </div>
              </TableCell>

              <TableCell><StatusBadge s={r.status} /></TableCell>

              {/* chỉ còn XÓA */}
              <TableCell className="text-right space-x-2">
                {r.status === "DRAFT" && (
                  <Button size="sm" onClick={() => onUpdate({ ...r, status: "SUBMITTED", submittedAt: new Date().toISOString() })}>
                    <Send className="w-4 h-4 mr-1" />Gửi duyệt
                  </Button>
                )}
                {r.status === "APPROVED" && (
                  <Button size="sm">
                    <ReceiptText className="w-4 h-4 mr-1" />Tạo lệnh chi
                  </Button>
                )}
                {r.status === "PAYMENT_ORDERED" && (
                  <Button size="sm">
                    <DollarSign className="w-4 h-4 mr-1" />Đánh dấu đã chi
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  title="Xóa"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Xóa đề nghị ${r.code}?`)) onDelete(r.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}

      </TableBody>
    </Table>
  );
}




