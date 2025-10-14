// app/activation-management/_components/activation-management.tsx
'use client'
import { useState, useEffect } from 'react';
import { deactivateDevice, getUserActivationsAndLicenses } from '@/lib/actions/activations';
import { Trash2, Loader2, Smartphone, Laptop, Globe } from 'lucide-react';

interface Activation {
  id: string;
  licenseKeyId: string;
  activatedAt: string;
  userId: string;
  deviceType: string | null;
  deviceModel: string | null;
  osVersion: string | null;
  browser: string | null;
  browserVersion: string | null;
  ipAddress: string | null;
}

interface License {
  id: string;
  key: string;
  type: 'license' | 'sublicense';
  parentLicenseId?: string;
}

interface ActivationManagementProps {
  userId: string;
  initialActivations: Activation[];
  initialLicenses: License[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0];
}

function getDeviceIcon(deviceType: string | null) {
  switch (deviceType?.toLowerCase()) {
    case 'android':
    case 'ios':
      return <Smartphone className="inline-block mr-2" size={16} />;
    case 'mac':
    case 'windows':
    case 'linux':
      return <Laptop className="inline-block mr-2" size={16} />;
    default:
      return <Globe className="inline-block mr-2" size={16} />;
  }
}

export default function ActivationManagement({ userId, initialActivations, initialLicenses }: ActivationManagementProps) {
  const [activations, setActivations] = useState(initialActivations);
  const [licenses, setLicenses] = useState(initialLicenses);
  const [selectedLicense, setSelectedLicense] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getUserActivationsAndLicenses(userId, selectedLicense);
        if (result.success) {
          const data = JSON.parse(result.success);
          setActivations(data.activations);
          setLicenses(data.licenses);
        } else {
          console.error('Failed to fetch data:', result.error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, selectedLicense]);

  const handleDeactivate = async (activationId: string) => {
    setIsLoading(true);
    const result = await deactivateDevice(userId, activationId);
    if (result.success) {
      setActivations(activations.filter(activation => activation.id !== activationId));
    } else {
      console.error('Failed to deactivate device:', result.error);
      // Optionally, show an error message to the user
    }
    setIsLoading(false);
  };

  const getLicenseInfo = (licenseKeyId: string) => {
    const license = licenses.find(l => l.id === licenseKeyId);
    if (license) {
      return license.type === 'license' 
        ? `License: ${license.key.slice(0, 8)}...`
        : `Sub-License: ${license.key.slice(0, 8)}... (Parent: ${licenses.find(l => l.id === license.parentLicenseId)?.key.slice(0, 8)}...)`;
    }
    return 'Unknown License';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Activation Management</h1>
      <div className="mb-6">
        <select 
          value={selectedLicense} 
          onChange={(e) => setSelectedLicense(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Licenses and Sub-Licenses</option>
          {licenses.map(license => (
            <option key={license.id} value={license.id}>
              {license.type === 'license' ? 'License: ' : 'Sub-License: '}{license.key.slice(0, 8)}...
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {activations.map(activation => (
              <li key={activation.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Activated: {formatDate(activation.activatedAt)}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {getLicenseInfo(activation.licenseKeyId)}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    User ID: {activation.userId}
                  </p>
                  {activation.deviceType && (
                    <p className="text-sm text-gray-500 truncate">
                      {getDeviceIcon(activation.deviceType)}
                      {activation.deviceType}
                      {activation.deviceModel && ` ${activation.deviceModel}`}
                      {activation.osVersion && ` (${activation.osVersion})`}
                    </p>
                  )}
                  {(activation.browser || activation.browserVersion) && (
                    <p className="text-sm text-gray-500 truncate">
                      Browser: {activation.browser || 'Unknown'}
                      {activation.browserVersion && ` ${activation.browserVersion}`}
                    </p>
                  )}
                  {activation.ipAddress && (
                    <p className="text-sm text-gray-500 truncate">
                      IP: {activation.ipAddress}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleDeactivate(activation.id)}
                  className="ml-4 bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={isLoading || activation.userId !== userId}
                >
                  <Trash2 size={20} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}