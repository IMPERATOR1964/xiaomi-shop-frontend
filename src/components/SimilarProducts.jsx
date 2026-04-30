import ProductCard from './ProductCard';
import { getSimilarProducts } from '../data/products';

export default function SimilarProducts({ product, count = 4 }) {
  const items = getSimilarProducts(product, count);
  if (!items.length) return null;

  return (
    <section className="similar">
      <h2 className="similar-title">Похожие товары</h2>
      <div className="products-grid">
        {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}
