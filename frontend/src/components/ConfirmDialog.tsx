import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConfirmDialog.css';
import './ConfirmDialog.mobile.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'info' | 'warning' | 'danger' | 'success';
}

/**
 * 自定义确认对话框组件
 * 替换浏览器原生的 window.confirm
 * 带有遮罩层和美化样式
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  // 点击遮罩层关闭对话框
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
      <div className={`confirm-dialog confirm-dialog-${type}`}>
        {title && <div className="confirm-dialog-title">{title}</div>}
        <div className="confirm-dialog-message">{message}</div>
        <div className="confirm-dialog-actions">
          <button
            className="confirm-dialog-btn confirm-dialog-btn-cancel"
            onClick={handleCancel}
          >
            {cancelText || t('dialog.cancel')}
          </button>
          <button
            className={`confirm-dialog-btn confirm-dialog-btn-confirm confirm-dialog-btn-${type}`}
            onClick={handleConfirm}
          >
            {confirmText || t('dialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
