import { useMilestones } from "@/hooks/project/useMilestones";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "react-day-picker";
import { Label } from "recharts";

export function MilestoneSelector({ projectId, contractId, setContractId }: {
    projectId: string;
    contractId: string;
    setContractId: (id: string) => void
}) {
    const { milestones, addMilestone, updateMilestone, deleteMilestone } = useMilestones(projectId);

    return (
        <div>
            <Label>Mốc quan trọng</Label>
            <div className="flex gap-2 items-center mt-1">
                <Select value={contractId} onValueChange={setContractId}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Chọn mốc" />
                    </SelectTrigger>
                    <SelectContent>
                        {milestones.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                                {m.milestioneName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Nút thêm */}
                <Button
                    onClick={() => {
                        const name = prompt("Tên mốc mới:");
                        if (!name) return;
                        addMilestone({ id: Math.random().toString(36).slice(2), milestioneName: name });
                    }}
                >
                    <Plus className="w-4 h-4 mr-1" /> Thêm
                </Button>

                {/* Nút sửa */}
                <Button
                    disabled={!contractId}
                    onClick={() => {
                        const current = milestones.find(m => m.id === contractId);
                        if (!current) return;
                        const name = prompt("Sửa tên mốc:", current.milestioneName);
                        if (!name) return;
                        updateMilestone({ ...current, milestioneName: name });
                    }}
                >
                    ✏️ Sửa
                </Button>

                {/* Nút xóa */}
                <Button
                    disabled={!contractId}
                    onClick={() => {
                        if (confirm("Bạn có chắc muốn xóa mốc này?")) {
                            deleteMilestone(contractId);
                            setContractId("");
                        }
                    }}
                >
                    <Trash2 className="w-4 h-4" /> Xóa
                </Button>
            </div>
        </div>
    );
}
