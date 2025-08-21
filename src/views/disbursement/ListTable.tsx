import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DisbursementRequest } from "@/types/disbursement";
import { Project } from "@/types/project";
import { calcDisbursement } from "@/utils/calcDisbursement";
import { useToast } from "@/components/ui/use-toast";
import { useDisbursementRequests } from "@/hooks/disbursement/useDisbursementRequests";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export function ListTable({
    rows,
    onUpdate,
    projects,
}: {
    rows: DisbursementRequest[];
    onUpdate: (id: string, updated: Partial<DisbursementRequest>) => void;
    projects: Project[];
}) {
    const { remove } = useDisbursementRequests();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmitRequest(id: string) {
        setIsLoading(true);
        try {
            await onUpdate(id, { status: "SUBMITTED", submittedAt: new Date().toISOString() });
            toast({ title: "Success", description: "Request submitted successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
            console.error("Error submitting request:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDeleteRequest(id: string) {
        setIsLoading(true);
        try {
            await remove(id);
            toast({ title: "Success", description: "Request deleted successfully." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete request.", variant: "destructive" });
            console.error("Error deleting request:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Mã yêu cầu</TableHead>
                    <TableHead>Kỳ</TableHead>
                    <TableHead>Dự án</TableHead>
                    <TableHead>Gói thầu</TableHead>
                    <TableHead>Hành động</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Chưa có yêu cầu giải ngân.
                        </TableCell>
                    </TableRow>
                )}
                {rows.map((r) => {
                    const totals = calcDisbursement(r.items, r.advanceDeduction);
                    const pj = projects.find((p) => p.id === r.projectId);
                    return (
                        <TableRow key={r.id}>
                            <TableCell>{r.code}</TableCell>
                            <TableCell>{r.period}</TableCell>
                            <TableCell>{pj?.name ?? "—"}</TableCell>
                            <TableCell className="flex gap-2">
                                {r.status === "DRAFT" && (
                                    <>
                                        <Button size="sm" onClick={() => handleSubmitRequest(r.id)} disabled={isLoading}>
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            ) : (
                                                "Gửi duyệt"
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteRequest(r.id)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}