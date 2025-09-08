interface GroupDetailProps {
  groupId: string;
  groups: {
    id: string;
    name: string;
    description: string;
    members: string[];
    leader: string;
  }[];
}

export function GroupDetail({ groupId, groups }: GroupDetailProps) {
  const group = groups.find((g) => g.id === groupId);

  if (!group) return <p>Không tìm thấy nhóm!</p>;

  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
      <p className="text-gray-700 mb-4">{group.description}</p>

      <p className="mb-2">👤 Trưởng nhóm: <span className="font-medium">{group.leader}</span></p>

      <h2 className="text-lg font-semibold mb-2">👥 Thành viên:</h2>
      <ul className="list-disc ml-6 space-y-1">
        {group.members.map((m, idx) => (
          <li key={idx}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
