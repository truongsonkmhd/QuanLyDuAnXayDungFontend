import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useChannels, Channel } from "@/hooks/discuss/useChannels"; // 👈 import Channel chuẩn
import DiscussForm from "../discuss/discussForm";
import ChannelChat from "../discuss/channelChat"; 

export default function DiscussPage() {
  const projectId = "project01"; 
  const { channels, addChannel, updateChannel, deleteChannel } = useChannels(projectId);

  const [openInfo, setOpenInfo] = useState(true);
  const [openChat, setOpenChat] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"info" | "chat">("chat");
  const [editChannel, setEditChannel] = useState<Channel | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; channelId: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Channel | null>(null);

  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleOpenForm = (type: "info" | "chat") => {
    setFormType(type);
    setEditChannel(null);
    setShowForm(true);
  };

  const handleAddOrUpdate = (name: string) => {
    if (editChannel) {
      updateChannel(editChannel.id, name);
    } else {
      addChannel(name, formType);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, channelId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, channelId });
  };

  const handleEdit = () => {
    const ch = channels.find(c => c.id === contextMenu?.channelId);
    if (!ch) return;
    setFormType(ch.type === "info" ? "info" : "chat"); // 👈 ép về info/chat
    setEditChannel(ch);
    setShowForm(true);
    setContextMenu(null);
  };

  const handleDelete = () => {
    const ch = channels.find(c => c.id === contextMenu?.channelId);
    if (ch) setConfirmDelete(ch);
    setContextMenu(null);
  };

  const confirmDeleteChannel = () => {
    if (confirmDelete) {
      deleteChannel(confirmDelete.id);
      setConfirmDelete(null);
      if (selectedChannel?.id === confirmDelete.id) {
        setSelectedChannel(null);
      }
    }
  };

  // 🔹 Đóng context menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);

  // 🔹 Auto chọn kênh "nội quy công ty" hoặc kênh đầu tiên
  useEffect(() => {
    if (!selectedChannel && channels.length > 0) {
      const availableChannels = channels.filter(c => c.type === "info" || c.type === "chat");

      if (availableChannels.length > 0) {
        const defaultChannel =
          availableChannels.find(c => c.name.toLowerCase().includes("nội quy")) || availableChannels[0];
        setSelectedChannel(defaultChannel);
      }
    }
  }, [channels, selectedChannel]);

  return (
    <div className="flex h-screen bg-white relative">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-3 text-sm overflow-y-auto">
        {/* Nhóm: Thông Tin */}
        <div className="flex items-center justify-between cursor-pointer font-semibold text-gray-600 mb-1">
          <div className="flex items-center space-x-1" onClick={() => setOpenInfo(!openInfo)}>
            {openInfo ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Thông Tin</span>
          </div>
          <Plus size={14} className="cursor-pointer" onClick={() => handleOpenForm("info")} />
        </div>
        {openInfo && (
          <ul className="mb-3 space-y-1">
            {channels.filter(c => c.type === "info").map(c => (
              <li
                key={c.id}
                onClick={() => setSelectedChannel(c)}
                onContextMenu={(e) => handleContextMenu(e, c.id)}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedChannel?.id === c.id ? "bg-gray-200" : ""
                }`}
              >
                🚩 {c.name}
              </li>
            ))}
          </ul>
        )}

        {/* Nhóm: Kênh Chat */}
        <div className="flex items-center justify-between cursor-pointer font-semibold text-gray-600 mb-1">
          <div className="flex items-center space-x-1" onClick={() => setOpenChat(!openChat)}>
            {openChat ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Thảo luận dự án</span>
          </div>
          <Plus size={14} className="cursor-pointer" onClick={() => handleOpenForm("chat")} />
        </div>
        {openChat && (
          <ul className="mb-3 space-y-1">
            {channels.filter(c => c.type === "chat").map(c => (
              <li
                key={c.id}
                onClick={() => setSelectedChannel(c)}
                onContextMenu={(e) => handleContextMenu(e, c.id)}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedChannel?.id === c.id ? "bg-gray-200" : ""
                }`}
              >
                # {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedChannel && (
          <ChannelChat 
            channelName={selectedChannel.name} 
            channelType={selectedChannel.type as "info" | "chat"} // 👈 ép về info/chat
          />
        )}
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <DiscussForm
          type={formType}
          onSubmit={handleAddOrUpdate}
          onClose={() => setShowForm(false)}
          editChannel={editChannel}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-white shadow-md rounded border text-sm z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
            onClick={handleEdit}
          >
            ✏️ Đổi tên
          </button>
          <button
            className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
            onClick={handleDelete}
          >
            🗑 Xóa 
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-lg font-bold mb-4">Xác nhận xóa kênh</h2>
            <p className="mb-4">
              Bạn có chắc chắn muốn xóa kênh <b>{confirmDelete.name}</b> không? Toàn bộ dữ liệu sẽ mất.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 rounded border"
                onClick={() => setConfirmDelete(null)}
              >
                Hủy
              </button>
              <button
                className="px-3 py-1 rounded bg-red-500 text-white"
                onClick={confirmDeleteChannel}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
