import { z } from 'zod';
import { prisma } from './database';

// Common interfaces
export interface Address {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Package {
  weight: number; // in pounds
  length: number; // in inches
  width: number;
  height: number;
  value?: number; // declared value
  description?: string;
}

export interface ShipmentRequest {
  from: Address;
  to: Address;
  packages: Package[];
  serviceType: string;
  options?: {
    signatureRequired?: boolean;
    saturdayDelivery?: boolean;
    insurance?: number;
    codAmount?: number;
    dryIce?: boolean;
    hazmat?: boolean;
  };
}

export interface RateResponse {
  carrier: string;
  service: string;
  cost: number;
  currency: string;
  transitTime?: string;
  deliveryDate?: Date;
  guaranteedDelivery?: boolean;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  location?: string;
  timestamp: Date;
  description: string;
  signedBy?: string;
  deliveryDate?: Date;
}

export interface LabelResponse {
  trackingNumber: string;
  labelUrl: string;
  labelFormat: 'PDF' | 'PNG' | 'ZPL';
  cost: number;
  currency: string;
}

// Validation schemas
const addressSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(2),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional()
});

const packageSchema = z.object({
  weight: z.number().positive(),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  value: z.number().positive().optional(),
  description: z.string().optional()
});

const shipmentRequestSchema = z.object({
  from: addressSchema,
  to: addressSchema,
  packages: z.array(packageSchema).min(1),
  serviceType: z.string(),
  options: z.object({
    signatureRequired: z.boolean().optional(),
    saturdayDelivery: z.boolean().optional(),
    insurance: z.number().optional(),
    codAmount: z.number().optional(),
    dryIce: z.boolean().optional(),
    hazmat: z.boolean().optional()
  }).optional()
});

// Base carrier class
abstract class BaseCarrier {
  protected apiKey: string;
  protected apiSecret?: string;
  protected baseUrl: string;
  protected testMode: boolean;

  constructor(apiKey: string, apiSecret?: string, testMode = false) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.testMode = testMode;
    this.baseUrl = this.getBaseUrl();
  }

  protected abstract getBaseUrl(): string;
  abstract getName(): string;
  abstract getServices(): { code: string; name: string; description: string }[];
  abstract getRates(request: ShipmentRequest): Promise<RateResponse[]>;
  abstract createShipment(request: ShipmentRequest): Promise<LabelResponse>;
  abstract trackShipment(trackingNumber: string): Promise<TrackingInfo[]>;
  abstract cancelShipment(trackingNumber: string): Promise<boolean>;

  protected async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Exodus-Shipping/1.0',
      ...this.getAuthHeaders(),
      ...headers
    };

    try {
      const response = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${this.getName()} API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`${this.getName()} API request failed:`, error);
      throw error;
    }
  }

  protected abstract getAuthHeaders(): Record<string, string>;

  protected validateRequest(request: ShipmentRequest): void {
    try {
      shipmentRequestSchema.parse(request);
    } catch (error) {
      throw new Error(`Invalid shipment request: ${error}`);
    }
  }
}

// FedEx carrier implementation
class FedExCarrier extends BaseCarrier {
  private accountNumber: string;
  private meterNumber: string;

  constructor(apiKey: string, apiSecret: string, accountNumber: string, meterNumber: string, testMode = false) {
    super(apiKey, apiSecret, testMode);
    this.accountNumber = accountNumber;
    this.meterNumber = meterNumber;
  }

  protected getBaseUrl(): string {
    return this.testMode 
      ? 'https://apis-sandbox.fedex.com'
      : 'https://apis.fedex.com';
  }

  getName(): string {
    return 'FedEx';
  }

  getServices() {
    return [
      { code: 'FEDEX_GROUND', name: 'FedEx Ground', description: 'Ground delivery service' },
      { code: 'FEDEX_EXPRESS_SAVER', name: 'FedEx Express Saver', description: '3 business days' },
      { code: 'FEDEX_2_DAY', name: 'FedEx 2Day', description: '2 business days' },
      { code: 'STANDARD_OVERNIGHT', name: 'FedEx Standard Overnight', description: 'Next business day' },
      { code: 'PRIORITY_OVERNIGHT', name: 'FedEx Priority Overnight', description: 'Next business day by 10:30 AM' },
      { code: 'FIRST_OVERNIGHT', name: 'FedEx First Overnight', description: 'Next business day by 8:00 AM' }
    ];
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'X-locale': 'en_US'
    };
  }

  async getRates(request: ShipmentRequest): Promise<RateResponse[]> {
    this.validateRequest(request);

    const rateRequest = {
      accountNumber: {
        value: this.accountNumber
      },
      requestedShipment: {
        shipper: this.formatAddress(request.from),
        recipient: this.formatAddress(request.to),
        serviceType: request.serviceType,
        packagingType: 'YOUR_PACKAGING',
        requestedPackageLineItems: request.packages.map((pkg, index) => ({
          sequenceNumber: index + 1,
          groupPackageCount: 1,
          weight: {
            units: 'LB',
            value: pkg.weight
          },
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
            units: 'IN'
          },
          declaredValue: pkg.value ? {
            amount: pkg.value,
            currency: 'USD'
          } : undefined
        }))
      }
    };

    const response = await this.makeRequest('/rate/v1/rates/quotes', 'POST', rateRequest);
    
    return response.output.rateReplyDetails.map((rate: any) => ({
      carrier: 'FedEx',
      service: rate.serviceDescription?.description || rate.serviceType,
      cost: parseFloat(rate.ratedShipmentDetails[0].totalNetCharge),
      currency: rate.ratedShipmentDetails[0].currency,
      transitTime: rate.operationalDetail?.transitTime,
      deliveryDate: rate.operationalDetail?.deliveryDate ? new Date(rate.operationalDetail.deliveryDate) : undefined,
      guaranteedDelivery: rate.operationalDetail?.deliveryDay !== undefined
    }));
  }

  async createShipment(request: ShipmentRequest): Promise<LabelResponse> {
    this.validateRequest(request);

    const shipmentRequest = {
      labelResponseOptions: 'URL_ONLY',
      requestedShipment: {
        shipper: this.formatAddress(request.from),
        recipients: [this.formatAddress(request.to)],
        serviceType: request.serviceType,
        packagingType: 'YOUR_PACKAGING',
        shippingChargesPayment: {
          paymentType: 'SENDER'
        },
        labelSpecification: {
          imageType: 'PDF',
          labelStockType: 'PAPER_85X11_TOP_HALF_LABEL'
        },
        requestedPackageLineItems: request.packages.map((pkg, index) => ({
          sequenceNumber: index + 1,
          weight: {
            units: 'LB',
            value: pkg.weight
          },
          dimensions: {
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
            units: 'IN'
          }
        }))
      },
      accountNumber: {
        value: this.accountNumber
      }
    };

    const response = await this.makeRequest('/ship/v1/shipments', 'POST', shipmentRequest);
    const shipmentOutput = response.output.transactionShipments[0];

    return {
      trackingNumber: shipmentOutput.pieceResponses[0].trackingNumber,
      labelUrl: shipmentOutput.pieceResponses[0].packageDocuments[0].url,
      labelFormat: 'PDF',
      cost: parseFloat(shipmentOutput.shipmentRating.totalNetCharge),
      currency: shipmentOutput.shipmentRating.currency
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo[]> {
    const trackRequest = {
      includeDetailedScans: true,
      trackingInfo: [{
        trackingNumberInfo: {
          trackingNumber
        }
      }]
    };

    const response = await this.makeRequest('/track/v1/trackingnumbers', 'POST', trackRequest);
    const trackingOutput = response.output.completeTrackResults[0].trackResults[0];

    return trackingOutput.scanEvents?.map((event: any) => ({
      trackingNumber,
      status: event.eventDescription,
      location: event.scanLocation?.city + ', ' + event.scanLocation?.stateOrProvinceCode,
      timestamp: new Date(event.date),
      description: event.eventDescription,
      signedBy: event.signedByName
    })) || [];
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    const cancelRequest = {
      accountNumber: {
        value: this.accountNumber
      },
      trackingNumber
    };

    try {
      await this.makeRequest('/ship/v1/shipments/cancel', 'PUT', cancelRequest);
      return true;
    } catch (error) {
      console.error('FedEx shipment cancellation failed:', error);
      return false;
    }
  }

  private formatAddress(address: Address) {
    return {
      contact: {
        personName: address.name,
        companyName: address.company,
        phoneNumber: address.phone,
        emailAddress: address.email
      },
      address: {
        streetLines: [address.street1, address.street2].filter(Boolean),
        city: address.city,
        stateOrProvinceCode: address.state,
        postalCode: address.postalCode,
        countryCode: address.country
      }
    };
  }
}

// UPS carrier implementation
class UPSCarrier extends BaseCarrier {
  private accountNumber: string;

  constructor(apiKey: string, apiSecret: string, accountNumber: string, testMode = false) {
    super(apiKey, apiSecret, testMode);
    this.accountNumber = accountNumber;
  }

  protected getBaseUrl(): string {
    return this.testMode 
      ? 'https://wwwcie.ups.com/api'
      : 'https://onlinetools.ups.com/api';
  }

  getName(): string {
    return 'UPS';
  }

  getServices() {
    return [
      { code: '03', name: 'UPS Ground', description: 'Ground delivery service' },
      { code: '12', name: 'UPS 3 Day Select', description: '3 business days' },
      { code: '02', name: 'UPS 2nd Day Air', description: '2 business days' },
      { code: '59', name: 'UPS 2nd Day Air A.M.', description: '2 business days by 12:00 PM' },
      { code: '01', name: 'UPS Next Day Air', description: 'Next business day' },
      { code: '14', name: 'UPS Next Day Air Early', description: 'Next business day by 8:00 AM' }
    ];
  }

  protected getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'AccessLicenseNumber': process.env.UPS_ACCESS_KEY || ''
    };
  }

  async getRates(request: ShipmentRequest): Promise<RateResponse[]> {
    this.validateRequest(request);

    const rateRequest = {
      RateRequest: {
        Request: {
          RequestOption: 'Rate',
          TransactionReference: {
            CustomerContext: 'Rate Request'
          }
        },
        Shipment: {
          Shipper: this.formatAddress(request.from),
          ShipTo: this.formatAddress(request.to),
          Service: {
            Code: request.serviceType
          },
          Package: request.packages.map(pkg => ({
            PackagingType: {
              Code: '02' // Customer supplied package
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: 'IN'
              },
              Length: pkg.length.toString(),
              Width: pkg.width.toString(),
              Height: pkg.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'LBS'
              },
              Weight: pkg.weight.toString()
            }
          }))
        }
      }
    };

    const response = await this.makeRequest('/rating/v1/Rate', 'POST', rateRequest);
    
    return response.RateResponse.RatedShipment.map((rate: any) => ({
      carrier: 'UPS',
      service: rate.Service.Code,
      cost: parseFloat(rate.TotalCharges.MonetaryValue),
      currency: rate.TotalCharges.CurrencyCode,
      guaranteedDelivery: rate.GuaranteedDelivery !== undefined
    }));
  }

  async createShipment(request: ShipmentRequest): Promise<LabelResponse> {
    this.validateRequest(request);

    const shipmentRequest = {
      ShipmentRequest: {
        Request: {
          RequestOption: 'nonvalidate',
          TransactionReference: {
            CustomerContext: 'Ship Request'
          }
        },
        Shipment: {
          Description: 'Package',
          Shipper: this.formatAddress(request.from),
          ShipTo: this.formatAddress(request.to),
          Service: {
            Code: request.serviceType
          },
          PaymentInformation: {
            ShipmentCharge: {
              Type: '01', // Transportation
              BillShipper: {
                AccountNumber: this.accountNumber
              }
            }
          },
          Package: request.packages.map(pkg => ({
            Description: pkg.description || 'Package',
            Packaging: {
              Code: '02'
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: 'IN'
              },
              Length: pkg.length.toString(),
              Width: pkg.width.toString(),
              Height: pkg.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'LBS'
              },
              Weight: pkg.weight.toString()
            }
          }))
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: 'PDF'
          },
          HTTPUserAgent: 'Mozilla/4.5'
        }
      }
    };

    const response = await this.makeRequest('/ship/v1/shipments', 'POST', shipmentRequest);
    const shipmentResults = response.ShipmentResponse.ShipmentResults;

    return {
      trackingNumber: shipmentResults.PackageResults[0].TrackingNumber,
      labelUrl: shipmentResults.PackageResults[0].ShippingLabel.GraphicImage,
      labelFormat: 'PDF',
      cost: parseFloat(shipmentResults.ShipmentCharges.TotalCharges.MonetaryValue),
      currency: shipmentResults.ShipmentCharges.TotalCharges.CurrencyCode
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo[]> {
    const response = await this.makeRequest(`/track/v1/details/${trackingNumber}`);
    const trackResponse = response.trackResponse;

    return trackResponse.shipment[0].package[0].activity?.map((activity: any) => ({
      trackingNumber,
      status: activity.status.description,
      location: activity.location?.address?.city + ', ' + activity.location?.address?.stateProvinceCode,
      timestamp: new Date(activity.date + ' ' + activity.time),
      description: activity.status.description
    })) || [];
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    const cancelRequest = {
      VoidShipmentRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: 'Void Request'
          }
        },
        ShipmentIdentificationNumber: trackingNumber
      }
    };

    try {
      await this.makeRequest('/ship/v1/shipments/cancel', 'DELETE', cancelRequest);
      return true;
    } catch (error) {
      console.error('UPS shipment cancellation failed:', error);
      return false;
    }
  }

  private formatAddress(address: Address) {
    return {
      Name: address.name,
      CompanyName: address.company,
      AttentionName: address.name,
      Phone: {
        Number: address.phone
      },
      Address: {
        AddressLine: [address.street1, address.street2].filter(Boolean),
        City: address.city,
        StateProvinceCode: address.state,
        PostalCode: address.postalCode,
        CountryCode: address.country
      }
    };
  }
}

// DHL carrier implementation
class DHLCarrier extends BaseCarrier {
  private accountNumber: string;

  constructor(apiKey: string, apiSecret: string, accountNumber: string, testMode = false) {
    super(apiKey, apiSecret, testMode);
    this.accountNumber = accountNumber;
  }

  protected getBaseUrl(): string {
    return this.testMode 
      ? 'https://express.api.dhl.com/mydhlapi/test'
      : 'https://express.api.dhl.com/mydhlapi';
  }

  getName(): string {
    return 'DHL';
  }

  getServices() {
    return [
      { code: 'N', name: 'DHL Next Day 12:00', description: 'Next working day by 12:00' },
      { code: 'S', name: 'DHL Next Day 10:30', description: 'Next working day by 10:30' },
      { code: 'G', name: 'DHL Next Day 9:00', description: 'Next working day by 9:00' },
      { code: 'Y', name: 'DHL Next Day 12:00', description: 'Next working day by 12:00' },
      { code: 'T', name: 'DHL Next Day 12:00', description: 'Next working day by 12:00' }
    ];
  }

  protected getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`
    };
  }

  async getRates(request: ShipmentRequest): Promise<RateResponse[]> {
    this.validateRequest(request);

    const rateRequest = {
      customerDetails: {
        shipperDetails: this.formatAddress(request.from),
        receiverDetails: this.formatAddress(request.to)
      },
      accounts: [{
        typeCode: 'shipper',
        number: this.accountNumber
      }],
      productCode: request.serviceType,
      packages: request.packages.map(pkg => ({
        weight: pkg.weight * 0.453592, // Convert to kg
        dimensions: {
          length: pkg.length * 2.54, // Convert to cm
          width: pkg.width * 2.54,
          height: pkg.height * 2.54
        }
      })),
      plannedShippingDateAndTime: new Date().toISOString()
    };

    const response = await this.makeRequest('/rates', 'POST', rateRequest);
    
    return response.products.map((product: any) => ({
      carrier: 'DHL',
      service: product.productName,
      cost: parseFloat(product.totalPrice[0].price),
      currency: product.totalPrice[0].currency,
      transitTime: product.deliveryCapabilities?.deliveryTypeCode,
      deliveryDate: product.deliveryCapabilities?.estimatedDeliveryDateAndTime ? 
        new Date(product.deliveryCapabilities.estimatedDeliveryDateAndTime) : undefined
    }));
  }

  async createShipment(request: ShipmentRequest): Promise<LabelResponse> {
    this.validateRequest(request);

    const shipmentRequest = {
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: {
        isRequested: false
      },
      productCode: request.serviceType,
      accounts: [{
        typeCode: 'shipper',
        number: this.accountNumber
      }],
      customerDetails: {
        shipperDetails: this.formatAddress(request.from),
        receiverDetails: this.formatAddress(request.to)
      },
      content: {
        packages: request.packages.map((pkg, index) => ({
          typeCode: '3BX',
          weight: pkg.weight * 0.453592,
          dimensions: {
            length: pkg.length * 2.54,
            width: pkg.width * 2.54,
            height: pkg.height * 2.54
          },
          customerReferences: [{
            value: `PKG${index + 1}`,
            typeCode: 'CU'
          }]
        })),
        isCustomsDeclarable: false,
        description: 'Shipment'
      },
      outputImageProperties: {
        imageOptions: [{
          typeCode: 'label',
          templateName: 'ECOM26_84_001',
          isRequested: true
        }]
      }
    };

    const response = await this.makeRequest('/shipments', 'POST', shipmentRequest);
    const shipmentDetails = response.shipmentDetails[0];

    return {
      trackingNumber: shipmentDetails.shipmentTrackingNumber,
      labelUrl: response.documents[0].content,
      labelFormat: 'PDF',
      cost: parseFloat(response.shipmentCharges[0].price),
      currency: response.shipmentCharges[0].currency
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo[]> {
    const response = await this.makeRequest(`/track/shipments?trackingNumber=${trackingNumber}`);
    const shipments = response.shipments[0];

    return shipments.events?.map((event: any) => ({
      trackingNumber,
      status: event.description,
      location: event.location?.address?.addressLocality,
      timestamp: new Date(event.timestamp),
      description: event.description
    })) || [];
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    try {
      await this.makeRequest(`/shipments/${trackingNumber}`, 'DELETE');
      return true;
    } catch (error) {
      console.error('DHL shipment cancellation failed:', error);
      return false;
    }
  }

  private formatAddress(address: Address) {
    return {
      postalAddress: {
        cityName: address.city,
        countryCode: address.country,
        postalCode: address.postalCode,
        provinceCode: address.state,
        addressLine1: address.street1,
        addressLine2: address.street2
      },
      contactInformation: {
        phone: address.phone,
        companyName: address.company,
        fullName: address.name,
        email: address.email
      }
    };
  }
}

// Carrier service manager
export class CarrierService {
  private carriers: Map<string, BaseCarrier> = new Map();

  constructor() {
    this.initializeCarriers();
  }

  private initializeCarriers() {
    // Initialize FedEx
    if (process.env.FEDEX_API_KEY && process.env.FEDEX_SECRET_KEY) {
      const fedex = new FedExCarrier(
        process.env.FEDEX_API_KEY,
        process.env.FEDEX_SECRET_KEY,
        process.env.FEDEX_ACCOUNT_NUMBER || '',
        process.env.FEDEX_METER_NUMBER || '',
        process.env.NODE_ENV !== 'production'
      );
      this.carriers.set('fedex', fedex);
    }

    // Initialize UPS
    if (process.env.UPS_API_KEY && process.env.UPS_SECRET_KEY) {
      const ups = new UPSCarrier(
        process.env.UPS_API_KEY,
        process.env.UPS_SECRET_KEY,
        process.env.UPS_ACCOUNT_NUMBER || '',
        process.env.NODE_ENV !== 'production'
      );
      this.carriers.set('ups', ups);
    }

    // Initialize DHL
    if (process.env.DHL_API_KEY && process.env.DHL_SECRET_KEY) {
      const dhl = new DHLCarrier(
        process.env.DHL_API_KEY,
        process.env.DHL_SECRET_KEY,
        process.env.DHL_ACCOUNT_NUMBER || '',
        process.env.NODE_ENV !== 'production'
      );
      this.carriers.set('dhl', dhl);
    }
  }

  getAvailableCarriers(): string[] {
    return Array.from(this.carriers.keys());
  }

  getCarrier(name: string): BaseCarrier | undefined {
    return this.carriers.get(name.toLowerCase());
  }

  async getAllRates(request: ShipmentRequest): Promise<RateResponse[]> {
    const allRates: RateResponse[] = [];
    
    for (const [name, carrier] of this.carriers) {
      try {
        const rates = await carrier.getRates(request);
        allRates.push(...rates);
      } catch (error) {
        console.error(`Failed to get rates from ${name}:`, error);
      }
    }

    return allRates.sort((a, b) => a.cost - b.cost);
  }

  async createShipment(carrierName: string, request: ShipmentRequest): Promise<LabelResponse> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      throw new Error(`Carrier ${carrierName} not available`);
    }

    return await carrier.createShipment(request);
  }

  async trackShipment(carrierName: string, trackingNumber: string): Promise<TrackingInfo[]> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      throw new Error(`Carrier ${carrierName} not available`);
    }

    return await carrier.trackShipment(trackingNumber);
  }

  async cancelShipment(carrierName: string, trackingNumber: string): Promise<boolean> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      throw new Error(`Carrier ${carrierName} not available`);
    }

    return await carrier.cancelShipment(trackingNumber);
  }

  getServices(carrierName?: string) {
    if (carrierName) {
      const carrier = this.getCarrier(carrierName);
      return carrier ? carrier.getServices() : [];
    }

    const allServices: Record<string, any[]> = {};
    for (const [name, carrier] of this.carriers) {
      allServices[name] = carrier.getServices();
    }
    return allServices;
  }

  async logCarrierActivity(
    carrierName: string,
    action: string,
    trackingNumber?: string,
    details?: any
  ) {
    try {
      await prisma.carrierLog.create({
        data: {
          carrier: carrierName,
          action,
          trackingNumber,
          details,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log carrier activity:', error);
    }
  }
}

// Export singleton instance
export const carrierService = new CarrierService();