export interface Category {
  id: number;
  name: string;
  description: string;
  type: 'product' | 'service' | 'both';
  parent_id: number | null;
  parent: { id: number; name: string } | null;
  children: Category[];
  is_active: boolean;
}

export interface CategoryOption {
  value: string;
  label: string;
  depth: number;
}

export function buildTree(categories: Category[]): Category[] {
  const map = new Map<number, Category>();
  const roots: Category[] = [];

  categories.forEach(c => map.set(c.id, { ...c, children: [] }));

  categories.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function flattenTree(roots: Category[], depth = 0): CategoryOption[] {
  const result: CategoryOption[] = [];
  for (const node of roots) {
    result.push({ value: node.id.toString(), label: node.name, depth });
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

export function typeBadge(type: string) {
  const colors: Record<string, string> = {
    product: 'bg-blue-100 text-blue-800',
    service: 'bg-purple-100 text-purple-800',
    both: 'bg-green-100 text-green-800',
  };
  const labels: Record<string, string> = {
    product: 'Producto',
    service: 'Servicio',
    both: 'Ambos',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${colors[type] || ''}`}>
      {labels[type] || type}
    </span>
  );
}

export function renderCategorySelectOptions(categories: Category[], excludeId?: number) {
  const tree = buildTree(categories.filter(c => !excludeId || c.id !== excludeId));
  const flat = flattenTree(tree);
  return flat.map(opt => ({
    value: opt.value,
    label: `${'  '.repeat(opt.depth)}${opt.depth > 0 ? '└ ' : ''}${opt.label}`,
  }));
}
