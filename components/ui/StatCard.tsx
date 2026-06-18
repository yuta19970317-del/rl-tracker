type Props = {
  label: string;
  value: string | number;
};

export function StatCard({ label, value }: Props) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-center">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="text-white text-xl font-bold">{value}</div>
    </div>
  );
}
