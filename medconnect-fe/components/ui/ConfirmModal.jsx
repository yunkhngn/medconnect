import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Reusable Confirmation Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {function} props.onClose - Close handler
 * @param {function} props.onConfirm - Confirm action handler
 * @param {string} props.title - Modal title
 * @param {string} props.message - Main message/description
 * @param {string} props.itemName - Name of item (optional, shows in highlighted box)
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.variant - Visual style: 'danger' | 'warning' | 'info' | 'success' (default: 'danger')
 * @param {string} props.confirmText - Confirm button text (default based on variant)
 * @param {string} props.cancelText - Cancel button text (default: 'Hủy')
 * @param {boolean} props.showWarning - Show warning box at bottom (default: true)
 * @param {string} props.warningText - Custom warning text
 */
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  message,
  itemName,
  isLoading = false,
  variant = "danger",
  confirmText,
  cancelText = "Hủy",
  showWarning = true,
  warningText
}) {
  // Variant configurations
  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      color: "danger",
      bgColor: "bg-danger-50",
      borderColor: "border-danger",
      textColor: "text-danger",
      defaultConfirmText: "Xác nhận xóa",
      defaultWarning: "Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn."
    },
    warning: {
      icon: AlertCircle,
      color: "warning",
      bgColor: "bg-warning-50",
      borderColor: "border-warning",
      textColor: "text-warning",
      defaultConfirmText: "Xác nhận",
      defaultWarning: "Vui lòng kiểm tra kỹ trước khi thực hiện hành động này."
    },
    info: {
      icon: Info,
      color: "primary",
      bgColor: "bg-primary-50",
      borderColor: "border-primary",
      textColor: "text-primary",
      defaultConfirmText: "Xác nhận",
      defaultWarning: "Hành động này sẽ thay đổi dữ liệu trong hệ thống."
    },
    success: {
      icon: CheckCircle,
      color: "success",
      bgColor: "bg-success-50",
      borderColor: "border-success",
      textColor: "text-success",
      defaultConfirmText: "Xác nhận",
      defaultWarning: "Vui lòng xác nhận để tiếp tục."
    }
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const Icon = config.icon;
  const finalConfirmText = confirmText || config.defaultConfirmText;
  const finalWarningText = warningText || config.defaultWarning;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className={`flex gap-3 items-center ${config.textColor}`}>
              <div className={`${config.bgColor} p-2 rounded-full`}>
                <Icon size={24} className={config.textColor} />
              </div>
              <span>{title}</span>
            </ModalHeader>
            
            <ModalBody className="py-6">
              {itemName && (
                <div className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-r-lg p-4 mb-4`}>
                  <p className={`font-semibold ${config.textColor}-800 mb-1`}>Đối tượng:</p>
                  <p className={`${config.textColor}-700 text-lg font-mono`}>{itemName}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <p className="text-gray-700 text-base leading-relaxed">
                  {message}
                </p>
                
                {showWarning && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
                    <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-800 font-semibold text-sm">Lưu ý</p>
                      <p className="text-orange-700 text-xs">
                        {finalWarningText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onClose}
                isDisabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button 
                color={config.color}
                onPress={handleConfirm}
                isLoading={isLoading}
                startContent={!isLoading && <Icon size={18} />}
              >
                {isLoading ? "Đang xử lý..." : finalConfirmText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

