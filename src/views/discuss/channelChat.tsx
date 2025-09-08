import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
  avatar?: string;
  name?: string;
  time: string;
}

export default function ChannelChat({ 
  channelName, 
  channelType 
}: { 
  channelName: string; 
  channelType: "info" | "chat"; 
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Chào mọi người",
      sender: "me",
      avatar: "https://i.pravatar.cc/40?img=1",
      name: "Bạn",
      time: "10:30 AM",
    },
    {
      id: 2,
      text: "chào sếp 🎉",
      sender: "other",
      avatar: "https://i.pravatar.cc/40?img=2",
      name: "Jake",
      time: "10:31 AM",
    },
    {
      id: 3,
      text: "chiều nay mọi người có cuộc họp lúc 14h nhé.",
      sender: "me",
      avatar: "https://i.pravatar.cc/40?img=1",
      name: "Bạn",
      time: "10:32 AM",
    },
    {
      id: 4,
      text: "Vâng sếp",
      sender: "other",
      avatar: "https://i.pravatar.cc/40?img=2",
      name: "Jake",
      time: "10:33 AM",
    },
     {
      id: 5,
      text: "Yes sir",
      sender: "other",
      avatar: "https://i.pravatar.cc/40?img=3",
      name: "Joke",
      time: "10:33 AM",
    },
    {
      id: 7,
      text: "Đúng giờ nhé",
      sender: "me",
      avatar: "https://i.pravatar.cc/40?img=1",
      name: "Bạn",
      time: "10:34 AM",
    },
     {
      id: 8,
      text: "oh no",
      sender: "other",
      avatar: "https://i.pravatar.cc/40?img=4",
      name: "Jeke",
      time: "10:35 AM",
    },
  ]);

  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMsg.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: newMsg,
        sender: "me",
        avatar: "https://i.pravatar.cc/40?img=1",
        name: "Bạn",
        time: timeStr,
      },
    ]);
    setNewMsg("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Header */}
      <div className="p-3 border-b font-semibold bg-white">
        #{channelName}
      </div>

      {/* Nội dung */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {channelType === "info" ? (
          <div className="prose max-w-none text-gray-800">
            <h2 className="font-bold text-lg mb-3">📌 Nội Quy Công Ty</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Đi làm đúng giờ, trang phục lịch sự.</li>
              <li>Không chia sẻ thông tin dự án ra ngoài.</li>
              <li>Họp nhóm vào thứ 2 hàng tuần lúc 9h sáng.</li>
              <li>Giữ gìn vệ sinh chung trong văn phòng.</li>
              <li>Thân thiện, hợp tác với đồng nghiệp.</li>
            </ul>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "other" && (
                  <img
                    src={msg.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <div>
                  {msg.sender === "other" && (
                    <div className="text-xs text-gray-500 mb-1">{msg.name}</div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl break-words shadow 
                      ${msg.sender === "me"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-black rounded-bl-none"
                      }`}
                    style={{ maxWidth: "100%" }} // 👈 cho bubble dài hơn (90% khung chat)
                  >
                    {msg.text}
                  </div>
                  <div
                    className={`text-xs text-gray-400 mt-1 ${
                      msg.sender === "me" ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
                {msg.sender === "me" && (
                  <img
                    src={msg.avatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full ml-2"
                  />
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input chat (chỉ chat mới có) */}
      {channelType === "chat" && (
        <div className="p-3 border-t flex items-center bg-white">
          <input
            className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none"
            placeholder="Nhắn tin..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-full"
            onClick={handleSend}
          >
            ➤
          </button>
        </div>
      )}
    </div>
  );
}
