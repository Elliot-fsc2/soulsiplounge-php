import { Coffee, Cookie, DoorOpen } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface Props {
  products: Product[];
  activeCategory: string;
  onAddProduct: (product: Product) => void;
}

const categoryIcons: Record<string, typeof Coffee> = {
  beverage: Coffee,
  snack: Cookie,
  room: DoorOpen,
};

const categoryColors: Record<string, string> = {
  beverage: 'border-amber-600/30 bg-amber-900/20 hover:bg-amber-900/40 hover:border-amber-500/50',
  snack: 'border-emerald-600/30 bg-emerald-900/20 hover:bg-emerald-900/40 hover:border-emerald-500/50',
  room: 'border-sky-600/30 bg-sky-900/20 hover:bg-sky-900/40 hover:border-sky-500/50',
};

export default function ProductGrid({ products, activeCategory, onAddProduct }: Props) {
  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {filtered.map((product) => {
        const Icon = categoryIcons[product.category] ?? Coffee;

        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onAddProduct(product)}
            className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition ${categoryColors[product.category] ?? categoryColors.beverage}`}
          >
            <Icon className="mb-2 size-6 text-stone-400" />
            <span className="text-xs font-medium leading-tight text-stone-200">{product.name}</span>
            <span className="mt-1 text-sm font-bold text-amber-400">
              {product.price === 0 ? 'Custom' : `₱${product.price.toLocaleString()}`}
            </span>
          </button>
        );
      })}
      {filtered.length === 0 && (
        <div className="col-span-full py-12 text-center text-sm text-stone-500">
          No products in this category.
        </div>
      )}
    </div>
  );
}
