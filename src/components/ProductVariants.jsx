import { useNavigate } from 'react-router-dom';
import { getProductVariants, findVariantByOptions } from '../data/products';

export default function ProductVariants({ product }) {
  const navigate = useNavigate();
  const { variants, colors, memories } = getProductVariants(product);

  if (variants.length <= 1 && colors.length <= 1 && memories.length <= 1) {
    return null;
  }

  const currentColor  = product.specs?.['Цвет'];
  const currentMemory = product.specs?.['Объём ОЗУ'] && product.specs?.['Объём накопителя']
    ? `${product.specs['Объём ОЗУ']} / ${product.specs['Объём накопителя']}`
    : null;

  const switchTo = (overrides) => {
    const next = findVariantByOptions(product, {
      color:  overrides.color  ?? currentColor,
      memory: overrides.memory ?? currentMemory,
    });
    if (next && next.id !== product.id) navigate(`/product/${next.id}`);
  };

  return (
    <div className="variants">
      {memories.length > 1 && (
        <div className="variants-row">
          <span className="variants-label">Память:</span>
          <div className="variants-options">
            {memories.map(m => (
              <button
                key={m}
                type="button"
                className={`variant-chip ${m === currentMemory ? 'active' : ''}`}
                onClick={() => switchTo({ memory: m })}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
      {colors.length > 1 && (
        <div className="variants-row">
          <span className="variants-label">Цвет:</span>
          <div className="variants-options">
            {colors.map(c => (
              <button
                key={c}
                type="button"
                className={`variant-chip ${c === currentColor ? 'active' : ''}`}
                onClick={() => switchTo({ color: c })}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
