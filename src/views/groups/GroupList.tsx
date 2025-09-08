import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { MoreVertical, Pencil, Trash2, Users } from "lucide-react"

export function GroupList({
  groups,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
}: {
  groups: any[]
  onSelectGroup: (id: string) => void
  onEditGroup: (group: any) => void
  onDeleteGroup: (id: string) => void
}) {
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDeleteGroup(deleteId)
      toast({
        title: "Xóa thành công",
        description: "Nhóm đã được xóa khỏi danh sách.",
      })
    }
    setConfirmOpen(false)
    setDeleteId(null)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="relative p-4 border rounded shadow bg-white flex justify-between"
          >
            {/* Nội dung chính */}
            <div
              className="cursor-pointer flex-1"
              onClick={() => onSelectGroup(group.id)}
            >
              <h2 className="font-semibold">{group.name}</h2>
              <p className="text-sm text-gray-600">{group.description}</p>
              <p className="text-xs text-gray-500">
                Trưởng nhóm: {group.leader}
              </p>

              {/* 👤 Số thành viên */}
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <Users className="w-4 h-4" />
                <span>{group.members?.length+1 || 0} thành viên</span>
              </div>
            </div>

            {/* Menu 3 chấm */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()} // tránh mở detail khi click menu
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditGroup(group)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    setDeleteId(group.id)
                    setConfirmOpen(true)
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Hộp thoại xác nhận xóa */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa nhóm này?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Thao tác này không thể hoàn tác. Nhóm và dữ liệu liên quan sẽ bị xóa.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
