import { useTranslation } from 'react-i18next';
import ProductManager from '../../components/ProductManager';

import './ShopAdmin.css';

export default function ShopAdmin() {
  useTranslation('shop');
  return (
    <div className="shop-admin-page">
      <ProductManager />
    </div>
  );
}

