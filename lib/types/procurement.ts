export type RFQStatus = "Draft" | "Issued" | "Responses Received" | "Evaluated" | "Awarded" | "Cancelled";
export type POStatus = "Draft" | "Pending Approval" | "Approved" | "Ordered" | "Partial Delivery" | "Delivered" | "Closed";
export type VendorStatus = "Active" | "Inactive" | "Blacklisted" | "Under Evaluation";
export type FATSATStatus = "Not Started" | "FAT Scheduled" | "FAT Complete" | "SAT Scheduled" | "SAT Complete" | "Accepted" | "Rejected";

export interface RFQ {
  id: string;
  title: string;
  rfqNumber: string;
  status: RFQStatus;
  category: string;
  description: string;
  technicalSpecs: TechnicalSpec[];
  vendors: string[];
  issueDate: string;
  responseDeadline: string;
  budget: number;
  createdBy: string;
  responses: VendorResponse[];
  createdAt: string;
}

export interface TechnicalSpec {
  parameter: string;
  requirement: string;
  unit: string;
  mandatory: boolean;
}

export interface VendorResponse {
  vendorId: string;
  vendorName: string;
  quotedPrice: number;
  deliveryDays: number;
  technicalCompliance: number;
  submittedDate: string;
  notes: string;
}

export interface Vendor {
  id: string;
  name: string;
  status: VendorStatus;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  overallScore: number;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  serviceScore: number;
  certifications: string[];
  purchaseHistory: PurchaseHistoryItem[];
  evaluationDate: string;
  approvedDate: string | null;
}

export interface PurchaseHistoryItem {
  poNumber: string;
  date: string;
  amount: number;
  item: string;
  rating: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId: string | null;
  vendorId: string;
  vendorName: string;
  status: POStatus;
  items: POLineItem[];
  totalAmount: number;
  approvedBy: string;
  approvalDate: string | null;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery: string | null;
  fatSatStatus: FATSATStatus;
  paymentTerms: string;
  notes: string;
  createdAt: string;
}

export interface POLineItem {
  id: string;
  description: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveredQty: number;
}

export interface TBEMatrix {
  rfqId: string;
  criteria: TBECriterion[];
  vendors: TBEVendorScore[];
}

export interface TBECriterion {
  id: string;
  name: string;
  weight: number;
  category: "Technical" | "Commercial" | "Delivery" | "Quality";
}

export interface TBEVendorScore {
  vendorId: string;
  vendorName: string;
  scores: { criterionId: string; score: number; remarks: string }[];
  totalWeightedScore: number;
}
