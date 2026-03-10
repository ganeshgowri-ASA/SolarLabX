"use client";

import { useState, useEffect } from "react";
import { Equipment, EquipmentCategory, EquipmentStatus } from "@/lib/types/equipment";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES: EquipmentCategory[] = [
  "Climate Chamber",
  "Sun Simulator",
  "UV Chamber",
  "EL Camera",
  "IR Camera",
  "IV Tracer",
  "Hi-pot Tester",
  "Mechanical Load",
  "Insulation Tester",
  "Outdoor Test Bed",
];

const STATUSES: EquipmentStatus[] = ["Available", "In-Use", "Maintenance", "Calibration"];

interface EquipmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (equipment: Equipment) => void;
  editingEquipment?: Equipment | null;
}

interface FormErrors {
  name?: string;
  category?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  location?: string;
}

export default function EquipmentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingEquipment,
}: EquipmentFormDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("Climate Chamber");
  const [serialNumber, setSerialNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<EquipmentStatus>("Available");
  const [calibrationDueDate, setCalibrationDueDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (editingEquipment) {
      setName(editingEquipment.name);
      setCategory(editingEquipment.category);
      setSerialNumber(editingEquipment.serialNumber);
      setManufacturer(editingEquipment.manufacturer);
      setModel(editingEquipment.model);
      setLocation(editingEquipment.location);
      setStatus(editingEquipment.status);
      setCalibrationDueDate(editingEquipment.calibration.nextDue);
    } else {
      resetForm();
    }
  }, [editingEquipment, open]);

  function resetForm() {
    setName("");
    setCategory("Climate Chamber");
    setSerialNumber("");
    setManufacturer("");
    setModel("");
    setLocation("");
    setStatus("Available");
    setCalibrationDueDate("");
    setErrors({});
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!serialNumber.trim()) newErrors.serialNumber = "Serial number is required";
    if (!manufacturer.trim()) newErrors.manufacturer = "Manufacturer is required";
    if (!model.trim()) newErrors.model = "Model is required";
    if (!location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const today = new Date().toISOString().split("T")[0];
    const nextDue = calibrationDueDate || today;

    const eq: Equipment = editingEquipment
      ? {
          ...editingEquipment,
          name,
          category,
          serialNumber,
          manufacturer,
          model,
          location,
          status,
          calibration: {
            ...editingEquipment.calibration,
            nextDue,
          },
        }
      : {
          id: `EQ-NEW-${Date.now().toString(36).toUpperCase()}`,
          name,
          category,
          serialNumber,
          manufacturer,
          model,
          location,
          status,
          currentProject: null,
          currentSample: null,
          calibration: {
            lastCalibrated: today,
            nextDue,
            certificateNumber: `CAL-NEW-${Date.now().toString(36).toUpperCase()}`,
            calibratedBy: "Pending",
            status: "Valid",
            history: [],
          },
          kpis: {
            utilizationRate: 0,
            mtbf: 0,
            mttr: 0,
            availability: 100,
            totalRunHours: 0,
            breakdownCount: 0,
          },
          maintenanceHistory: [],
          pmChecklist: [],
        };

    onSubmit(eq);
    onOpenChange(false);
    resetForm();
  }

  const isEditing = !!editingEquipment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update equipment details below."
              : "Fill in the details to register new equipment."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="eq-name">Equipment Name *</Label>
            <Input
              id="eq-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Thermal Cycling Chamber TC-06"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as EquipmentCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EquipmentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="eq-serial">Serial Number *</Label>
            <Input
              id="eq-serial"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g., WEI-TC-2024-1006"
            />
            {errors.serialNumber && <p className="text-xs text-red-500">{errors.serialNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="eq-manufacturer">Manufacturer *</Label>
              <Input
                id="eq-manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g., Weiss Technik"
              />
              {errors.manufacturer && <p className="text-xs text-red-500">{errors.manufacturer}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="eq-model">Model *</Label>
              <Input
                id="eq-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., WK3-340/70-5"
              />
              {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="eq-location">Location *</Label>
            <Input
              id="eq-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Lab A - Bay 6"
            />
            {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="eq-cal-due">Calibration Due Date</Label>
            <Input
              id="eq-cal-due"
              type="date"
              value={calibrationDueDate}
              onChange={(e) => setCalibrationDueDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add Equipment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
