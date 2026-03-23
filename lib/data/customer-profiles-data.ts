// @ts-nocheck

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  pan: string;
  status: "active" | "inactive";
  createdAt: string;
  totalOrders: number;
  totalRevenue: number;
  outstandingAmount: number;
}

export interface ServiceRecord {
  id: string;
  customerId: string;
  serviceType: string;
  description: string;
  standard: string;
  sampleCount: number;
  status: "completed" | "in_progress" | "pending" | "cancelled";
  startDate: string;
  endDate: string | null;
  amount: number;
  invoiceNo: string | null;
  paid: boolean;
}

export interface CustomerInvoice {
  id: string;
  customerId: string;
  invoiceNo: string;
  type: "invoice" | "quotation";
  date: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  description: string;
}

export const mockCustomers: Customer[] = [
  {
    id: "cust-001",
    companyName: "Tata Power Solar Systems Ltd",
    contactPerson: "Rajesh Kumar",
    email: "rajesh.kumar@tatapower.com",
    phone: "+91 80 4567 8901",
    address: "Plot 42, Electronics City Phase 1",
    city: "Bangalore",
    state: "Karnataka",
    gstin: "29AABCT0001A1Z5",
    pan: "AABCT0001A",
    status: "active",
    createdAt: "2024-01-15",
    totalOrders: 24,
    totalRevenue: 4850000,
    outstandingAmount: 320000,
  },
  {
    id: "cust-002",
    companyName: "Adani Solar Energy Pvt Ltd",
    contactPerson: "Priya Sharma",
    email: "priya.sharma@adanisolar.com",
    phone: "+91 79 6789 0123",
    address: "Adani House, Near Mithakhali Circle",
    city: "Ahmedabad",
    state: "Gujarat",
    gstin: "24AABCA0001B1Z6",
    pan: "AABCA0001B",
    status: "active",
    createdAt: "2024-03-22",
    totalOrders: 18,
    totalRevenue: 3620000,
    outstandingAmount: 180000,
  },
  {
    id: "cust-003",
    companyName: "First Solar India",
    contactPerson: "Anil Mehta",
    email: "anil.mehta@firstsolar.com",
    phone: "+91 44 2345 6789",
    address: "SP Infocity, OMR",
    city: "Chennai",
    state: "Tamil Nadu",
    gstin: "33AABCF0001C1Z7",
    pan: "AABCF0001C",
    status: "active",
    createdAt: "2024-06-10",
    totalOrders: 12,
    totalRevenue: 2150000,
    outstandingAmount: 0,
  },
  {
    id: "cust-004",
    companyName: "Vikram Solar Ltd",
    contactPerson: "Sneha Patel",
    email: "sneha.patel@vikramsolar.com",
    phone: "+91 33 4567 8901",
    address: "Kolkata Business Park, Sector V",
    city: "Kolkata",
    state: "West Bengal",
    gstin: "19AABCV0001D1Z8",
    pan: "AABCV0001D",
    status: "active",
    createdAt: "2024-02-28",
    totalOrders: 31,
    totalRevenue: 5920000,
    outstandingAmount: 450000,
  },
  {
    id: "cust-005",
    companyName: "Waaree Energies Ltd",
    contactPerson: "Deepak Joshi",
    email: "deepak.joshi@waaree.com",
    phone: "+91 22 6789 0123",
    address: "Surat Highway, Chikhli",
    city: "Surat",
    state: "Gujarat",
    gstin: "24AABCW0001E1Z9",
    pan: "AABCW0001E",
    status: "active",
    createdAt: "2024-04-05",
    totalOrders: 15,
    totalRevenue: 2780000,
    outstandingAmount: 95000,
  },
  {
    id: "cust-006",
    companyName: "RenewSys India Pvt Ltd",
    contactPerson: "Kavita Nair",
    email: "kavita.nair@renewsys.com",
    phone: "+91 20 6789 0456",
    address: "MIDC Industrial Area, Ravet",
    city: "Pune",
    state: "Maharashtra",
    gstin: "27AABCR0001F1Z0",
    pan: "AABCR0001F",
    status: "inactive",
    createdAt: "2023-11-20",
    totalOrders: 6,
    totalRevenue: 890000,
    outstandingAmount: 0,
  },
  {
    id: "cust-007",
    companyName: "Goldi Solar Pvt Ltd",
    contactPerson: "Mukesh Agarwal",
    email: "mukesh@goldisolar.com",
    phone: "+91 261 456 7890",
    address: "GIDC Estate",
    city: "Surat",
    state: "Gujarat",
    gstin: "24AABCG0001G1Z1",
    pan: "AABCG0001G",
    status: "active",
    createdAt: "2025-01-12",
    totalOrders: 8,
    totalRevenue: 1540000,
    outstandingAmount: 210000,
  },
  {
    id: "cust-008",
    companyName: "Loom Solar Pvt Ltd",
    contactPerson: "Amrit Singh",
    email: "amrit@loomsolar.com",
    phone: "+91 124 567 8901",
    address: "IMT Manesar, Sector 8",
    city: "Gurugram",
    state: "Haryana",
    gstin: "06AABCL0001H1Z2",
    pan: "AABCL0001H",
    status: "active",
    createdAt: "2025-02-20",
    totalOrders: 5,
    totalRevenue: 720000,
    outstandingAmount: 150000,
  },
];

export const mockServiceRecords: ServiceRecord[] = [
  { id: "sr-001", customerId: "cust-001", serviceType: "IEC 61215 Qualification", description: "Full design qualification of 585W bifacial module", standard: "IEC 61215-1:2021", sampleCount: 8, status: "completed", startDate: "2025-08-15", endDate: "2025-11-20", amount: 850000, invoiceNo: "INV-2025-0042", paid: true },
  { id: "sr-002", customerId: "cust-001", serviceType: "IEC 61730 Safety", description: "Safety qualification testing", standard: "IEC 61730-2:2023", sampleCount: 6, status: "in_progress", startDate: "2026-01-10", endDate: null, amount: 620000, invoiceNo: null, paid: false },
  { id: "sr-003", customerId: "cust-001", serviceType: "BIS Certification", description: "IS 14286 compliance testing for domestic market", standard: "IS 14286:2023", sampleCount: 4, status: "pending", startDate: "2026-04-01", endDate: null, amount: 380000, invoiceNo: null, paid: false },
  { id: "sr-004", customerId: "cust-002", serviceType: "IEC 61215 Qualification", description: "550W mono PERC module qualification", standard: "IEC 61215-1:2021", sampleCount: 8, status: "completed", startDate: "2025-06-01", endDate: "2025-09-15", amount: 780000, invoiceNo: "INV-2025-0028", paid: true },
  { id: "sr-005", customerId: "cust-002", serviceType: "IEC 61853 Energy Rating", description: "Energy rating assessment for utility-scale modules", standard: "IEC 61853-1", sampleCount: 2, status: "in_progress", startDate: "2026-02-01", endDate: null, amount: 450000, invoiceNo: null, paid: false },
  { id: "sr-006", customerId: "cust-004", serviceType: "IEC 61215 + 61730 Combined", description: "Combined DQ + Safety testing for new 600W series", standard: "IEC 61215/61730", sampleCount: 10, status: "in_progress", startDate: "2025-12-01", endDate: null, amount: 1250000, invoiceNo: "INV-2025-0051", paid: false },
  { id: "sr-007", customerId: "cust-005", serviceType: "PID Testing", description: "Potential Induced Degradation testing", standard: "IEC 62804-1", sampleCount: 4, status: "completed", startDate: "2025-10-10", endDate: "2025-12-05", amount: 290000, invoiceNo: "INV-2025-0045", paid: true },
  { id: "sr-008", customerId: "cust-007", serviceType: "IEC 61701 Salt Mist", description: "Salt mist corrosion testing for coastal installations", standard: "IEC 61701:2020", sampleCount: 4, status: "pending", startDate: "2026-03-15", endDate: null, amount: 320000, invoiceNo: null, paid: false },
  { id: "sr-009", customerId: "cust-003", serviceType: "IEC 61215 Qualification", description: "Thin-film CdTe module qualification", standard: "IEC 61215-1:2021", sampleCount: 8, status: "completed", startDate: "2025-04-01", endDate: "2025-07-20", amount: 920000, invoiceNo: "INV-2025-0019", paid: true },
  { id: "sr-010", customerId: "cust-008", serviceType: "Flash Testing", description: "STC flash testing batch of 100 modules", standard: "IEC 60904-1", sampleCount: 100, status: "completed", startDate: "2026-01-20", endDate: "2026-02-10", amount: 150000, invoiceNo: "INV-2026-0008", paid: true },
];

export const mockInvoices: CustomerInvoice[] = [
  { id: "inv-001", customerId: "cust-001", invoiceNo: "INV-2025-0042", type: "invoice", date: "2025-11-20", dueDate: "2025-12-20", amount: 850000, status: "paid", description: "IEC 61215 Qualification - 585W Bifacial" },
  { id: "inv-002", customerId: "cust-001", invoiceNo: "QUO-2026-0012", type: "quotation", date: "2025-12-15", dueDate: "2026-01-15", amount: 620000, status: "pending", description: "IEC 61730 Safety Testing" },
  { id: "inv-003", customerId: "cust-001", invoiceNo: "QUO-2026-0018", type: "quotation", date: "2026-02-01", dueDate: "2026-03-01", amount: 380000, status: "draft", description: "BIS Certification Testing" },
  { id: "inv-004", customerId: "cust-002", invoiceNo: "INV-2025-0028", type: "invoice", date: "2025-09-15", dueDate: "2025-10-15", amount: 780000, status: "paid", description: "IEC 61215 - 550W Mono PERC" },
  { id: "inv-005", customerId: "cust-002", invoiceNo: "QUO-2026-0015", type: "quotation", date: "2026-01-10", dueDate: "2026-02-10", amount: 450000, status: "pending", description: "IEC 61853 Energy Rating" },
  { id: "inv-006", customerId: "cust-004", invoiceNo: "INV-2025-0051", type: "invoice", date: "2025-12-01", dueDate: "2026-01-01", amount: 1250000, status: "overdue", description: "IEC 61215 + 61730 Combined Testing" },
  { id: "inv-007", customerId: "cust-005", invoiceNo: "INV-2025-0045", type: "invoice", date: "2025-12-05", dueDate: "2026-01-05", amount: 290000, status: "paid", description: "PID Testing" },
  { id: "inv-008", customerId: "cust-007", invoiceNo: "QUO-2026-0022", type: "quotation", date: "2026-03-01", dueDate: "2026-04-01", amount: 320000, status: "draft", description: "Salt Mist Corrosion Testing" },
  { id: "inv-009", customerId: "cust-003", invoiceNo: "INV-2025-0019", type: "invoice", date: "2025-07-20", dueDate: "2025-08-20", amount: 920000, status: "paid", description: "Thin-film CdTe Qualification" },
  { id: "inv-010", customerId: "cust-008", invoiceNo: "INV-2026-0008", type: "invoice", date: "2026-02-10", dueDate: "2026-03-10", amount: 150000, status: "paid", description: "STC Flash Testing Batch" },
];
