"use client";

import { useState } from "react";
import { Lock, Key, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import { 
  Input, 
  Card,
  CardHeader,
  CardBody,
  Button,
  Divider,
  Chip
} from "@heroui/react";
import { DoctorFrame } from "@/components/layouts/";
import ToastNotification from "@/components/ui/ToastNotification";
import { useToast } from "@/hooks/useToast";
import { auth } from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function DoctorSettings() {
  const toast = useToast();
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!auth.currentUser) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (security.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        security.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, security.newPassword);
      
      toast.success("Đổi mật khẩu thành công!");
      setSecurity({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Change password error:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Mật khẩu hiện tại không đúng");
      } else if (error.code === "auth/weak-password") {
        toast.error("Mật khẩu mới quá yếu");
      } else {
        toast.error("Không thể đổi mật khẩu");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6) return { label: "Yếu", color: "danger" };
    if (password.length < 8) return { label: "Trung bình", color: "warning" };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: "Mạnh", color: "success" };
    }
    return { label: "Khá", color: "primary" };
  };

  const passwordStrength = getPasswordStrength(security.newPassword);

  return (
    <DoctorFrame title="Cài đặt">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShieldCheck className="text-teal-600" size={36} />
            Cài đặt tài khoản
          </h1>
          <p className="text-gray-600 mt-2">Quản lý bảo mật và thông tin tài khoản của bạn</p>
        </div>

        {/* Security Section */}
        <Card className="shadow-lg">
          <CardHeader className="flex gap-3 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lock size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Bảo mật</h3>
                <p className="text-sm text-gray-600">Thay đổi mật khẩu đăng nhập</p>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-6 space-y-6">
            {/* Security Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Lưu ý bảo mật:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Mật khẩu phải có ít nhất 6 ký tự</li>
                  <li>Nên sử dụng kết hợp chữ hoa, chữ thường và số</li>
                  <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                label="Mật khẩu hiện tại"
                placeholder="Nhập mật khẩu hiện tại"
                value={security.currentPassword}
                onValueChange={(v) => setSecurity({ ...security, currentPassword: v })}
                variant="bordered"
                labelPlacement="outside"
                startContent={<Key className="text-default-400" size={20} />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="focus:outline-none"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="text-default-400" size={20} />
                    ) : (
                      <Eye className="text-default-400" size={20} />
                    )}
                  </button>
                }
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-default-200 hover:border-purple-500 focus-within:!border-purple-500"
                }}
              />

              <div className="space-y-2">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  value={security.newPassword}
                  onValueChange={(v) => setSecurity({ ...security, newPassword: v })}
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Lock className="text-default-400" size={20} />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="focus:outline-none"
                    >
                      {showNewPassword ? (
                        <EyeOff className="text-default-400" size={20} />
                      ) : (
                        <Eye className="text-default-400" size={20} />
                      )}
                    </button>
                  }
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-default-200 hover:border-purple-500 focus-within:!border-purple-500"
                  }}
                />
                {passwordStrength && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Độ mạnh:</span>
                    <Chip size="sm" color={passwordStrength.color} variant="flat">
                      {passwordStrength.label}
                    </Chip>
                  </div>
                )}
              </div>

              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                value={security.confirmPassword}
                onValueChange={(v) => setSecurity({ ...security, confirmPassword: v })}
                variant="bordered"
                labelPlacement="outside"
                startContent={<ShieldCheck className="text-default-400" size={20} />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="text-default-400" size={20} />
                    ) : (
                      <Eye className="text-default-400" size={20} />
                    )}
                  </button>
                }
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-default-200 hover:border-purple-500 focus-within:!border-purple-500"
                }}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                color="secondary"
                size="lg"
                startContent={<Key size={20} />}
                onPress={handleChangePassword}
                isLoading={changingPassword}
                className="font-semibold"
              >
                Đổi mật khẩu
              </Button>
            </div>
          </CardBody>
        </Card>

        <ToastNotification
          message={toast.toast.message}
          type={toast.toast.type}
          isVisible={toast.toast.isVisible}
          onClose={toast.hideToast}
          duration={toast.toast.duration}
        />
      </div>
    </DoctorFrame>
  );
}
