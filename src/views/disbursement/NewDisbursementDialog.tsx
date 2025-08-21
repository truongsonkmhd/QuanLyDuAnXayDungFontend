import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { DisbursementItem, DisbursementRequest } from "@/types/disbursement";
import { calcDisbursement } from "@/utils/calcDisbursement";
import { useProjects } from "@/hooks/project/useProjects";
import { useDisbursementRequests } from "@/hooks/disbursement/useDisbursementRequests";
import { milestone, Project } from "@/types/project";
import { useMilestones } from "@/hooks/project/useMilestones";

function newItem(): DisbursementItem {
    return { id: Math.random().toString(36).slice(2), description: "", amount: 0, taxRate: 8 };
}

interface NewDisbursementDialogProps {
    isOnlyProject?: boolean;
    project?: Project;
}

export function NewDisbursementDialog({ isOnlyProject, project }: NewDisbursementDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [contractId, setContractId] = useState<string>("");
    const [period, setPeriod] = useState<string>(format(new Date(), "yyyy-MM"));
    const [items, setItems] = useState<DisbursementItem[]>([newItem()]);
    const [note, setNote] = useState("");
    const [advance, setAdvance] = useState(0);
    const [completionPct, setCompletionPct] = useState<number>(100);
    const [newMilestoneName, setNewMilestoneName] = useState<string>("");

    const { add } = useDisbursementRequests();
    const { projects, getById } = useProjects();
    const [projectId, setProjectId] = useState<string>(isOnlyProject && project ? project.id : projects[0]?.id ?? "");
    const { milestones, loading: milestonesLoading, addMilestone, deleteMilestone } = useMilestones(projectId);

    const totals = useMemo(() => {
        const base = calcDisbursement(items, advance);
        const factor = completionPct / 100;
        return {
            requested: base.requested * factor,
            tax: base.tax * factor,
            retention: base.retention * factor,
            payable: base.payable * factor,
        };
    }, [items, advance, completionPct]);

    useEffect(() => {
        if (!projectId && projects.length && !isOnlyProject) {
            setProjectId(projects[0].id);
        }
        // Reset contractId when projectId changes to ensure milestone selection is valid
        setContractId("");
    }, [projects, projectId, isOnlyProject]);

    function reset() {
        setStep(1);
        setProjectId(isOnlyProject && project ? project.id : projects[0]?.id ?? "");
        setContractId("");
        setPeriod(format(new Date(), "yyyy-MM"));
        setItems([newItem()]);
        setNote("");
        setAdvance(0);
        setCompletionPct(100);
        setNewMilestoneName("");
    }


    async function create() {
        const selectedMilestone = milestones.find(m => m.id === contractId);
        const code = `DN-${format(new Date(), "yyMMdd-HHmm")}`;
        const newRequest: Omit<DisbursementRequest, "id"> = {
            code,
            projectId,
            period,
            items,
            note,
            milestones: selectedMilestone, // Include selected milestone if it exists
            advanceDeduction: advance,
            completionPct,
            status: "DRAFT",
        };
        try {
            await add(newRequest);
            setOpen(false);
            reset();
        } catch (error) {
            console.error("Lỗi khi lưu đề nghị giải ngân:", error);
        }
    }

    async function handleAddMilestone() {
        if (newMilestoneName.trim() && projectId) {
            const newMilestone: milestone = {
                id: Math.random().toString(36).slice(2),
                milestioneName: newMilestoneName.trim(), // Note: Retaining typo 'milestioneName' to match provided interface
            };
            await addMilestone(newMilestone);
            setNewMilestoneName("");
            setContractId(newMilestone.id);
        }
    }

    async function handleDeleteMilestone(id: string) {
        if (projectId) {
            await deleteMilestone(id);
            if (contractId === id) {
                setContractId("");
            }
        }
    }

    function renderDialog() {
        return (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
                <DialogTrigger asChild>
                    <Button className="rounded-2xl"><Plus className="w-4 h-4 mr-1" />Thêm giải ngân</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Tạo Đề Nghị Giải Ngân</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 grid gap-6">
                        <Stepper step={step} setStep={setStep} />
                        {step === 1 && (
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {isOnlyProject && project ? (
                                        <div>
                                            <Label>Dự án</Label>
                                            <Input
                                                className="mt-1"
                                                value={project.name}
                                                readOnly
                                                disabled
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <Label>Dự án</Label>
                                            <Select value={projectId} onValueChange={(v) => setProjectId(v)}>
                                                <SelectTrigger className="mt-1"><SelectValue placeholder="Chọn dự án" /></SelectTrigger>
                                                <SelectContent>
                                                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div>
                                        <Label>Tháng</Label>
                                        <Input className="mt-1" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="YYYY-MM" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Mốc quan trọng</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Select value={contractId} onValueChange={setContractId}>
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder={milestonesLoading ? "Đang tải..." : "Chọn mốc"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {milestones.map(m => (
                                                        <div key={m.id} className="flex items-center justify-between px-2">
                                                            <SelectItem value={m.id}>{m.milestioneName}</SelectItem>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteMilestone(m.id)}
                                                                disabled={milestonesLoading}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Tên mốc mới"
                                                    value={newMilestoneName}
                                                    onChange={(e) => setNewMilestoneName(e.target.value)}
                                                    className="w-40"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={handleAddMilestone}
                                                    disabled={!newMilestoneName.trim() || milestonesLoading}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label>Ghi chú</Label>
                                    <Input className="mt-1" value={note} onChange={e => setNote(e.target.value)} placeholder="Ví dụ: Nghiệm thu đợt 1" />
                                </div>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="grid gap-4">
                                <ItemsEditor items={items} setItems={setItems} />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Khấu trừ tạm ứng</Label>
                                        <Input type="number" className="mt-1" value={advance} onChange={e => setAdvance(Number(e.target.value) || 0)} />
                                    </div>
                                    <div>
                                        <Label>% Hoàn thành cho kỳ này</Label>
                                        <div className="mt-3">
                                            <Slider defaultValue={[completionPct]} value={[completionPct]} onValueChange={(v) => setCompletionPct(v[0])} max={100} step={5} />
                                            <div className="text-xs text-muted-foreground text-right mt-1">{completionPct}%</div>
                                        </div>
                                    </div>
                                </div>
                                <TotalsCard totals={totals} />
                            </div>
                        )}
                        {step === 3 && (
                            <div className="grid gap-3">
                                <div className="border-dashed border rounded-xl p-6 text-center">Khu vực upload chứng từ</div>
                                <TotalsCard totals={totals} compact />
                            </div>
                        )}
                    </div>
                    <DialogFooter className="justify-between">
                        <div className="text-sm text-muted-foreground">Bước {step}/3</div>
                        <div className="space-x-2">
                            {step > 1 && <Button variant="outline" onClick={() => setStep((s) => (s - 1) as any)}>Quay lại</Button>}
                            {step < 3 && <Button onClick={() => setStep((s) => (s + 1) as any)}>Tiếp tục</Button>}
                            {step === 3 && <Button onClick={create}><CheckCircle2 className="w-4 h-4 mr-1" />Tạo bản nháp</Button>}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return renderDialog();
}

function ItemsEditor({ items, setItems }: { items: DisbursementItem[]; setItems: (i: DisbursementItem[]) => void }) {
    function update(idx: number, patch: Partial<DisbursementItem>) {
        const clone = [...items];
        clone[idx] = { ...clone[idx], ...patch } as DisbursementItem;
        setItems(clone);
    }
    function add() { setItems([...items, newItem()]); }
    function remove(idx: number) { setItems(items.filter((_, i) => i !== idx)); }

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label>Chi tiết hạng mục</Label>
                <Button size="sm" onClick={add}><Plus className="w-4 h-4 mr-1" />Thêm dòng</Button>
            </div>
            <div className="grid gap-2">
                {items.map((it, idx) => (
                    <div key={it.id} className="grid grid-cols-12 gap-2 items-center border rounded-xl p-3">
                        <Input className="col-span-5" placeholder="Mô tả" value={it.description} onChange={e => update(idx, { description: e.target.value })} />
                        <Input className="col-span-3" type="number" placeholder="Giá trị (trước thuế)" value={it.amount} onChange={e => update(idx, { amount: Number(e.target.value) || 0 })} />
                        <div className="col-span-3 flex items-center gap-2">
                            <Input type="number" placeholder="Thuế %" value={it.taxRate} onChange={e => update(idx, { taxRate: Number(e.target.value) || 0 })} />
                            <span className="text-sm text-muted-foreground">VAT %</span>
                        </div>
                        <Button variant="ghost" size="icon" className="col-span-1" onClick={() => remove(idx)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Stepper({ step, setStep }: { step: 1 | 2 | 3; setStep: (s: 1 | 2 | 3) => void }) {
    return (
        <Tabs value={String(step)} onValueChange={(v) => setStep(Number(v) as 1 | 2 | 3)}>
            <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="1">1. Thông tin</TabsTrigger>
                <TabsTrigger value="2">2. Chi tiết</TabsTrigger>
                <TabsTrigger value="3">3. Chứng từ</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}

function TotalsCard({ totals, compact }: { totals: { requested: number; tax: number; retention: number; payable: number }; compact?: boolean }) {
    const pct = totals.requested ? Math.max(0, Math.min(100, Math.round((totals.payable / totals.requested) * 100))) : 0;
    return (
        <Card className="bg-muted/30">
            <CardContent className="p-4">
                <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-sm`}>
                    <div><div className="text-muted-foreground">Giá trị đề nghị</div><div className="text-lg font-semibold">{fmt(totals.requested)} đ</div></div>
                    <div><div className="text-muted-foreground">Thuế VAT</div><div className="text-lg font-semibold">{fmt(totals.tax)} đ</div></div>
                    {!compact && <div><div className="text-muted-foreground">Retention</div><div className="text-lg font-semibold">{fmt(totals.retention)} đ</div></div>}
                    <div><div className="text-muted-foreground">Phải trả</div><div className="text-lg font-semibold">{fmt(totals.payable)} đ</div></div>
                </div>
                {!compact && (
                    <div className="mt-3">
                        <Progress value={pct} />
                        <div className="mt-1 text-xs text-muted-foreground">Phải trả / Đã yêu cầu: {pct}%</div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function fmt(n: number) {
    return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n || 0);
}