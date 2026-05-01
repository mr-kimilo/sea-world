import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useFamilyStore } from '../store/familyStore';
import { useConfirm } from '../hooks/useConfirm';
import { useDeviceType } from '../hooks/useDeviceType';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetail,
  ShopItem,
  ProductDetail,
  CreateProductRequest,
  UpdateProductRequest
} from '../api/shop';
import './ProductManager.css';
import './ProductManager.mobile.css';

interface ProductFormData {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
  allowedChildIds: string[];
}

export default function ProductManager() {
  const { t } = useTranslation('shop');
  const { children } = useFamilyStore();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { isMobile } = useDeviceType();
  
  const [products, setProducts] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const [mobileActionProduct, setMobileActionProduct] = useState<ShopItem | null>(null);
  /** 所需积分：用字符串控制输入框，允许清空后再输入，避免 number 输入框无法删光「0」 */
  const [priceInput, setPriceInput] = useState('10');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    imageUrl: '',
    price: 10,
    sortOrder: 100,
    isActive: true,
    allowedChildIds: []
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setUseDefaultImage(true);
    setPriceInput('10');
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      price: 10,
      sortOrder: 100,
      isActive: true,
      allowedChildIds: []
    });
    setShowForm(true);
  };

  const handleEdit = async (product: ShopItem) => {
    try {
      const detail = await getProductDetail(product.id);
      setEditingProduct(detail);
      setUseDefaultImage(!detail.imageUrl);
      setPriceInput(String(detail.price));
      setFormData({
        name: detail.name,
        description: detail.description || '',
        imageUrl: detail.imageUrl || '',
        price: detail.price,
        sortOrder: detail.sortOrder,
        isActive: detail.isActive,
        allowedChildIds: detail.allowedChildIds
      });
      setShowForm(true);
    } catch (error) {
      console.error('Failed to load product detail:', error);
      await confirm({
        title: t('admin.messages.error'),
        message: t('admin.messages.loadError'),
        type: 'danger',
        confirmText: t('common:confirm')
      });
    }
  };

  const handleDelete = async (product: ShopItem) => {
    const confirmed = await confirm({
      title: t('admin.deleteConfirm.title'),
      message: t('admin.deleteConfirm.message', { name: product.name }),
      type: 'danger',
      confirmText: t('admin.delete'),
      cancelText: t('common:cancel')
    });
    if (!confirmed) return;

    try {
      await deleteProduct(product.id);
      await confirm({
        title: t('admin.messages.success'),
        message: t('admin.messages.deleteSuccess'),
        type: 'success',
        confirmText: t('common:confirm')
      });
      loadProducts();
    } catch (error: unknown) {
      console.error('Failed to delete product:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('admin.messages.error'),
        message: t('admin.messages.deleteError') + ': ' + (message || t('common:error')),
        type: 'danger',
        confirmText: t('common:confirm')
      });
    }
  };

  const openMobileActions = (product: ShopItem) => {
    if (!isMobile) return;
    setMobileActionProduct(product);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPrice = priceInput.trim();
    const parsedPrice = trimmedPrice === '' ? NaN : Number.parseInt(trimmedPrice, 10);
    if (!Number.isInteger(parsedPrice) || parsedPrice < 1) {
      await confirm({
        title: t('admin.messages.error'),
        message: t('admin.form.priceInvalid'),
        type: 'danger',
        confirmText: t('common:confirm')
      });
      return;
    }

    const payloadBase = { ...formData, price: parsedPrice };

    try {
      if (editingProduct) {
        // 更新商品
        const updateData: UpdateProductRequest = {
          ...payloadBase,
          description: payloadBase.description || undefined,
          imageUrl: payloadBase.imageUrl || undefined,
        };
        await updateProduct(editingProduct.id, updateData);
        await confirm({
          title: t('admin.messages.success'),
          message: t('admin.messages.updateSuccess'),
          type: 'success',
          confirmText: t('common:confirm')
        });
      } else {
        // 创建商品
        const createData: CreateProductRequest = {
          name: payloadBase.name,
          description: payloadBase.description || undefined,
          imageUrl: payloadBase.imageUrl || undefined,
          price: payloadBase.price,
          rarity: 'common',
          sortOrder: payloadBase.sortOrder,
          allowedChildIds: payloadBase.allowedChildIds.length > 0 ? payloadBase.allowedChildIds : undefined
        };
        await createProduct(createData);
        await confirm({
          title: t('admin.messages.success'),
          message: t('admin.messages.createSuccess'),
          type: 'success',
          confirmText: t('common:confirm')
        });
      }
      setShowForm(false);
      loadProducts();
    } catch (error: unknown) {
      console.error('Failed to save product:', error);
      const maybeData = axios.isAxiosError(error) ? error.response?.data : null;
      const message =
        typeof maybeData === 'object' && maybeData !== null && 'message' in maybeData
          ? String((maybeData as { message?: unknown }).message ?? '')
          : '';
      await confirm({
        title: t('admin.messages.error'),
        message: (editingProduct ? t('admin.messages.updateError') : t('admin.messages.createError')) +
          ': ' + (message || t('common:error')),
        type: 'danger',
        confirmText: t('common:confirm')
      });
    }
  };

  const handleChildToggle = (childId: string) => {
    setFormData(prev => ({
      ...prev,
      allowedChildIds: prev.allowedChildIds.includes(childId)
        ? prev.allowedChildIds.filter(id => id !== childId)
        : [...prev.allowedChildIds, childId]
    }));
  };

  return (
    <div className="product-manager">
      <div className="manager-header">
        <h2>{t('admin.title')}</h2>
        <button className="btn-create" onClick={handleCreate}>
          ➕ {t('admin.create')}
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      ) : loadError ? (
        <div className="empty-state">
          <span className="empty-icon">⚠️</span>
          <p className="empty-text">{t('messages.loadError')}</p>
          <button className="btn-retry" onClick={loadProducts}>🔄 {t('admin.form.submit')}</button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <p className="empty-text">{t('admin.noProducts')}</p>
        </div>
      ) : (
        <>
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>{t('admin.table.product')}</th>
                  <th>{t('admin.table.description')}</th>
                  <th>{t('admin.table.points')}</th>
                  <th>{t('admin.table.enabled')}</th>
                  <th>{t('admin.table.edit')}</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, displayCount).map(product => (
                <tr
                  key={product.id}
                  className={isMobile ? 'pm-row-clickable' : undefined}
                  data-active={product.isActive ? '1' : '0'}
                  onClick={() => openMobileActions(product)}
                >
                  {isMobile ? (
                    <td className="pm-card-cell">
                      <div className="pm-card-main">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="table-image" />
                        ) : (
                          <div className="no-image" aria-hidden="true">📦</div>
                        )}
                        <div className="pm-card-text">
                          <div className="product-name">{product.name}</div>
                          {product.description ? (
                            <div className="pm-card-desc">{product.description}</div>
                          ) : null}
                          <div className="pm-card-meta">
                            <span className="price-badge">⭐ {product.price}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td>
                        <div className="pm-product-cell">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="table-image" />
                          ) : (
                            <div className="no-image" aria-hidden="true">📦</div>
                          )}
                          <div className="product-name">{product.name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="product-description">
                          {product.description || '-'}
                        </div>
                      </td>
                      <td>
                        <span className="price-badge">⭐ {product.price}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                          {product.isActive ? '✅' : '❌'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-edit"
                            type="button"
                            aria-label={t('admin.edit')}
                            title={t('admin.edit')}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(product);
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            type="button"
                            aria-label={t('admin.delete')}
                            title={t('admin.delete')}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product);
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {displayCount < products.length && (
            <div className="load-more-container">
              <button className="btn-load-more" onClick={() => setDisplayCount(prev => prev + 10)}>
                {t('loadMore')} ({products.length - displayCount} {t('remaining')})
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content apple-style" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProduct ? t('admin.edit') : t('admin.create')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> {t('admin.form.name')}
                </label>
                <input
                  type="text"
                  className={!formData.name ? 'input-error' : ''}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t('admin.form.namePlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.form.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={t('admin.form.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.form.imageUrl')}</label>
                <label className="checkbox-label-inline">
                  <input
                    type="checkbox"
                    checked={useDefaultImage}
                    onChange={(e) => {
                      setUseDefaultImage(e.target.checked);
                      if (e.target.checked) {
                        setFormData({...formData, imageUrl: ''});
                      }
                    }}
                  />
                  <span>使用默认商品图片</span>
                </label>
                {!useDefaultImage && (
                  <>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder={t('admin.form.imageUrlPlaceholder')}
                    />
                    {formData.imageUrl && (
                      <div className="image-preview">
                        <img src={formData.imageUrl} alt="Preview" onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                      </div>
                    )}
                  </>
                )}
                {useDefaultImage && (
                  <div className="image-preview">
                    <div className="default-image-placeholder">🎁</div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span> {t('admin.form.price')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  className={
                    priceInput.trim() === '' ||
                    !/^\d+$/.test(priceInput.trim()) ||
                    Number.parseInt(priceInput.trim(), 10) < 1
                      ? 'input-error'
                      : ''
                  }
                  value={priceInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v !== '' && !/^\d+$/.test(v)) return;
                    setPriceInput(v);
                    if (v !== '') {
                      setFormData((prev) => ({ ...prev, price: Number.parseInt(v, 10) }));
                    }
                  }}
                  placeholder={t('admin.form.pricePlaceholder')}
                  aria-invalid={
                    priceInput.trim() === '' ||
                    !/^\d+$/.test(priceInput.trim()) ||
                    Number.parseInt(priceInput.trim(), 10) < 1
                  }
                />
                <p className="field-hint">⭐ 默认 10 积分，可调整</p>
              </div>

              <div className="form-group">
                <label className="form-label">{t('admin.form.sortOrder')}</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})}
                  placeholder="100"
                />
                <p className="field-hint">📊 数字越小越靠前，默认 100</p>
              </div>

              {editingProduct && (
                <div className="form-group">
                  <label className="form-label">{t('admin.form.isActive')}</label>
                  <label className="pm-enable-checkbox-row">
                    <span className="pm-enable-cb-col">
                      <input
                        type="checkbox"
                        className="pm-is-active-checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                    </span>
                    <span className="pm-enable-checkbox-caption">
                      {formData.isActive ? t('admin.form.statusEnabled') : t('admin.form.statusDisabled')}
                    </span>
                  </label>
                </div>
              )}

              {children.length > 0 && (
                <div className="form-group">
                  <label className="form-label">{t('admin.form.allowedChildren')}</label>
                  <p className="hint">{t('admin.form.allowedChildrenHint')}</p>
                  <div className="children-checkboxes">
                    {children.map(child => (
                      <label key={child.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.allowedChildIds.includes(child.id)}
                          onChange={() => handleChildToggle(child.id)}
                        />
                        {child.name || child.nickname}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {t('admin.form.submit')}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  {t('admin.form.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile: tap card to open actions sheet */}
      {isMobile && mobileActionProduct && (
        <div
          className="pm-actions-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileActionProduct(null)}
        >
          <div className="pm-actions-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pm-actions-title">{mobileActionProduct.name}</div>
            <button
              className="pm-action-btn pm-action-edit"
              onClick={async () => {
                const p = mobileActionProduct;
                setMobileActionProduct(null);
                await handleEdit(p);
              }}
            >
              ✏️ {t('admin.edit')}
            </button>
            <button
              className="pm-action-btn pm-action-delete"
              onClick={async () => {
                const p = mobileActionProduct;
                setMobileActionProduct(null);
                await handleDelete(p);
              }}
            >
              🗑️ {t('admin.delete')}
            </button>
            <button className="pm-action-btn pm-action-cancel" onClick={() => setMobileActionProduct(null)}>
              {t('common:cancel')}
            </button>
          </div>
        </div>
      )}
      {ConfirmDialogComponent}
    </div>
  );
}
