import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CalendarDays,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Copy,
  Trash2,
  FileDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Project } from "@/types/project"
import { ProjectDetail } from "@/views/projects/ProjectDetail"
import { ProjectForm } from "@/views/projects/ProjectForm"
import { useProjects } from "@/hooks/project/useProjects"

import { addProject, updateProject, deleteProject } from "@/services/ProjectService"
import { saveAs } from "file-saver";

const statusConfig = {
  planning: { label: "Lập Kế Hoạch", className: "bg-status-planning text-white", icon: CalendarDays },
  active: { label: "Đang Hoạt Động", className: "bg-status-active text-white", icon: CheckCircle },
  on_hold: { label: "Tạm Dừng", className: "bg-status-delayed text-white", icon: AlertTriangle },
  completed: { label: "Hoàn Thành", className: "bg-status-completed text-white", icon: CheckCircle },
  cancelled: { label: "Đã Hủy", className: "bg-status-blocked text-white", icon: AlertTriangle },
} as const

function ProjectCard({
  project, onView, onEdit, onCopy, onDelete
}: {
  project: Project
  onView: (p: Project) => void
  onEdit: (p: Project) => void
  onCopy: (p: Project) => void
  onDelete: (p: Project) => void
}) {
  const status = statusConfig[project.status]
  const StatusIcon = status.icon
  return (
    <Card className="hover:shadow-construction transition-shadow cursor-pointer" onClick={() => onView(project)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-foreground line-clamp-2 break-words">
              {project.name}
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{project.location}</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Badge className={`px-2 py-0.5 text-[10px] sm:text-xs ${status.className}`}>
              <StatusIcon className="w-3 h-3 mr-1 hidden sm:inline" />
              {status.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Mở menu" variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(project) }}>
                  <Eye className="w-4 h-4 mr-2" /> Xem Chi Tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(project) }}>
                  <Edit className="w-4 h-4 mr-2" /> Chỉnh Sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(project) }}>
                  <Copy className="w-4 h-4 mr-2" /> Sao Chép
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(project) }}>
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-2 break-words">{project.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Tiến Độ</span>
            <span className="font-medium text-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date(project.endDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{project.teamSize} thành viên</span>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-muted-foreground">Ngân Sách</span>
            <span className="font-medium text-foreground">{project.budget.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="flex justify-between items-center text-xs sm:text-sm mt-1">
            <span className="text-muted-foreground">Quản Lý</span>
            <span className="text-foreground truncate max-w-[55%] sm:max-w-none">{project.manager}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { projects, isLoading, refetch } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'create' | 'edit' | 'copy' | null>(null)
  const exportDashboardXlsx = () => {
    const fileUrl = '/template_dashboard2.xlsx';
    saveAs(fileUrl, 'dashboard_export.xlsx');
  };

  const filteredProjects = projects.filter((project) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch =
      project.name.toLowerCase().includes(q) ||
      project.manager.toLowerCase().includes(q) ||
      (project.location || "").toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateProject = () => { setSelectedProject(null); setDialogMode('create') }
  const handleViewProject = (p: Project) => { setSelectedProject(p); setDialogMode('view') }
  const handleEditProject = (p: Project) => { setSelectedProject(p); setDialogMode('edit') }
  const handleCopyProject = (p: Project) => { setSelectedProject(p); setDialogMode('copy') }

  //  Xoá qua service + refetch
  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa dự án "${project.name}"?`)) return
    await deleteProject(project.id)
    await refetch()
  }

  // Lưu dự án theo mode (create/edit/copy) + refetch
  const handleSaveProject = async (projectData: Omit<Project, "id"> | Project) => {
    if (dialogMode === "create" || dialogMode === "copy") {
      await addProject(projectData as Omit<Project, "id">)
    } else if (dialogMode === "edit" && "id" in projectData) {
      await updateProject((projectData as Project).id, projectData as Project)
    }
    await refetch()
    setDialogMode(null)
    setSelectedProject(null)
  }

  const handleCloseDialog = () => { setDialogMode(null); setSelectedProject(null) }

  return (
    <div className="space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dự Án</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">Quản lý và theo dõi tất cả các dự án xây dựng của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Xuất Excel: icon-only trên mobile */}
          <Button
            variant="outline"
            size="icon"
            className="sm:size-auto sm:px-4"
            onClick={() => exportDashboardXlsx()}
            aria-label="Xuất Excel"
            title="Xuất Excel"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Xuất Excel</span>
          </Button>

          <Button variant="construction" className="sm:px-4" onClick={handleCreateProject}>
            <Plus className="w-4 h-4" />
            {/* Hiện chữ trên desktop */}
            <span className="hidden sm:inline ml-2">Dự Án Mới</span>
            {/* Hiện chữ trên mobile */}
            <span className="sm:hidden ml-2">Tạo dự án mới</span>
          </Button>

        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm dự án, quản lý hoặc địa điểm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[9.5rem] sm:w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="planning">Lập Kế Hoạch</SelectItem>
                  <SelectItem value="active">Đang Hoạt Động</SelectItem>
                  <SelectItem value="on_hold">Tạm Dừng</SelectItem>
                  <SelectItem value="completed">Hoàn Thành</SelectItem>
                  <SelectItem value="cancelled">Đã Hủy</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" aria-label="Bộ lọc nâng cao">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Tổng Dự Án</p>
                <p className="text-xl sm:text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="bg-status-active/10 p-2 rounded-lg"><Clock className="w-5 h-5 text-status-active" /></div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Đang Hoạt Động</p>
                <p className="text-xl sm:text-2xl font-bold">{projects.filter(p => p.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="bg-status-completed/10 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-status-completed" /></div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Hoàn Thành</p>
                <p className="text-xl sm:text-2xl font-bold">{projects.filter(p => p.status === "completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 p-2 rounded-lg"><DollarSign className="w-5 h-5 text-destructive" /></div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Tổng Ngân Sách</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {(projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0) / 1_000_000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-muted-foreground py-8">Đang tải dữ liệu...</div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={handleViewProject}
              onEdit={handleEditProject}
              onCopy={handleCopyProject}
              onDelete={handleDeleteProject}
            />
          ))
        )}
      </div>

      {(!isLoading && filteredProjects.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy dự án nào phù hợp với bộ lọc của bạn.</p>
        </div>
      )}

      {/* Dialogs */}
      {/* View dialog: full-screen trên mobile */}
      <Dialog open={dialogMode === "view"} onOpenChange={() => dialogMode === "view" && handleCloseDialog()}>
        <DialogContent className="sm:max-w-6xl w-[100vw] sm:w-auto h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-0 sm:p-0 sm:rounded-xl rounded-none">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <DialogTitle>Chi Tiết Dự Án</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <ProjectDetail project={selectedProject} onEdit={handleEditProject} onCopy={handleCopyProject} onClose={handleCloseDialog} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit/Copy dialog: full-screen trên mobile */}
      <Dialog open={dialogMode === "create" || dialogMode === "edit" || dialogMode === "copy"} onOpenChange={() => (dialogMode === "create" || dialogMode === "edit" || dialogMode === "copy") && handleCloseDialog()}>
        <DialogContent className="sm:max-w-6xl w-[100vw] sm:w-auto h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[90vh] overflow-y-auto p-0 sm:p-0 sm:rounded-xl rounded-none">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <ProjectForm
              project={selectedProject || undefined}
              mode={dialogMode as "create" | "edit" | "copy"}
              onSave={handleSaveProject}
              onCancel={handleCloseDialog}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
