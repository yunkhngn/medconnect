import React, { useState } from 'react';
import { AdminFrame, Grid } from '@/components/layouts/';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Switch,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Chip,
} from '@heroui/react';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    GET_SETTINGS: '/settings',
    UPDATE_SETTINGS: '/settings',
    UPDATE_EMAIL: '/settings/email',
    UPDATE_PAYMENT: '/settings/payment',
  },
};

const SystemConfig = () => {
  const [isSaving, setIsSaving] = useState(false);
  
  const isProduction = process.env.NODE_ENV === 'production';

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'MedConnect',
    siteDescription: 'Nền tảng đặt lịch khám bệnh trực tuyến',
    contactEmail: 'support@medconnect.vn',
    contactPhone: '1900-xxxx',
    address: 'Hà Nội, Việt Nam',
    maintenanceMode: false,
    allowRegistration: true,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@medconnect.vn',
    smtpPassword: '',
    fromEmail: 'noreply@medconnect.vn',
    fromName: 'MedConnect',
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'VND',
    paymentGateway: 'vnpay',
    vnpayTmnCode: '',
    vnpayHashSecret: '',
    momoPartnerCode: '',
    momoAccessKey: '',
    momoSecretKey: '',
  });

  // Appointment Settings
  const [appointmentSettings, setAppointmentSettings] = useState({
    bookingAdvanceDays: 30,
    cancelBeforeHours: 24,
    autoConfirm: false,
    reminderHours: 24,
  });

  const paymentGateways = [
    { value: 'vnpay', label: 'VNPay' },
    { value: 'momo', label: 'MoMo' },
    { value: 'zalopay', label: 'ZaloPay' },
  ];

  const currencies = [
    { value: 'VND', label: 'VNĐ - Việt Nam Đồng' },
    { value: 'USD', label: 'USD - US Dollar' },
  ];

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      // TODO: API call
      // await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.UPDATE_SETTINGS, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(generalSettings),
      // });
      
      setTimeout(() => {
        alert('Đã lưu cài đặt chung!');
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setIsSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setIsSaving(true);
    try {
      // TODO: API call
      setTimeout(() => {
        alert('Đã lưu cài đặt email!');
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving email settings:', error);
      setIsSaving(false);
    }
  };

  const handleSavePayment = async () => {
    setIsSaving(true);
    try {
      // TODO: API call
      setTimeout(() => {
        alert('Đã lưu cài đặt thanh toán!');
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      setIsSaving(false);
    }
  };

  // Left Panel - Quick Info
  const leftPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Trạng thái hệ thống</h3>
        <div className="space-y-3">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Server Status</p>
            <Chip color="success" size="sm" className="mt-2">Online</Chip>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Database</p>
            <Chip color="primary" size="sm" className="mt-2">Connected</Chip>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Email Service</p>
            <Chip color="secondary" size="sm" className="mt-2">Active</Chip>
          </div>
        </div>
      </div>

      <Card>
        <CardBody>
          <h4 className="font-semibold mb-3">Thông tin phiên bản</h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">Version: <span className="font-medium">1.0.0</span></p>
            <p className="text-gray-600">Build: <span className="font-medium">10.10.2025</span></p>
            <p className="text-gray-600">Environment: <span className="font-medium">{isProduction ? 'Production' : 'Development'}</span></p>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // Right Panel - Settings Forms
  const rightPanel = (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Cài đặt chung</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Input
            label="Tên website"
            value={generalSettings.siteName}
            onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
          />
          <Textarea
            label="Mô tả website"
            value={generalSettings.siteDescription}
            onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
            minRows={2}
          />
          <Input
            label="Email liên hệ"
            type="email"
            value={generalSettings.contactEmail}
            onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
          />
          <Input
            label="Số điện thoại"
            value={generalSettings.contactPhone}
            onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
          />
          <Input
            label="Địa chỉ"
            value={generalSettings.address}
            onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
          />
          
          <div className="space-y-3 pt-4">
            <Switch
              isSelected={generalSettings.maintenanceMode}
              onValueChange={(value) => setGeneralSettings({ ...generalSettings, maintenanceMode: value })}
            >
              <span className="text-sm">Chế độ bảo trì</span>
            </Switch>
            <Switch
              isSelected={generalSettings.allowRegistration}
              onValueChange={(value) => setGeneralSettings({ ...generalSettings, allowRegistration: value })}
            >
              <span className="text-sm">Cho phép đăng ký mới</span>
            </Switch>
          </div>

          <Button color="primary" onPress={handleSaveGeneral} isLoading={isSaving}>
            Lưu cài đặt chung
          </Button>
        </CardBody>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Cài đặt Email</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              value={emailSettings.smtpHost}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
            />
            <Input
              label="SMTP Port"
              value={emailSettings.smtpPort}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
            />
            <Input
              label="SMTP User"
              value={emailSettings.smtpUser}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
            />
            <Input
              label="SMTP Password"
              type="password"
              value={emailSettings.smtpPassword}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
            />
            <Input
              label="From Email"
              value={emailSettings.fromEmail}
              onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
            />
            <Input
              label="From Name"
              value={emailSettings.fromName}
              onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
            />
          </div>

          <Button color="primary" onPress={handleSaveEmail} isLoading={isSaving}>
            Lưu cài đặt Email
          </Button>
        </CardBody>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Cài đặt Thanh toán</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Đơn vị tiền tệ"
              selectedKeys={[paymentSettings.currency]}
              onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
            >
              {currencies.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Cổng thanh toán"
              selectedKeys={[paymentSettings.paymentGateway]}
              onChange={(e) => setPaymentSettings({ ...paymentSettings, paymentGateway: e.target.value })}
            >
              {paymentGateways.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {paymentSettings.paymentGateway === 'vnpay' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="VNPay TMN Code"
                value={paymentSettings.vnpayTmnCode}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, vnpayTmnCode: e.target.value })}
              />
              <Input
                label="VNPay Hash Secret"
                type="password"
                value={paymentSettings.vnpayHashSecret}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, vnpayHashSecret: e.target.value })}
              />
            </div>
          )}

          <Button color="primary" onPress={handleSavePayment} isLoading={isSaving}>
            Lưu cài đặt Thanh toán
          </Button>
        </CardBody>
      </Card>

      {/* Appointment Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">Cài đặt Lịch hẹn</h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Input
            label="Đặt lịch trước (ngày)"
            type="number"
            value={appointmentSettings.bookingAdvanceDays}
            onChange={(e) => setAppointmentSettings({ ...appointmentSettings, bookingAdvanceDays: e.target.value })}
          />
          <Input
            label="Hủy lịch trước (giờ)"
            type="number"
            value={appointmentSettings.cancelBeforeHours}
            onChange={(e) => setAppointmentSettings({ ...appointmentSettings, cancelBeforeHours: e.target.value })}
          />
          <Input
            label="Nhắc nhở trước (giờ)"
            type="number"
            value={appointmentSettings.reminderHours}
            onChange={(e) => setAppointmentSettings({ ...appointmentSettings, reminderHours: e.target.value })}
          />
          
          <Switch
            isSelected={appointmentSettings.autoConfirm}
            onValueChange={(value) => setAppointmentSettings({ ...appointmentSettings, autoConfirm: value })}
          >
            <span className="text-sm">Tự động xác nhận lịch hẹn</span>
          </Switch>

          <Button color="primary" isLoading={isSaving}>
            Lưu cài đặt Lịch hẹn
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <AdminFrame title="Cài đặt Hệ thống">
      <Grid leftChildren={leftPanel} rightChildren={rightPanel} />
    </AdminFrame>
  );
};

export default SystemConfig;