import axios from 'axios';

// Shippo API configuration
const SHIPPO_API_KEY = import.meta.env.VITE_SHIPPO_API_KEY || 'shippo_test_key';
const SHIPPO_API_URL = 'https://api.goshippo.com';

// Fixed box dimensions for quilts (in inches)
const QUILT_BOX = {
  length: 24,
  width: 24,
  height: 12,
  weight: 10, // lbs
  distance_unit: 'in',
  mass_unit: 'lb'
};

// Shippo headers
const shippoHeaders = {
  'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
  'Content-Type': 'application/json'
};

export interface ShippingAddress {
  name: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  country: string; // CA or US
  phone?: string;
  email?: string;
}

export interface ShippingRate {
  object_id: string;
  amount: string;
  currency: string;
  provider: string;
  service_level: string;
  estimated_days: number;
  duration_terms: string;
  carrier_account: string;
}

export interface ShippingLabel {
  tracking_number: string;
  tracking_url_provider: string;
  label_url: string;
  commercial_invoice_url?: string;
}

// Chetwynd, BC post office address (sender)
const SENDER_ADDRESS: ShippingAddress = {
  name: 'Scenic Valley Quilts - Rejeanne Doucet',
  street1: '5033 47th St', // Chetwynd Post Office
  city: 'Chetwynd',
  state: 'BC',
  zip: 'V0C 1J0',
  country: 'CA',
  phone: '250-788-3321', // Chetwynd Post Office phone
  email: import.meta.env.VITE_CONTACT_EMAIL || 'rejdoucet@xplornet.com'
};

// Calculate shipping rates
export const calculateShippingRates = async (
  toAddress: ShippingAddress,
  itemCount: number = 1
): Promise<ShippingRate[]> => {
  try {
    // For demo/test mode, return mock rates
    if (!SHIPPO_API_KEY || SHIPPO_API_KEY === 'shippo_test_key') {
      return getMockRates(toAddress, itemCount);
    }

    // Create parcels based on item count
    const parcels = Array(itemCount).fill(QUILT_BOX);

    // Create shipment
    const shipmentData = {
      address_from: SENDER_ADDRESS,
      address_to: toAddress,
      parcels: parcels,
      async: false
    };

    const response = await axios.post(
      `${SHIPPO_API_URL}/shipments`,
      shipmentData,
      { headers: shippoHeaders }
    );

    console.log('Shippo API response:', response.data);

    // Filter and return available rates
    const rates = response.data.rates || [];
    
    // If no rates returned, fall back to mock rates
    if (rates.length === 0) {
      console.log('No rates from Shippo API, using mock rates');
      return getMockRates(toAddress, itemCount);
    }
    
    // Filter for Canada Post (Canada) and USPS (USA) rates
    const filteredRates = rates.filter((rate: ShippingRate) => {
      if (toAddress.country === 'CA') {
        return rate.provider === 'Canada Post';
      } else {
        return rate.provider === 'USPS';
      }
    }).map((rate: ShippingRate) => ({
      ...rate,
      service_level: formatServiceLevel(rate.service_level, rate.provider)
    }));

    // If no rates after filtering, return mock rates
    if (filteredRates.length === 0) {
      console.log('No rates after filtering, using mock rates');
      return getMockRates(toAddress, itemCount);
    }

    return filteredRates;

  } catch (error) {
    console.error('Failed to calculate shipping rates:', error);
    // Return fallback rates if API fails
    return getMockRates(toAddress, itemCount);
  }
};

// Generate shipping label
export const generateShippingLabel = async (
  rateId: string,
  orderNumber: string
): Promise<ShippingLabel> => {
  try {
    // For demo/test mode, return mock label
    if (!SHIPPO_API_KEY || SHIPPO_API_KEY === 'shippo_test_key') {
      return {
        tracking_number: `DEMO${orderNumber}`,
        tracking_url_provider: 'https://www.canadapost.ca/track',
        label_url: '/sample-shipping-label.pdf',
        commercial_invoice_url: undefined
      };
    }

    // Create transaction to purchase label
    const transactionData = {
      rate: rateId,
      label_file_type: 'PDF',
      async: false
    };

    const response = await axios.post(
      `${SHIPPO_API_URL}/transactions`,
      transactionData,
      { headers: shippoHeaders }
    );

    const transaction = response.data;

    if (transaction.status !== 'SUCCESS') {
      throw new Error(transaction.messages?.join(', ') || 'Failed to create label');
    }

    return {
      tracking_number: transaction.tracking_number,
      tracking_url_provider: transaction.tracking_url_provider,
      label_url: transaction.label_url,
      commercial_invoice_url: transaction.commercial_invoice_url
    };

  } catch (error) {
    console.error('Failed to generate shipping label:', error);
    throw error;
  }
};

// Format service level names for display
const formatServiceLevel = (level: string, provider: string): string => {
  const serviceNames: Record<string, string> = {
    // Canada Post services
    'canada_post_regular_parcel': 'Regular Parcel (4-8 business days)',
    'canada_post_expedited_parcel': 'Expedited Parcel (2-3 business days)',
    'canada_post_xpresspost': 'Xpresspost (1-2 business days)',
    'canada_post_priority': 'Priority (Next business day)',
    
    // USPS services
    'usps_priority': 'USPS Priority Mail (1-3 business days)',
    'usps_priority_express': 'USPS Priority Mail Express (1-2 business days)',
    'usps_ground_advantage': 'USPS Ground Advantage (2-5 business days)',
    'usps_first_class_package': 'USPS First-Class Package (2-5 business days)'
  };

  const key = `${provider.toLowerCase().replace(' ', '_')}_${level.toLowerCase().replace(' ', '_')}`;
  return serviceNames[key] || level;
};

// Mock rates for testing/demo
const getMockRates = (toAddress: ShippingAddress, itemCount: number): ShippingRate[] => {
  const baseRate = toAddress.country === 'CA' ? 15 : 25; // Base rate in CAD
  const perItemRate = 5; // Additional cost per item
  
  if (toAddress.country === 'CA') {
    return [
      {
        object_id: 'mock_regular',
        amount: (baseRate + (itemCount - 1) * perItemRate).toFixed(2),
        currency: 'CAD',
        provider: 'Canada Post',
        service_level: 'Regular Parcel (4-8 business days)',
        estimated_days: 6,
        duration_terms: 'BUSINESS_DAYS',
        carrier_account: 'mock_account'
      },
      {
        object_id: 'mock_expedited',
        amount: (baseRate * 1.5 + (itemCount - 1) * perItemRate).toFixed(2),
        currency: 'CAD',
        provider: 'Canada Post',
        service_level: 'Expedited Parcel (2-3 business days)',
        estimated_days: 3,
        duration_terms: 'BUSINESS_DAYS',
        carrier_account: 'mock_account'
      },
      {
        object_id: 'mock_xpresspost',
        amount: (baseRate * 2 + (itemCount - 1) * perItemRate).toFixed(2),
        currency: 'CAD',
        provider: 'Canada Post',
        service_level: 'Xpresspost (1-2 business days)',
        estimated_days: 2,
        duration_terms: 'BUSINESS_DAYS',
        carrier_account: 'mock_account'
      }
    ];
  } else {
    // USA rates
    return [
      {
        object_id: 'mock_usps_ground',
        amount: (baseRate + (itemCount - 1) * perItemRate).toFixed(2),
        currency: 'CAD',
        provider: 'USPS',
        service_level: 'USPS Ground Advantage (2-5 business days)',
        estimated_days: 5,
        duration_terms: 'BUSINESS_DAYS',
        carrier_account: 'mock_account'
      },
      {
        object_id: 'mock_usps_priority',
        amount: (baseRate * 1.5 + (itemCount - 1) * perItemRate).toFixed(2),
        currency: 'CAD',
        provider: 'USPS',
        service_level: 'USPS Priority Mail (1-3 business days)',
        estimated_days: 3,
        duration_terms: 'BUSINESS_DAYS',
        carrier_account: 'mock_account'
      },
      {
        object_id: 'mock_usps_express',
        amount: (baseRate * 2.5 + (itemCount - 1) * perItemRate).toFixed(2),
        currency: 'CAD',
        provider: 'USPS',
        service_level: 'USPS Priority Mail Express (1-2 business days)',
        estimated_days: 2,
        duration_terms: 'BUSINESS_DAYS',
        carrier_account: 'mock_account'
      }
    ];
  }
};

// Validate postal/zip code
export const validatePostalCode = (code: string, country: string): boolean => {
  if (country === 'CA') {
    // Canadian postal code format: A1A 1A1
    return /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(code);
  } else if (country === 'US') {
    // US ZIP code format: 12345 or 12345-6789
    return /^\d{5}(-\d{4})?$/.test(code);
  }
  return false;
}; 