// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import {
  Users, Plus, Search, Building2, Mail, Phone, MapPin,
  FileText, IndianRupee, Eye, Edit2, X, ChevronDown,
  ChevronUp, ArrowLeft, Clock, CheckCircle2, AlertCircle,
  XCircle, Filter, Download,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  mockCustomers, mockServiceRecords, mockInvoices,
  type Customer, type ServiceRecord, type CustomerInvoice,
} from "@/lib/data/customer-profiles-data";
import { toast } from "sonner";

type ViewMode = "list" | "detail";
type StatusFilter = "all" | "active" | "inactive";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    overdue: "bg-red-500/20 text-red-400 border-red-500/30",
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", map[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30")}>
      {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
};

export default function CustomerProfilesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "services" | "invoices">("overview");

  const filtered = useMemo(() => {
    let list = [...mockCustomers];
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.contactPerson.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.gstin.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const active = mockCustomers.filter((c) => c.status === "active").length;
    const totalRevenue = mockCustomers.reduce((s, c) => s + c.totalRevenue, 0);
    const outstanding = mockCustomers.reduce((s, c) => s + c.outstandingAmount, 0);
    return { total: mockCustomers.length, active, totalRevenue, outstanding };
  }, []);

  const openDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailTab("overview");
    setViewMode("detail");
  };

  const openEdit = (customer: Customer | null) => {
    setEditCustomer(customer);
    setShowModal(true);
  };

  // ─── DETAIL VIEW ───
  if (viewMode === "detail" && selectedCustomer) {
    const services = mockServiceRecords.filter((s) => s.customerId === selectedCustomer.id);
    const invoices = mockInvoices.filter((i) => i.customerId === selectedCustomer.id);
    const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const totalPending = invoices.filter((i) => i.status !== "paid" && i.status !== "draft").reduce((s, i) => s + i.amount, 0);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setViewMode("list")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Customer List
        </button>

        {/* Customer Header Card */}
        <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/10 text-orange-500 text-xl font-bold">
                {selectedCustomer.companyName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{selectedCustomer.companyName}</h2>
                  {statusBadge(selectedCustomer.status)}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{selectedCustomer.contactPerson}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selectedCustomer.email}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />{selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}
                </div>
              </div>
            </div>
            <button
              onClick={() => openEdit(selectedCustomer)}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">GSTIN</div>
              <div className="text-sm font-mono text-gray-200 mt-1">{selectedCustomer.gstin}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">PAN</div>
              <div className="text-sm font-mono text-gray-200 mt-1">{selectedCustomer.pan}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</div>
              <div className="text-sm font-semibold text-emerald-400 mt-1">{formatCurrency(selectedCustomer.totalRevenue)}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Outstanding</div>
              <div className={cn("text-sm font-semibold mt-1", selectedCustomer.outstandingAmount > 0 ? "text-orange-400" : "text-gray-400")}>
                {formatCurrency(selectedCustomer.outstandingAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="flex gap-1 border-b border-gray-700">
          {(["overview", "services", "invoices"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize",
                detailTab === tab
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {detailTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Service Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Projects</span><span className="text-white font-medium">{services.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Completed</span><span className="text-emerald-400 font-medium">{services.filter(s => s.status === "completed").length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">In Progress</span><span className="text-blue-400 font-medium">{services.filter(s => s.status === "in_progress").length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pending</span><span className="text-yellow-400 font-medium">{services.filter(s => s.status === "pending").length}</span></div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Invoiced</span><span className="text-white font-medium">{formatCurrency(invoices.filter(i => i.type === "invoice").reduce((s, i) => s + i.amount, 0))}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Paid</span><span className="text-emerald-400 font-medium">{formatCurrency(totalPaid)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Outstanding</span><span className="text-orange-400 font-medium">{formatCurrency(totalPending)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Quotations</span><span className="text-gray-300 font-medium">{formatCurrency(invoices.filter(i => i.type === "quotation").reduce((s, i) => s + i.amount, 0))}</span></div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Customer Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Customer Since</span><span className="text-white">{formatDate(selectedCustomer.createdAt)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Total Orders</span><span className="text-white">{selectedCustomer.totalOrders}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">City</span><span className="text-white">{selectedCustomer.city}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">State</span><span className="text-white">{selectedCustomer.state}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        {detailTab === "services" && (
          <div className="rounded-xl border border-gray-700 overflow-hidden">
            {services.length === 0 ? (
              <EmptyState title="No Services" description="No service records found for this customer" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800/70 text-xs text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Service</th>
                      <th className="px-4 py-3 text-left">Standard</th>
                      <th className="px-4 py-3 text-left">Samples</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Start Date</th>
                      <th className="px-4 py-3 text-left">End Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {services.map((s, i) => (
                      <tr key={s.id} className={cn("transition-colors hover:bg-gray-700/50", i % 2 === 0 ? "bg-gray-900/30" : "bg-gray-900/10")}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-200">{s.serviceType}</div>
                          <div className="text-xs text-gray-500">{s.description}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.standard}</td>
                        <td className="px-4 py-3 text-gray-300">{s.sampleCount}</td>
                        <td className="px-4 py-3">{statusBadge(s.status)}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(s.startDate)}</td>
                        <td className="px-4 py-3 text-gray-400">{s.endDate ? formatDate(s.endDate) : "—"}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-200">{formatCurrency(s.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Invoices */}
        {detailTab === "invoices" && (
          <div className="rounded-xl border border-gray-700 overflow-hidden">
            {invoices.length === 0 ? (
              <EmptyState title="No Invoices" description="No invoices or quotations found for this customer" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-800/70 text-xs text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Invoice #</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Due Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {invoices.map((inv, i) => (
                      <tr key={inv.id} className={cn("transition-colors hover:bg-gray-700/50", i % 2 === 0 ? "bg-gray-900/30" : "bg-gray-900/10")}>
                        <td className="px-4 py-3 font-mono text-orange-400 font-medium">{inv.invoiceNo}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs px-2 py-0.5 rounded border", inv.type === "invoice" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-purple-500/10 text-purple-400 border-purple-500/30")}>
                            {inv.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{inv.description}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(inv.date)}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(inv.dueDate)}</td>
                        <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-200">{formatCurrency(inv.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── LIST VIEW ───
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Customer Management"
        subtitle="Manage clients, service history, invoices and quotations"
        actions={
          <button
            onClick={() => openEdit(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Customer
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: stats.total, icon: Building2, color: "text-blue-400" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: IndianRupee, color: "text-emerald-400" },
          { label: "Outstanding", value: formatCurrency(stats.outstanding), icon: AlertCircle, color: "text-orange-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-700 bg-gray-900/50 p-4 hover:scale-[1.02] hover:shadow-lg hover:border-orange-500/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <div className={cn("text-2xl font-bold mt-2", stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-700 bg-gray-900/50 text-gray-200 placeholder:text-gray-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-2 text-xs font-medium rounded-lg transition-colors capitalize",
                statusFilter === f
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Customers Found"
            description={search ? `No customers matching "${search}"` : "Add your first customer to get started"}
            action={
              <button
                onClick={() => openEdit(null)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Customer
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/70 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800/70">Company</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800/70">Contact</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800/70">Email</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800/70">Phone</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800/70">GSTIN</th>
                  <th className="px-4 py-3 text-left sticky top-0 bg-gray-800/70">Status</th>
                  <th className="px-4 py-3 text-right sticky top-0 bg-gray-800/70">Revenue</th>
                  <th className="px-4 py-3 text-right sticky top-0 bg-gray-800/70">Outstanding</th>
                  <th className="px-4 py-3 text-center sticky top-0 bg-gray-800/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={cn(
                      "transition-colors hover:bg-gray-700/50 cursor-pointer",
                      i % 2 === 0 ? "bg-gray-900/30" : "bg-gray-900/10"
                    )}
                    onClick={() => openDetail(c)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-bold shrink-0">
                          {c.companyName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-200">{c.companyName}</div>
                          <div className="text-xs text-gray-500">{c.city}, {c.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{c.contactPerson}</td>
                    <td className="px-4 py-3 text-gray-400">{c.email}</td>
                    <td className="px-4 py-3 text-gray-400">{c.phone}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{c.gstin}</td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-400">{formatCurrency(c.totalRevenue)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("font-medium", c.outstandingAmount > 0 ? "text-orange-400" : "text-gray-500")}>
                        {formatCurrency(c.outstandingAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openDetail(c)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-gray-800 transition-colors"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-gray-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <CustomerFormModal
          customer={editCustomer}
          onClose={() => { setShowModal(false); setEditCustomer(null); }}
          onSave={(data) => {
            setShowModal(false);
            setEditCustomer(null);
            toast.success(editCustomer ? "Customer updated successfully" : "Customer added successfully");
          }}
        />
      )}
    </div>
  );
}

// ─── Customer Form Modal ───
function CustomerFormModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState({
    companyName: customer?.companyName || "",
    contactPerson: customer?.contactPerson || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    state: customer?.state || "",
    gstin: customer?.gstin || "",
    pan: customer?.pan || "",
    status: customer?.status || "active",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {customer ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Company Name", field: "companyName", required: true },
              { label: "Contact Person", field: "contactPerson", required: true },
              { label: "Email", field: "email", type: "email", required: true },
              { label: "Phone", field: "phone" },
              { label: "GSTIN", field: "gstin" },
              { label: "PAN", field: "pan" },
              { label: "City", field: "city" },
              { label: "State", field: "state" },
            ].map((f) => (
              <div key={f.field}>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {f.label} {f.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={f.type || "text"}
                  value={(form as any)[f.field]}
                  onChange={(e) => update(f.field, e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-700 bg-gray-800 text-gray-200 placeholder:text-gray-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-700 bg-gray-800 text-gray-200 placeholder:text-gray-500 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
            <div className="flex gap-2">
              {(["active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => update("status", s)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg border transition-colors capitalize",
                    form.status === s
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {customer ? "Update Customer" : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
