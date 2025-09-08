// src/views/pages/TemplatesPage.tsx
import { useState } from "react"
import { useProjectTemplates } from "@/hooks/template/useProjectTemplates"
import { Button } from "@/components/ui/button"
import { MoreVertical, Trash2, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PhaseDetailDialog } from "@/views/templates/PhaseDetailDialog"
import { ProjectPhase } from "@/types/project"

export default function TemplatesPage() {
  const { projectTemplates, deleteTemplate } = useProjectTemplates()
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null)
  const [isPhaseDialogOpen, setIsPhaseDialogOpen] = useState(false)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý Mẫu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {projectTemplates.map((tpl) => (
          <div key={tpl.id} className="p-4 border rounded shadow bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold">{tpl.name}</h2>
                <p className="text-sm text-gray-600">{tpl.phases.length} giai đoạn</p>
              </div>

              {/* Menu 3 chấm */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => deleteTemplate(tpl.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Danh sách giai đoạn */}
            <div className="mt-3 space-y-2">
              {tpl.phases.map((phase) => (
                <div
                  key={phase.id}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedPhase(phase)
                    setIsPhaseDialogOpen(true)
                  }}
                >
                  <h3 className="font-medium">{phase.name}</h3>
                  <p className="text-xs text-gray-500">{phase.tasks.length} công việc</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dialog chi tiết giai đoạn */}
      <PhaseDetailDialog
        open={isPhaseDialogOpen}
        phase={selectedPhase}
        onClose={() => setIsPhaseDialogOpen(false)}
        onSave={(updatedPhase) => {
          console.log("Phase saved:", updatedPhase)
          setIsPhaseDialogOpen(false)
        }}
      />
    </div>
  )
}
