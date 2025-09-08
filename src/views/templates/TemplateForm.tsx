import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProjectTemplate, ProjectPhase } from "@/types/project"

interface TemplateFormProps {
  open: boolean
  onClose: () => void
  onSave: (tpl: Omit<ProjectTemplate, "id">) => void
}

export function TemplateForm({ open, onClose, onSave }: TemplateFormProps) {
  const [name, setName] = useState("")
  const [phasesCount, setPhasesCount] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const phases: ProjectPhase[] = Array.from(
  { length: phasesCount },
  (_, idx) => ({
    id: `phase-${Date.now()}-${idx}`, // 👈 Luôn có id
    name: `Giai đoạn ${idx + 1}`,
    description: "",
    tasks: [],
    order: idx + 1,
    status: "not_started",
    startDate: "",
    endDate: "",
    legalBasis: "",
    documentProjectPhase: [],
  })
)


    onSave({
      name,
      description: "",  // thêm cho đúng type
      category: "",     // thêm cho đúng type
      phases,
    })

    setName("")
    setPhasesCount(1)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Mẫu Mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên mẫu</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên mẫu dự án"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phasesCount">Số giai đoạn</Label>
            <Input
              id="phasesCount"
              type="number"
              min={1}
              value={phasesCount}
              onChange={(e) => setPhasesCount(parseInt(e.target.value))}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
