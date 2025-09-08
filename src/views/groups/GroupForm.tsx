import { useState, useEffect } from "react"

interface GroupFormProps {
  onSave: (group: any) => void
  onClose: () => void
  initialData?: any   // ✅ thêm prop này
}

export function GroupForm({ onSave, onClose, initialData }: GroupFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [leader, setLeader] = useState("")
  const [members, setMembers] = useState("")

  // ✅ Khi mở form chỉnh sửa, load dữ liệu sẵn
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setDescription(initialData.description || "")
      setLeader(initialData.leader || "")
      setMembers((initialData.members || []).join(", "))
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newGroup = {
      id: initialData?.id || Date.now().toString(), // nếu edit thì giữ id
      name,
      description,
      leader,
      members: members.split(",").map((m) => m.trim())
    }
    onSave(newGroup)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Tên nhóm"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />
      <textarea
        placeholder="Mô tả"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="text"
        placeholder="Trưởng nhóm"
        value={leader}
        onChange={(e) => setLeader(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
      <input
        type="text"
        placeholder="Danh sách thành viên (ngăn cách bởi dấu phẩy)"
        value={members}
        onChange={(e) => setMembers(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600"
        >
          {initialData ? "Cập nhật" : "Lưu"}
        </button>
      </div>
    </form>
  )
}
