interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description: string;
    members: string[];
    leader: string;
  };
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-md transition bg-white cursor-pointer">
      <h2 className="text-lg font-semibold">{group.name}</h2>
      <p className="text-sm text-gray-600 mb-2">{group.description}</p>

      <div className="text-sm text-gray-700 flex items-center gap-1">
        <span>👥</span>
        Thành viên: <span className="font-medium">{group.members.length+1}</span>
      </div>

      <div className="text-sm text-gray-700 flex items-center gap-1">
        <span>👤</span>
        Trưởng nhóm: <span className="font-medium">{group.leader}</span>
      </div>
    </div>
  );
}
