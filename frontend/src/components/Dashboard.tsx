import React, { useState, useEffect } from "react";
import { RevenueSummary } from "./RevenueSummary";
import Api from "../apiConfig";

// Fallback hardcoded properties with tenant mapping
const FALLBACK_PROPERTIES = [
  { id: 'prop-001', name: 'Beach House Alpha', tenant: 'tenant-a' },
  { id: 'prop-002', name: 'City Apartment Downtown', tenant: 'tenant-a' },
  { id: 'prop-003', name: 'Country Villa Estate', tenant: 'tenant-a' },
  { id: 'prop-001', name: 'Mountain Lodge Beta', tenant: 'tenant-b' },
  { id: 'prop-004', name: 'Lakeside Cottage', tenant: 'tenant-b' },
  { id: 'prop-005', name: 'Urban Loft Modern', tenant: 'tenant-b' }
];

const Dashboard: React.FC = () => {
  const [properties, setProperties] = useState<Array<{ id: string, name: string }>>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [loading, setLoading] = useState(true);

  const getUserTenant = () => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key || '');
        if (value?.includes('sunset')) return 'tenant-a';
        if (value?.includes('ocean')) return 'tenant-b';
      }
    } catch (e) {
      console.error('Error getting tenant:', e);
    }
    return 'tenant-a';
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await Api.get('/dashboard/properties');
        console.log('API Response:', response);

        const data = Array.isArray(response) ? response : (response?.data || null);

        if (data && Array.isArray(data) && data.length > 0) {
          setProperties(data);
          setSelectedProperty(data[0].id);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        console.error('API failed, using fallback:', error);

        // Fallback to hardcoded properties filtered by tenant
        const tenantId = getUserTenant();
        const filteredProps = FALLBACK_PROPERTIES.filter(p => p.tenant === tenantId);
        console.log('Using fallback for tenant:', tenantId, filteredProps);

        setProperties(filteredProps);
        if (filteredProps.length > 0) {
          setSelectedProperty(filteredProps[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (properties.length === 0) {
    return <div className="p-4">No properties found</div>;
  }

  return (
    <div className="p-4 lg:p-6 min-h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Property Management Dashboard</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">Revenue Overview</h2>
                <p className="text-sm lg:text-base text-gray-600">
                  Monthly performance insights for your properties
                </p>
              </div>

              <div className="flex flex-col sm:items-end">
                <label className="text-xs font-medium text-gray-700 mb-1">Select Property</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="block w-full sm:w-auto min-w-[200px] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {properties.map((property, idx) => (
                    <option key={`${property.id}-${idx}`} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedProperty && <RevenueSummary propertyId={selectedProperty} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;