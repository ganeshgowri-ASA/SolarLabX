// Equipment categories for solar PV testing labs
export const EQUIPMENT_CATEGORIES = [
  { value: 'solar_simulator', label: 'Solar Simulator' },
  { value: 'thermal_chamber', label: 'Thermal/Environmental Chamber' },
  { value: 'humidity_chamber', label: 'Humidity Chamber' },
  { value: 'uv_chamber', label: 'UV Exposure Chamber' },
  { value: 'iv_tester', label: 'I-V Curve Tracer' },
  { value: 'insulation_tester', label: 'Insulation Resistance Tester' },
  { value: 'el_camera', label: 'EL Camera' },
  { value: 'ir_camera', label: 'IR Thermal Camera' },
  { value: 'mechanical_load', label: 'Mechanical Load Tester' },
  { value: 'hail_tester', label: 'Hail Impact Tester' },
  { value: 'flash_tester', label: 'Flash Tester' },
  { value: 'spectroradiometer', label: 'Spectroradiometer' },
  { value: 'data_logger', label: 'Data Logger' },
  { value: 'multimeter', label: 'Digital Multimeter' },
  { value: 'reference_cell', label: 'Reference Cell' },
  { value: 'pyranometer', label: 'Pyranometer' },
  { value: 'other', label: 'Other' },
] as const

export const SAMPLE_TYPES = [
  { value: 'pv_module', label: 'PV Module' },
  { value: 'pv_cell', label: 'PV Cell' },
  { value: 'pv_string', label: 'PV String' },
  { value: 'junction_box', label: 'Junction Box' },
  { value: 'connector', label: 'Connector' },
  { value: 'cable', label: 'Cable' },
  { value: 'backsheet', label: 'Backsheet' },
  { value: 'encapsulant', label: 'Encapsulant' },
  { value: 'frame', label: 'Frame' },
  { value: 'glass', label: 'Glass' },
  { value: 'other', label: 'Other' },
] as const

export const TEST_STANDARDS = [
  { value: 'IEC 61215', label: 'IEC 61215 - Design Qualification & Type Approval' },
  { value: 'IEC 61730', label: 'IEC 61730 - PV Module Safety' },
  { value: 'IEC 61853', label: 'IEC 61853 - PV Module Energy Rating' },
  { value: 'IEC 60904', label: 'IEC 60904 - PV Device Measurement' },
  { value: 'IEC 62716', label: 'IEC 62716 - Ammonia Corrosion Testing' },
  { value: 'IEC 61701', label: 'IEC 61701 - Salt Mist Corrosion Testing' },
  { value: 'IEC 62804', label: 'IEC 62804 - PID Testing' },
  { value: 'UL 1703', label: 'UL 1703 - Flat-Plate PV Modules' },
  { value: 'IS 14286', label: 'IS 14286 - BIS Standard' },
] as const

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const

export const DOCUMENT_CATEGORIES = [
  { value: 'procedure', label: 'Standard Operating Procedure (SOP)' },
  { value: 'work_instruction', label: 'Work Instruction' },
  { value: 'form', label: 'Form / Template' },
  { value: 'record', label: 'Record' },
  { value: 'specification', label: 'Specification' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'report', label: 'Report' },
  { value: 'manual', label: 'Manual' },
  { value: 'policy', label: 'Policy' },
] as const

export const CAPA_SOURCES = [
  'Internal Audit',
  'External Audit',
  'Customer Complaint',
  'Management Review',
  'Test Nonconformity',
  'Equipment Failure',
  'Proficiency Testing',
  'Process Deviation',
  'Near Miss',
  'Observation',
] as const

export const EIGHT_D_STEPS = [
  { step: 1, title: 'D1 - Team Formation', description: 'Establish a cross-functional team with process knowledge' },
  { step: 2, title: 'D2 - Problem Description', description: 'Describe the problem using 5W2H methodology' },
  { step: 3, title: 'D3 - Containment Actions', description: 'Define and implement interim containment actions' },
  { step: 4, title: 'D4 - Root Cause Analysis', description: 'Identify all potential causes using fishbone/5-why analysis' },
  { step: 5, title: 'D5 - Corrective Actions', description: 'Select and verify permanent corrective actions' },
  { step: 6, title: 'D6 - Implementation', description: 'Implement and validate corrective actions' },
  { step: 7, title: 'D7 - Prevention', description: 'Prevent recurrence by updating systems and procedures' },
  { step: 8, title: 'D8 - Closure', description: 'Recognize team contributions and close the CAPA' },
] as const
