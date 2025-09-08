import { useEffect, useState } from "react";

interface DiscussFormProps {
  type: "info" | "chat" | "voice";
  onSubmit: (name: string) => void;
  onClose: () => void;
  editChannel?: { id: string; name: string } | null;
}

export default function DiscussForm({ type, onSubmit, onClose, editChannel }: DiscussFormProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editChannel) {
      setName(editChannel.name); // điền tên cũ khi edit
    }
  }, [editChannel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">
          {editChannel
            ? "Đổi tên"
            : `Thêm dự án ${type === "info" ? "Thông Tin" : type === "chat" ? "Chat" : "Thoại"}`}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full border rounded p-2 mb-4"
            placeholder="Nhập tên ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-3 py-1 rounded border"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-blue-500 text-white"
            >
              {editChannel ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
