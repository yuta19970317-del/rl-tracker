export default function UpdatesPage() {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">アップデート履歴</h1>
        <p className="text-gray-400 text-sm mt-1">RL Tracker の更新情報</p>
      </div>

      <div className="space-y-1">
        {UPDATES.map((u, i) => (
          <UpdateItem key={i} item={u} isLast={i === UPDATES.length - 1} />
        ))}
      </div>
    </div>
  );
}

type UpdateEntry = {
  version: string;
  date: string;
  title: string;
  description: string;
  badge: "NEW" | "UI" | "FIX";
  icon: string;
  iconColor: string;
  iconBg: string;
};

const UPDATES: UpdateEntry[] = [
  {
    version: "v1.14",
    date: "2026/06/20",
    title: "個人成績 バッジシステム",
    description:
      "個人成績ページにプレイヤーごとのバッジ表示機能を追加しました。14種類のバッジ（疫病神・沼り中・ハットトリック・鉄壁・撃ちたがり・決定力の鬼・アシスト職人・上振れ中・感染者・介護士・除霊成功・相棒・地獄デュオ）を自動判定。カードの下にチップ形式で最大5個表示し、タップすると達成条件の詳細を確認できます。「全バッジ」ボタンで全14種を攻撃系・支援系・守備系・調子系・ペア系・疫病神系に分類して一覧表示。未取得バッジはグレーアウトで表示します。",
    badge: "NEW",
    icon: "🏅",
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-900/40",
  },
  {
    version: "v1.13",
    date: "2026/06/20",
    title: "OCR読み取り精度改善",
    description:
      "スコアボード自動読み取りの前処理を強化しました。アップスケールを2倍→3倍に拡大し、コントラスト強調（1.8倍ストレッチ）と閾値を120→150に変更。RLの白文字をより正確に検出できるようになりました。",
    badge: "FIX",
    icon: "📸",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-900/40",
  },
  {
    version: "v1.12",
    date: "2026/06/19",
    title: "個人成績 ゲームキャラクターカードデザイン",
    description:
      "個人成績ページをゲームのキャラクターカード風にリニューアル。称号に応じてカードのテーマカラーと背景アートが変化します（疫病神=魔法陣、ゴール王=炎、勝率王=王冠＋星、守護神=盾、アシスト王=ネットワーク、決定力王=ターゲット、撃ちたがり=爆発）。ホバーで発光エフェクト付き。プレイスタイルラベルを自動算出して表示します。",
    badge: "UI",
    icon: "🎮",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-900/40",
  },
  {
    version: "v1.11",
    date: "2026/06/19",
    title: "全ページにプレイヤーアイコン表示",
    description:
      "試合一覧・ランキング・ペア成績ページのプレイヤー名横に設定済みアバターアイコンが表示されるようになりました。未設定の場合はイニシャルが表示されます。",
    badge: "UI",
    icon: "🖼️",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-900/40",
  },
  {
    version: "v1.10",
    date: "2026/06/19",
    title: "成績ボタンを大きく見やすく改善",
    description:
      "プレイヤー一覧の成績ボタンをオレンジ背景・白文字の目立つデザインに変更しました。",
    badge: "UI",
    icon: "🎨",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-900/40",
  },
  {
    version: "v1.9",
    date: "2026/06/19",
    title: "個人成績ページ ヒーローバナーデザイン",
    description:
      "個人成績ページをリニューアル。大きなアバター・称号バッジ（ゴール王・勝率王など）・勝敗サマリーを上部に表示するヒーローバナー型デザインになりました。",
    badge: "UI",
    icon: "⭐",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-900/40",
  },
  {
    version: "v1.8",
    date: "2026/06/19",
    title: "個人成績へのクイックリンク",
    description:
      "プレイヤー一覧の名前をクリックすると個人成績ページに直接移動できるようになりました。個人成績ページにアバター画像も表示されます。",
    badge: "NEW",
    icon: "👤",
    iconColor: "text-teal-400",
    iconBg: "bg-teal-900/40",
  },
  {
    version: "v1.7",
    date: "2026/06/19",
    title: "スコアボードOCR自動入力",
    description:
      "試合入力ページで「📸 スクショから入力」ボタンが追加されました。Win+Shift+S でスクショ後 Ctrl+V で貼り付けるとスタッツを自動読み取りします。読み取り結果は編集可能でフォームに一括反映できます。",
    badge: "NEW",
    icon: "📸",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-900/40",
  },
  {
    version: "v1.6",
    date: "2026/06/18",
    title: "プレイヤーアイコン設定",
    description:
      "プレイヤー管理ページでアバター画像を設定できるようになりました。アップロード時にアプリ内でトリミングも可能です。アイコンはランキングや個人成績ページにも表示されます。",
    badge: "NEW",
    icon: "🖼️",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-900/40",
  },
  {
    version: "v1.5",
    date: "2026/06/18",
    title: "称号カード追加",
    description:
      "ランキングページに6つの称号カードが追加されました。勝率王・ゴール王・守護神・決定力王・アシスト王・撃ちたがりの称号が自動で計算されます。同率の場合は複数名表示されます。",
    badge: "NEW",
    icon: "🏆",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-900/40",
  },
  {
    version: "v1.4",
    date: "2026/06/18",
    title: "試合一覧アコーディオン表示",
    description:
      "試合一覧がアコーディオン形式にリニューアルされました。閉じた状態で勝敗チームと日付が確認でき、タップすると各プレイヤーの全スタッツが表示されます。",
    badge: "UI",
    icon: "📋",
    iconColor: "text-green-400",
    iconBg: "bg-green-900/40",
  },
  {
    version: "v1.3",
    date: "2026/06/18",
    title: "個人成績ページリニューアル",
    description:
      "個人成績ページのデザインを刷新しました。プロフィール・勝率ゲージ・平均スタッツグリッドのレイアウトで見やすくなりました。",
    badge: "UI",
    icon: "📊",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-900/40",
  },
  {
    version: "v1.2",
    date: "2026/06/18",
    title: "プレイヤー削除・非表示機能",
    description:
      "プレイヤー管理ページでプレイヤーの完全削除と非表示（アーカイブ）が可能になりました。削除時は関連する試合データへの影響を警告で確認できます。",
    badge: "NEW",
    icon: "🗑️",
    iconColor: "text-red-400",
    iconBg: "bg-red-900/40",
  },
  {
    version: "v1.1",
    date: "2026/06/18",
    title: "疫病神カード",
    description:
      "ランキングページに「疫病神カード」が追加されました。チームの足を最も引っ張ったプレイヤーを算出して表示します。",
    badge: "NEW",
    icon: "👿",
    iconColor: "text-gray-400",
    iconBg: "bg-gray-800",
  },
  {
    version: "v1.0",
    date: "2026/06/18",
    title: "RL Tracker リリース",
    description:
      "Rocket League 2v2 の戦績管理アプリをリリースしました。試合記録・個人成績・ペア成績・ランキングが確認できます。",
    badge: "NEW",
    icon: "🚀",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-900/40",
  },
];

const BADGE_STYLE: Record<string, string> = {
  NEW: "bg-teal-900/50 text-teal-400 border border-teal-700/50",
  UI: "bg-purple-900/50 text-purple-400 border border-purple-700/50",
  FIX: "bg-red-900/50 text-red-400 border border-red-700/50",
};

function UpdateItem({ item, isLast }: { item: UpdateEntry; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      {/* タイムライン */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${item.iconBg}`}>
          {item.icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-800 mt-1 mb-1" />}
      </div>

      {/* コンテンツ */}
      <div className={`flex-1 pb-6 ${isLast ? "" : ""}`}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded font-mono">
            {item.version}
          </span>
          <span className="text-xs text-gray-600">{item.date}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${BADGE_STYLE[item.badge]}`}>
            {item.badge}
          </span>
        </div>
        <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
        <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}
