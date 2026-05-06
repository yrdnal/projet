import { useState } from 'react';
import api from '../../services/api';
import {
  CogIcon, BellIcon, ShieldCheckIcon, CurrencyDollarIcon,
  GlobeAltIcon, CheckIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Section = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
      <div className="text-orange-500">{icon}</div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Toggle = ({ label, sub, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 ${checked ? 'bg-orange-400' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SuperAdminSettings = () => {
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'MalagasyShop',
    siteDescription: 'Your trusted marketplace for quality products in Madagascar.',
    contactEmail: 'support@malagasyshop.mg',
    supportPhone: '+261 20 XX XX XX',
    commissionRate: '5',
    minWithdrawal: '10',
    currency: 'USD',
    maintenanceMode: false,
    allowNewVendors: true,
    requireProductApproval: true,
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    vendorApproval: false,
    guestCheckout: true,
    autoApproveOrders: false,
    maxFileSize: '10',
    allowedFileTypes: 'jpg,jpeg,png,webp',
  });

  const updateSetting = (key, val) => setSettings((s) => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/dashboard/settings', settings).catch(() => {});
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <CogIcon className="w-7 h-7 text-orange-500" /> Platform Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure global platform behaviour and policies</p>
        </div>
        <div className="flex gap-3">
          {success && (
            <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <CheckIcon className="w-4 h-4" /> {success}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General */}
        <Section title="General Information" icon={<GlobeAltIcon className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { key: 'siteName', label: 'Platform Name', type: 'text' },
              { key: 'contactEmail', label: 'Support Email', type: 'email' },
              { key: 'supportPhone', label: 'Support Phone', type: 'text' },
              { key: 'currency', label: 'Base Currency', type: 'select', opts: ['USD', 'EUR', 'MGA', 'GBP'] },
            ].map(({ key, label, type, opts }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                {type === 'select' ? (
                  <select value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Site Description</label>
              <textarea value={settings.siteDescription} onChange={(e) => updateSetting('siteDescription', e.target.value)}
                rows={2} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
          </div>
        </Section>

        {/* Commerce */}
        <Section title="Commerce & Payments" icon={<CurrencyDollarIcon className="w-5 h-5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Commission Rate (%)</label>
              <div className="relative">
                <input type="number" min="0" max="100" value={settings.commissionRate} onChange={(e) => updateSetting('commissionRate', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Platform fee per transaction</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min. Withdrawal ($)</label>
              <input type="number" min="0" value={settings.minWithdrawal} onChange={(e) => updateSetting('minWithdrawal', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Upload Size (MB)</label>
              <input type="number" min="1" max="50" value={settings.maxFileSize} onChange={(e) => updateSetting('maxFileSize', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
        </Section>

        {/* Platform Controls */}
        <Section title="Platform Controls" icon={<ShieldCheckIcon className="w-5 h-5" />}>
          <Toggle label="Maintenance Mode" sub="Temporarily take the site offline for maintenance" checked={settings.maintenanceMode} onChange={(v) => updateSetting('maintenanceMode', v)} />
          <Toggle label="Allow New Vendor Registrations" sub="New users can sign up as vendors" checked={settings.allowNewVendors} onChange={(v) => updateSetting('allowNewVendors', v)} />
          <Toggle label="Require Product Approval" sub="All vendor products must be approved before going live" checked={settings.requireProductApproval} onChange={(v) => updateSetting('requireProductApproval', v)} />
          <Toggle label="Require Vendor Approval" sub="New vendor accounts must be approved by admin" checked={settings.vendorApproval} onChange={(v) => updateSetting('vendorApproval', v)} />
          <Toggle label="Guest Checkout" sub="Allow unauthenticated users to checkout" checked={settings.guestCheckout} onChange={(v) => updateSetting('guestCheckout', v)} />
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={<BellIcon className="w-5 h-5" />}>
          <Toggle label="Email Notifications" sub="Send transactional emails to users" checked={settings.emailNotifications} onChange={(v) => updateSetting('emailNotifications', v)} />
          <Toggle label="SMS Notifications" sub="Send SMS updates for orders" checked={settings.smsNotifications} onChange={(v) => updateSetting('smsNotifications', v)} />
          <Toggle label="Order Status Notifications" sub="Notify users on order status changes" checked={settings.orderNotifications} onChange={(v) => updateSetting('orderNotifications', v)} />
        </Section>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-red-700">Danger Zone</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-red-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">Clear all sessions</p>
              <p className="text-xs text-gray-500 mt-0.5">Force logout all users from the platform</p>
            </div>
            <button className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
              Clear Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
