// src/views/templates/PhaseDetailDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ProjectPhase } from "@/types/project"
import { useState, useEffect } from "react"

interface PhaseDetailDialogProps {
  open: boolean
  phase: ProjectPhase | null
  onClose: () => void
  onSave: (phase: ProjectPhase) => void
}

export function PhaseDetailDialog({ open, phase, onClose, onSave }: PhaseDetailDialogProps) {
  const [formData, setFormData] = useState<ProjectPhase>({
    id: `phase-${Date.now()}`,
    name: "",
    description: "",
    order: 1,
    status: "not_started",
    startDate: "",
    endDate: "",
    legalBasis: "",
    tasks: [],
    documentProjectPhase: []
  })

  useEffect(() => {
    if (phase) setFormData(phase)
  }, [phase])

  const handleChange = (field: keyof ProjectPhase, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết giai đoạn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tên giai đoạn</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nhập tên giai đoạn"
            />
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Mô tả chi tiết"
            />
          </div>

          <div className="space-y-2">
            <Label>Cơ sở pháp lý</Label>
            <Input
              value={formData.legalBasis}
              onChange={(e) => handleChange("legalBasis", e.target.value)}
              placeholder="Nhập cơ sở pháp lý"
            />
          </div>

          <div className="space-y-2">
            <Label>Ngày bắt đầu</Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Ngày kết thúc</Label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSave(formData)}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
