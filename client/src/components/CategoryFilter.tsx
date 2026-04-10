const CATEGORIES = [
  'Social',
  'Conference',
  'Music',
  'Sports',
  'Workshop',
  'Networking',
  'Food & Drink',
  'Arts',
  'Other',
];

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          selected === ''
            ? 'bg-indigo-500 text-white border-indigo-500'
            : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            selected === cat
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
