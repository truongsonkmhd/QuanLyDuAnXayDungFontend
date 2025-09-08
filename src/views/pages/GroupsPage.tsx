import { useState } from "react"
import { GroupList } from "@/views/groups/GroupList"
import { GroupDetail } from "@/views/groups/GroupDetail"
import { GroupForm } from "@/views/groups/GroupForm"
import { useGroups } from "@/hooks/group/useGroups"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function GroupsPage() {
  const { groups, addGroup, updateGroup, deleteGroup } = useGroups()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any | null>(null)

  const handleSaveGroup = async (group: any) => {
    if (editingGroup) {
      await updateGroup(editingGroup.id, group)
      setEditingGroup(null)
    } else {
      await addGroup(group)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="p-4">
      {!selectedGroupId ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Danh sách các nhóm</h1>
            <button
              onClick={() => {
                setEditingGroup(null)
                setIsDialogOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium shadow 
                         bg-gradient-to-r from-blue-500 to-orange-400 hover:opacity-90 transition"
            >
              <span className="text-lg">+</span>
              Thêm Nhóm
            </button>
          </div>
          <GroupList
            groups={groups}
            onSelectGroup={(id) => setSelectedGroupId(id)}
            onEditGroup={(g) => {
              setEditingGroup(g)
              setIsDialogOpen(true)
            }}
            onDeleteGroup={async (id) => await deleteGroup(id)}
          />
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedGroupId(null)}
            className="mb-4 px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
          >
            ← Quay lại danh sách
          </button>
          <GroupDetail groupId={selectedGroupId} groups={groups} />
        </>
      )}

      {/* Hộp thoại thêm / sửa nhóm */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Chỉnh sửa nhóm" : "Thêm nhóm mới"}
            </DialogTitle>
          </DialogHeader>
          <GroupForm
            onSave={handleSaveGroup}
            onClose={() => {
              setIsDialogOpen(false)
              setEditingGroup(null)
            }}
            initialData={editingGroup}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
