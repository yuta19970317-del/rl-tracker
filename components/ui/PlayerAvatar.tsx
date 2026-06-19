type Props = {
  name: string;
  avatarUrl?: string;
  size?: number;
};

export function PlayerAvatar({ name, avatarUrl, size = 24 }: Props) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-700 flex-shrink-0 font-bold text-gray-300"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {avatarUrl
        ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        : name.slice(0, 1)}
    </span>
  );
}
