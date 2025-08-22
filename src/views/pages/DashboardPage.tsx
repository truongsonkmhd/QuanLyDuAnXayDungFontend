import {
  DashboardStats
} from "@/views/dashboard/DashboardStats"
import {
  ProjectCard
} from "@/views/dashboard/ProjectCard"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { FileDown, Plus, TrendingUp } from "lucide-react"
import { Project } from "@/types/project"
import { ProjectDetail } from "@/views/projects/ProjectDetail"
import { ProjectForm } from "@/views/projects/ProjectForm"
import { useProjects } from "@/hooks/project/useProjects"
import { addProject, updateProject } from "@/services/ProjectService"
import { useState, useMemo } from "react"
import { saveAs } from "file-saver"

export default function Dashboard() {
  const { projects, isLoading, refetch } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'create' | 'edit' | 'copy' | null>(null)

  const exportDashboardXlsx = () => {
    const fileUrl = '/template_dashboard2.xlsx'
    saveAs(fileUrl, 'dashboard_export.xlsx')
  }

  const stats = useMemo(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === "active").length
    const completedProjects = projects.filter(p => p.status === "completed").length

    const now = new Date()
    const delayedProjects = projects.filter(p => {
      if (!p.endDate) return false
      return new Date(p.endDate) < now && p.status !== "completed"
    }).length

    const teamMembers = projects.reduce((sum, p) => sum + (Number(p.teamSize) || 0), 0)
    const avgProgress = totalProjects === 0
      ? 0
      : Math.round(projects.reduce((s, p) => s + (Number(p.progress) || 0), 0) / totalProjects)

    return { totalProjects, activeProjects, completedProjects, delayedProjects, teamMembers, avgProgress }
  }, [projects])

  const handleCreateProject = () => { setSelectedProject(null); setDialogMode('create') }
  const handleViewProject = (project: Project) => { setSelectedProject(project); setDialogMode('view') }
  const handleEditProject = (project: Project) => { setSelectedProject(project); setDialogMode('edit') }
  const handleCopyProject = (project: Project) => { setSelectedProject(project); setDialogMode('copy') }

  const handleSaveProject = async (project: Project) => {
    try {
      const dataToSave = {
        name: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        startDate: project.startDate,
        endDate: project.endDate,
        teamSize: project.teamSize,
        budget: project.budget,
        manager: project.manager,
        category: project.category || "",
        location: project.location || "",
        phases: project.phases || [],
        tasks: project.tasks || [],
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        investmentLevel: project.investmentLevel || "",
        investmentApproval: project.investmentApproval || "",
        projectGroup: project.projectGroup || "",
        investor: project.investor || "",
        investmentType: project.investmentType || "",
        managementType: project.managementType || "",
        projectScale: project.projectScale || "",
        designStepCount: project.designStepCount || 1,
        designCapacity: project.designCapacity || "",
        approvalDate: project.approvalDate || "",
        legalDocuments: project.legalDocuments || [],
        constructionLevel: project.constructionLevel || "",
        constructionType: project.constructionType || "",
        constructionLocation: project.constructionLocation || "",
        designStandards: project.designStandards || "",
        goals: project.goals || "",
        method: project.syntheticMethod || "",
        notes: project.notes || "",
        numberTBMT: project.numberTBMT || "",
        timeExceution: project.timeExceution || "",
        contractorCompanyName: project.contractorCompanyName || [],
        contrator: project.contrator || "",
        contractorPrice: project.contractorPrice || 0,
        relatedDocuments: project.relatedDocuments || [],
        roleExecutor: project.roleExecutor || "",
        capitalProject: project.capitalProject || "",
        field: project.field || "",
        documentFolder: project.documentFolder || []
      }

      if (dialogMode === "create" || dialogMode === "copy") {
        await addProject(dataToSave)
      } else if (dialogMode === "edit" && project.id) {
        await updateProject(project.id, dataToSave)
      }

      await refetch()
      setDialogMode(null)
      setSelectedProject(null)
    } catch (error) {
      console.error("Lỗi khi lưu dự án:", error)
    }
  }

  const handleCloseDialog = () => { setDialogMode(null); setSelectedProject(null) }

  return (
    <div className="space-y-6 px-1 sm:px-6">
      {/* Header responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bảng Điều Khiển</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Chào mừng bạn trở lại! Đây là những gì đang diễn ra với các dự án của bạn.
          </p>
        </div>

        {/* Nhóm 2 nút: icon-only trên mobile, có chữ trên ≥ sm */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="sm:size-auto sm:px-4"
            onClick={() => exportDashboardXlsx()}
            disabled={isLoading || projects.length === 0}
            aria-label="Xuất Excel"
            title="Xuất Excel"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Xuất Excel</span>
          </Button>

          <Button
            variant="construction"
            className="sm:px-4"
            onClick={handleCreateProject}
            aria-label="Dự Án Mới"
            title="Dự Án Mới"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Dự Án Mới</span>
            {/* Hiện chữ trên mobile */}
            <span className="sm:hidden ml-2">Tạo dự án mới</span>
          </Button>
        </div>
      </div>

      {/* Stats: đảm bảo co giãn tốt */}
      <DashboardStats stats={stats} />

      {/* Nội dung chính: cột đơn trên mobile, 3 cột trên lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Dự Án Đang Hoạt Động
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={handleViewProject}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Hành Động Nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={handleCreateProject}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo Dự Án Mới
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Tải Lên Mẫu
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Lên Lịch Họp
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Tạo Báo Cáo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Hoạt Động Gần Đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Nguyễn Thị Minh</span> đã cập nhật tiến độ công việc
                  <div className="text-muted-foreground text-xs">2 giờ trước</div>
                </div>
                <div>
                  <span className="font-medium">Trần Văn Hòa</span> đã tải lên tài liệu mới
                  <div className="text-muted-foreground text-xs">4 giờ trước</div>
                </div>
                <div>
                  <span className="font-medium">Lê Thị Lan</span> đã hoàn thành mốc quan trọng
                  <div className="text-muted-foreground text-xs">1 ngày trước</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs: full-screen trên mobile */}
      <Dialog open={dialogMode === 'view'} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-6xl w-[100vw] sm:w-auto h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-0 sm:p-0 sm:rounded-xl rounded-none">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle>Chi Tiết Dự Án</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <ProjectDetail
                project={selectedProject}
                onEdit={handleEditProject}
                onCopy={handleCopyProject}
                onClose={handleCloseDialog}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'create' || dialogMode === 'edit' || dialogMode === 'copy'} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-6xl w-[100vw] sm:w-auto h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-0 sm:p-0 sm:rounded-xl rounded-none">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <ProjectForm
              project={selectedProject || undefined}
              mode={dialogMode as 'create' | 'edit' | 'copy'}
              onSave={handleSaveProject}
              onCancel={handleCloseDialog}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
