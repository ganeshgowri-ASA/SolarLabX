import { TestTemplate } from './types'

// ============================================================================
// IEC 61215 - Design Qualification & Type Approval Test Templates
// Ported from test-protocols Python app (test_protocols page)
// ============================================================================

export const IEC_61215_TEMPLATES: TestTemplate[] = [
  {
    id: 'iec61215-tc',
    name: 'Thermal Cycling Test (TC200/TC400)',
    standard: 'IEC 61215',
    clause: '10.11',
    category: 'environmental',
    description: 'Determine the ability of the module to withstand thermal mismatch, fatigue, and other stresses caused by repeated changes of temperature.',
    estimatedDurationHours: 800,
    requiredEquipment: ['thermal_chamber', 'iv_tester', 'el_camera', 'data_logger'],
    prerequisites: ['iec61215-visual', 'iec61215-iv-stc'],
    inputParameters: [
      { name: 'numCycles', label: 'Number of Cycles', type: 'select', unit: '', required: true, defaultValue: '200', options: ['200', '400', '600'], description: 'TC200 for qualification, TC400/TC600 for extended' },
      { name: 'tempHigh', label: 'Upper Temperature', type: 'number', unit: '°C', required: true, defaultValue: 85, min: 80, max: 90, step: 1, description: 'Upper cycle temperature' },
      { name: 'tempLow', label: 'Lower Temperature', type: 'number', unit: '°C', required: true, defaultValue: -40, min: -45, max: -35, step: 1, description: 'Lower cycle temperature' },
      { name: 'rampRate', label: 'Temperature Ramp Rate', type: 'number', unit: '°C/min', required: true, defaultValue: 1.67, min: 0.5, max: 3, step: 0.01, description: 'Max ramp rate ≤100°C/hr' },
      { name: 'dwellTime', label: 'Dwell Time at Extremes', type: 'number', unit: 'min', required: true, defaultValue: 10, min: 10, max: 30, step: 1, description: 'Minimum 10 min at each extreme' },
      { name: 'currentInjection', label: 'Current Injection (Isc)', type: 'boolean', unit: '', required: true, defaultValue: true, description: 'Apply Isc current during cycling' },
      { name: 'pmaxBefore', label: 'Pmax Before Test', type: 'number', unit: 'W', required: true, defaultValue: 0, description: 'Maximum power before test at STC' },
    ],
    acceptanceCriteria: [
      { parameter: 'powerDegradation', operator: 'max_degradation', value: 5, unit: '%', description: 'Max power degradation ≤5% of initial Pmax' },
      { parameter: 'insulationResistance', operator: 'gte', value: 40, unit: 'MΩ·m²', description: 'Insulation resistance ≥40 MΩ·m²' },
      { parameter: 'visualDefects', operator: 'eq', value: 0, unit: '', description: 'No major visual defects per IEC 61215-1 Clause 7' },
    ],
    testSequence: [
      { step: 1, name: 'Pre-conditioning', description: 'Perform initial I-V measurement at STC and EL imaging', duration: '2 hours', parameters: { irradiance: 1000, cellTemp: 25 } },
      { step: 2, name: 'Chamber Loading', description: 'Mount module in thermal chamber, connect current injection and monitoring', duration: '1 hour', parameters: {} },
      { step: 3, name: 'Thermal Cycling', description: 'Execute thermal cycles -40°C to +85°C with current injection', duration: '~670 hours (TC200)', parameters: { cycleTime: '~200 min/cycle' } },
      { step: 4, name: 'Post-conditioning', description: 'Remove module, stabilize at room temperature for 2-4 hours', duration: '4 hours', parameters: {} },
      { step: 5, name: 'Final Measurements', description: 'Perform final I-V measurement, EL imaging, visual inspection, insulation test', duration: '4 hours', parameters: {} },
    ],
  },
  {
    id: 'iec61215-dh',
    name: 'Damp Heat Test (DH1000)',
    standard: 'IEC 61215',
    clause: '10.13',
    category: 'environmental',
    description: 'Determine the ability of the module to withstand the effects of long-term penetration of humidity.',
    estimatedDurationHours: 1050,
    requiredEquipment: ['humidity_chamber', 'iv_tester', 'el_camera', 'insulation_tester'],
    prerequisites: ['iec61215-visual', 'iec61215-iv-stc'],
    inputParameters: [
      { name: 'duration', label: 'Test Duration', type: 'number', unit: 'hours', required: true, defaultValue: 1000, min: 1000, max: 3000, step: 100, description: 'DH1000 = 1000 hours, extended possible' },
      { name: 'temperature', label: 'Chamber Temperature', type: 'number', unit: '°C', required: true, defaultValue: 85, min: 83, max: 87, step: 0.1, description: '85°C ±2°C' },
      { name: 'relativeHumidity', label: 'Relative Humidity', type: 'number', unit: '%RH', required: true, defaultValue: 85, min: 83, max: 87, step: 0.1, description: '85%RH ±5%' },
      { name: 'pmaxBefore', label: 'Pmax Before Test', type: 'number', unit: 'W', required: true, defaultValue: 0, description: 'Maximum power before test at STC' },
    ],
    acceptanceCriteria: [
      { parameter: 'powerDegradation', operator: 'max_degradation', value: 5, unit: '%', description: 'Max power degradation ≤5% of initial Pmax' },
      { parameter: 'insulationResistance', operator: 'gte', value: 40, unit: 'MΩ·m²', description: 'Insulation resistance ≥40 MΩ·m²' },
      { parameter: 'visualDefects', operator: 'eq', value: 0, unit: '', description: 'No major visual defects' },
    ],
    testSequence: [
      { step: 1, name: 'Pre-conditioning', description: 'Perform initial I-V measurement at STC, EL imaging, visual inspection', duration: '4 hours', parameters: {} },
      { step: 2, name: 'Chamber Loading', description: 'Place module in damp heat chamber at 85°C/85%RH', duration: '1 hour', parameters: {} },
      { step: 3, name: 'Damp Heat Exposure', description: 'Maintain conditions for 1000 hours continuously', duration: '1000 hours', parameters: { temperature: 85, humidity: 85 } },
      { step: 4, name: 'Recovery', description: 'Remove and stabilize at ambient conditions', duration: '2-4 hours', parameters: {} },
      { step: 5, name: 'Final Measurements', description: 'I-V measurement, EL imaging, visual inspection, insulation test', duration: '4 hours', parameters: {} },
    ],
  },
  {
    id: 'iec61215-uv',
    name: 'UV Preconditioning Test',
    standard: 'IEC 61215',
    clause: '10.10',
    category: 'environmental',
    description: 'Determine the ability of the module to withstand UV exposure before sequential stress testing.',
    estimatedDurationHours: 120,
    requiredEquipment: ['uv_chamber', 'iv_tester', 'pyranometer'],
    prerequisites: ['iec61215-visual', 'iec61215-iv-stc'],
    inputParameters: [
      { name: 'uvDose', label: 'Total UV Dose', type: 'number', unit: 'kWh/m²', required: true, defaultValue: 15, min: 15, max: 60, step: 1, description: '15 kWh/m² UVA+UVB minimum' },
      { name: 'uvbDose', label: 'UVB Dose', type: 'number', unit: 'kWh/m²', required: true, defaultValue: 5, min: 5, max: 20, step: 0.5, description: 'Minimum 5 kWh/m² UVB (280-320nm)' },
      { name: 'moduleTemp', label: 'Module Temperature', type: 'number', unit: '°C', required: true, defaultValue: 60, min: 50, max: 70, step: 1, description: '60±5°C module temperature' },
      { name: 'pmaxBefore', label: 'Pmax Before Test', type: 'number', unit: 'W', required: true, defaultValue: 0, description: 'Maximum power before test at STC' },
    ],
    acceptanceCriteria: [
      { parameter: 'powerDegradation', operator: 'max_degradation', value: 5, unit: '%', description: 'Max power degradation ≤5% of initial Pmax' },
      { parameter: 'visualDefects', operator: 'eq', value: 0, unit: '', description: 'No major visual defects (yellowing, delamination)' },
    ],
    testSequence: [
      { step: 1, name: 'Pre-conditioning', description: 'Initial I-V at STC, visual inspection, EL imaging', duration: '3 hours', parameters: {} },
      { step: 2, name: 'UV Exposure', description: 'Expose front surface to UV radiation until cumulative dose reached', duration: '~100 hours', parameters: { uvIntensity: '100-250 W/m²' } },
      { step: 3, name: 'Final Measurements', description: 'I-V measurement, visual inspection, EL imaging', duration: '3 hours', parameters: {} },
    ],
  },
  {
    id: 'iec61215-ml',
    name: 'Mechanical Load Test',
    standard: 'IEC 61215',
    clause: '10.16',
    category: 'mechanical',
    description: 'Determine the ability of the module to withstand wind, snow, ice, and static loads.',
    estimatedDurationHours: 12,
    requiredEquipment: ['mechanical_load', 'iv_tester', 'el_camera'],
    prerequisites: ['iec61215-visual', 'iec61215-iv-stc'],
    inputParameters: [
      { name: 'frontLoad', label: 'Front Load (Positive)', type: 'number', unit: 'Pa', required: true, defaultValue: 2400, min: 2400, max: 5400, step: 100, description: 'Uniform front load pressure' },
      { name: 'rearLoad', label: 'Rear Load (Negative)', type: 'number', unit: 'Pa', required: true, defaultValue: 2400, min: 2400, max: 5400, step: 100, description: 'Uniform rear load pressure' },
      { name: 'numCycles', label: 'Number of Cycles', type: 'number', unit: '', required: true, defaultValue: 3, min: 1, max: 10, step: 1, description: '3 cycles each direction (standard)' },
      { name: 'holdDuration', label: 'Hold Duration', type: 'number', unit: 'min', required: true, defaultValue: 60, min: 60, max: 120, step: 1, description: 'Minimum 1 hour hold at max load' },
      { name: 'pmaxBefore', label: 'Pmax Before Test', type: 'number', unit: 'W', required: true, defaultValue: 0, description: 'Maximum power before test at STC' },
    ],
    acceptanceCriteria: [
      { parameter: 'powerDegradation', operator: 'max_degradation', value: 5, unit: '%', description: 'Max power degradation ≤5% of initial Pmax' },
      { parameter: 'visualDefects', operator: 'eq', value: 0, unit: '', description: 'No cracks, broken cells, delamination, or frame damage' },
      { parameter: 'continuity', operator: 'eq', value: 1, unit: '', description: 'Electrical continuity maintained' },
    ],
    testSequence: [
      { step: 1, name: 'Pre-conditioning', description: 'I-V at STC, EL imaging, visual inspection', duration: '3 hours', parameters: {} },
      { step: 2, name: 'Front Load Cycles', description: 'Apply uniform positive pressure for 3 cycles x 1 hour each', duration: '3.5 hours', parameters: {} },
      { step: 3, name: 'Rear Load Cycles', description: 'Apply uniform negative pressure for 3 cycles x 1 hour each', duration: '3.5 hours', parameters: {} },
      { step: 4, name: 'Final Measurements', description: 'I-V measurement, EL imaging, visual inspection', duration: '3 hours', parameters: {} },
    ],
  },
  {
    id: 'iec61215-hf',
    name: 'Humidity Freeze Test (HF10)',
    standard: 'IEC 61215',
    clause: '10.12',
    category: 'environmental',
    description: 'Determine the ability of the module to withstand the effects of high temperature/humidity followed by sub-zero temperatures.',
    estimatedDurationHours: 300,
    requiredEquipment: ['humidity_chamber', 'iv_tester', 'el_camera'],
    prerequisites: ['iec61215-uv'],
    inputParameters: [
      { name: 'numCycles', label: 'Number of Cycles', type: 'number', unit: '', required: true, defaultValue: 10, min: 10, max: 20, step: 1, description: '10 cycles standard' },
      { name: 'humidityTemp', label: 'Humidity Phase Temperature', type: 'number', unit: '°C', required: true, defaultValue: 85, description: '85°C / 85%RH phase' },
      { name: 'freezeTemp', label: 'Freeze Temperature', type: 'number', unit: '°C', required: true, defaultValue: -40, description: '-40°C freeze phase' },
      { name: 'pmaxBefore', label: 'Pmax Before Test', type: 'number', unit: 'W', required: true, defaultValue: 0, description: 'Maximum power before test at STC' },
    ],
    acceptanceCriteria: [
      { parameter: 'powerDegradation', operator: 'max_degradation', value: 5, unit: '%', description: 'Max power degradation ≤5% of initial Pmax' },
      { parameter: 'insulationResistance', operator: 'gte', value: 40, unit: 'MΩ·m²', description: 'Insulation resistance ≥40 MΩ·m²' },
    ],
    testSequence: [
      { step: 1, name: 'Pre-conditioning', description: 'Initial measurements at STC', duration: '3 hours', parameters: {} },
      { step: 2, name: 'Humidity-Freeze Cycling', description: '10 cycles: 20h at 85°C/85%RH then ramp to -40°C', duration: '~280 hours', parameters: {} },
      { step: 3, name: 'Final Measurements', description: 'I-V, EL, visual, insulation resistance', duration: '4 hours', parameters: {} },
    ],
  },
  {
    id: 'iec61215-visual',
    name: 'Visual Inspection',
    standard: 'IEC 61215',
    clause: '7',
    category: 'initial',
    description: 'Detailed visual inspection to detect any visible defects before and after environmental testing.',
    estimatedDurationHours: 1,
    requiredEquipment: [],
    prerequisites: [],
    inputParameters: [
      { name: 'surfaceCracks', label: 'Surface Cracks', type: 'boolean', unit: '', required: true, defaultValue: false, description: 'Any visible cracks on front/back surfaces' },
      { name: 'delamination', label: 'Delamination', type: 'boolean', unit: '', required: true, defaultValue: false, description: 'Evidence of delamination' },
      { name: 'discoloration', label: 'Discoloration', type: 'boolean', unit: '', required: true, defaultValue: false, description: 'Discoloration or yellowing' },
      { name: 'brokenCells', label: 'Broken Cells', type: 'boolean', unit: '', required: true, defaultValue: false, description: 'Visibly broken cells' },
      { name: 'bubbles', label: 'Bubbles', type: 'boolean', unit: '', required: true, defaultValue: false, description: 'Bubbles in encapsulant' },
      { name: 'frameCondition', label: 'Frame Condition', type: 'select', unit: '', required: true, defaultValue: 'good', options: ['excellent', 'good', 'fair', 'poor'], description: 'Overall frame condition' },
      { name: 'jboxCondition', label: 'Junction Box Condition', type: 'select', unit: '', required: true, defaultValue: 'good', options: ['excellent', 'good', 'fair', 'poor'], description: 'Junction box integrity' },
      { name: 'connectorCondition', label: 'Connector Condition', type: 'select', unit: '', required: true, defaultValue: 'good', options: ['excellent', 'good', 'fair', 'poor'], description: 'Connector integrity' },
    ],
    acceptanceCriteria: [
      { parameter: 'surfaceCracks', operator: 'eq', value: 0, unit: '', description: 'No surface cracks' },
      { parameter: 'delamination', operator: 'eq', value: 0, unit: '', description: 'No delamination' },
      { parameter: 'brokenCells', operator: 'eq', value: 0, unit: '', description: 'No broken cells' },
    ],
    testSequence: [
      { step: 1, name: 'Front Surface Inspection', description: 'Inspect glass/front surface for cracks, chips, soiling', duration: '15 min', parameters: {} },
      { step: 2, name: 'Cell Inspection', description: 'Inspect individual cells for cracks, discoloration, snail trails', duration: '15 min', parameters: {} },
      { step: 3, name: 'Back Surface Inspection', description: 'Inspect backsheet for damage, bubbles, delamination', duration: '10 min', parameters: {} },
      { step: 4, name: 'Frame & J-Box', description: 'Inspect frame, junction box, connectors, and cabling', duration: '10 min', parameters: {} },
      { step: 5, name: 'Documentation', description: 'Photograph all observations, record findings', duration: '10 min', parameters: {} },
    ],
  },
  {
    id: 'iec61215-iv-stc',
    name: 'I-V Characterization at STC',
    standard: 'IEC 61215 / IEC 60904',
    clause: '10.2',
    category: 'performance',
    description: 'Measure I-V characteristics under Standard Test Conditions (STC): 1000 W/m², 25°C, AM1.5G.',
    estimatedDurationHours: 2,
    requiredEquipment: ['solar_simulator', 'iv_tester', 'reference_cell', 'data_logger'],
    prerequisites: ['iec61215-visual'],
    inputParameters: [
      { name: 'irradiance', label: 'Irradiance', type: 'number', unit: 'W/m²', required: true, defaultValue: 1000, min: 950, max: 1050, step: 1, description: '1000 W/m² ±2%' },
      { name: 'cellTemperature', label: 'Cell Temperature', type: 'number', unit: '°C', required: true, defaultValue: 25, min: 23, max: 27, step: 0.1, description: '25°C ±2°C' },
      { name: 'spectrum', label: 'Spectrum', type: 'select', unit: '', required: true, defaultValue: 'AM1.5G', options: ['AM1.5G', 'AM1.5D'], description: 'Solar spectrum' },
      { name: 'voc', label: 'Voc (Open Circuit Voltage)', type: 'number', unit: 'V', required: true, defaultValue: 0, description: 'Measured open circuit voltage' },
      { name: 'isc', label: 'Isc (Short Circuit Current)', type: 'number', unit: 'A', required: true, defaultValue: 0, description: 'Measured short circuit current' },
      { name: 'pmax', label: 'Pmax (Maximum Power)', type: 'number', unit: 'W', required: true, defaultValue: 0, description: 'Measured maximum power' },
      { name: 'vmp', label: 'Vmp (Voltage at Pmax)', type: 'number', unit: 'V', required: true, defaultValue: 0, description: 'Voltage at maximum power point' },
      { name: 'imp', label: 'Imp (Current at Pmax)', type: 'number', unit: 'A', required: true, defaultValue: 0, description: 'Current at maximum power point' },
      { name: 'fillFactor', label: 'Fill Factor', type: 'number', unit: '%', required: true, defaultValue: 0, min: 0, max: 100, step: 0.01, description: 'Fill Factor = Pmax / (Voc × Isc)' },
    ],
    acceptanceCriteria: [
      { parameter: 'pmax', operator: 'gte', value: 0, unit: 'W', description: 'Pmax within ±3% of nameplate rating' },
      { parameter: 'fillFactor', operator: 'gte', value: 70, unit: '%', description: 'Fill factor typically ≥70% for crystalline Si' },
    ],
    testSequence: [
      { step: 1, name: 'Simulator Warm-up', description: 'Allow solar simulator to stabilize for 15-30 minutes', duration: '30 min', parameters: {} },
      { step: 2, name: 'Reference Cell Calibration', description: 'Verify irradiance with calibrated reference cell', duration: '15 min', parameters: {} },
      { step: 3, name: 'Temperature Stabilization', description: 'Ensure module is at 25°C ±2°C', duration: '30 min', parameters: {} },
      { step: 4, name: 'I-V Curve Measurement', description: 'Sweep voltage from 0 to Voc, record I-V pairs', duration: '5 min', parameters: { sweepRate: '50-200 ms' } },
      { step: 5, name: 'Repeat Measurements', description: 'Perform at least 3 measurements, average results', duration: '15 min', parameters: {} },
    ],
  },
  {
    id: 'iec61215-hail',
    name: 'Hail Impact Test',
    standard: 'IEC 61215',
    clause: '10.17',
    category: 'mechanical',
    description: 'Verify that the module can withstand the impact of hailstones.',
    estimatedDurationHours: 4,
    requiredEquipment: ['hail_tester', 'iv_tester', 'el_camera'],
    prerequisites: ['iec61215-visual', 'iec61215-iv-stc'],
    inputParameters: [
      { name: 'iceBallDiameter', label: 'Ice Ball Diameter', type: 'number', unit: 'mm', required: true, defaultValue: 25, min: 12.5, max: 75, step: 0.5, description: 'Standard: 25mm diameter' },
      { name: 'impactVelocity', label: 'Impact Velocity', type: 'number', unit: 'm/s', required: true, defaultValue: 23, min: 16, max: 39.5, step: 0.1, description: '23 m/s for 25mm ice ball' },
      { name: 'numImpacts', label: 'Number of Impacts', type: 'number', unit: '', required: true, defaultValue: 11, min: 11, max: 20, step: 1, description: 'Minimum 11 impacts at specified locations' },
      { name: 'pmaxBefore', label: 'Pmax Before Test', type: 'number', unit: 'W', required: true, defaultValue: 0, description: 'Maximum power before test' },
    ],
    acceptanceCriteria: [
      { parameter: 'powerDegradation', operator: 'max_degradation', value: 5, unit: '%', description: 'Max power degradation ≤5%' },
      { parameter: 'visualDefects', operator: 'eq', value: 0, unit: '', description: 'No glass breakage, no cell cracks visible' },
    ],
    testSequence: [
      { step: 1, name: 'Pre-conditioning', description: 'I-V, EL, and visual inspection', duration: '2 hours', parameters: {} },
      { step: 2, name: 'Impact Testing', description: 'Fire ice balls at 11 prescribed locations', duration: '1 hour', parameters: {} },
      { step: 3, name: 'Final Measurements', description: 'I-V, EL, visual inspection', duration: '2 hours', parameters: {} },
    ],
  },
]

// ============================================================================
// IEC 61730 - PV Module Safety Test Templates
// ============================================================================

export const IEC_61730_TEMPLATES: TestTemplate[] = [
  {
    id: 'iec61730-insulation',
    name: 'Insulation Resistance Test',
    standard: 'IEC 61730',
    clause: '10.3',
    category: 'safety',
    description: 'Verify that the insulation between current-carrying parts and accessible parts provides adequate protection.',
    estimatedDurationHours: 2,
    requiredEquipment: ['insulation_tester'],
    prerequisites: [],
    inputParameters: [
      { name: 'testVoltage', label: 'Test Voltage', type: 'number', unit: 'V DC', required: true, defaultValue: 1000, min: 500, max: 1500, step: 100, description: 'Applied test voltage (1000V DC or system voltage + 500V)' },
      { name: 'duration', label: 'Test Duration', type: 'number', unit: 'min', required: true, defaultValue: 1, min: 1, max: 5, step: 0.5, description: 'Minimum 1 minute measurement' },
      { name: 'moduleArea', label: 'Module Area', type: 'number', unit: 'm²', required: true, defaultValue: 0, min: 0.1, max: 5, step: 0.01, description: 'Module surface area' },
      { name: 'insulationResistance', label: 'Measured Insulation Resistance', type: 'number', unit: 'MΩ', required: true, defaultValue: 0, description: 'Measured value' },
      { name: 'ambientTemp', label: 'Ambient Temperature', type: 'number', unit: '°C', required: true, defaultValue: 25, description: 'Temperature during test' },
      { name: 'humidity', label: 'Relative Humidity', type: 'number', unit: '%', required: true, defaultValue: 50, description: 'Humidity during test' },
    ],
    acceptanceCriteria: [
      { parameter: 'insulationResistancePerArea', operator: 'gte', value: 40, unit: 'MΩ·m²', description: 'Insulation resistance × area ≥ 40 MΩ·m²' },
    ],
    testSequence: [
      { step: 1, name: 'Setup', description: 'Short circuit module leads, connect insulation tester', duration: '15 min', parameters: {} },
      { step: 2, name: 'Surface Preparation', description: 'Wrap conductive foil around module edges if required', duration: '15 min', parameters: {} },
      { step: 3, name: 'Apply Voltage', description: 'Apply test voltage for minimum 1 minute, record resistance', duration: '5 min', parameters: {} },
      { step: 4, name: 'Record Results', description: 'Calculate R × A product, compare to 40 MΩ·m²', duration: '10 min', parameters: {} },
    ],
  },
  {
    id: 'iec61730-dielectric',
    name: 'Dielectric Withstand Test (Hi-Pot)',
    standard: 'IEC 61730',
    clause: '10.4',
    category: 'safety',
    description: 'Verify adequate dielectric strength of the module insulation system.',
    estimatedDurationHours: 2,
    requiredEquipment: ['insulation_tester'],
    prerequisites: ['iec61730-insulation'],
    inputParameters: [
      { name: 'testVoltageAC', label: 'AC Test Voltage', type: 'number', unit: 'V rms', required: true, defaultValue: 2000, min: 1000, max: 4000, step: 100, description: '2000V + 4× Voc for Class II' },
      { name: 'duration', label: 'Test Duration', type: 'number', unit: 'min', required: true, defaultValue: 1, min: 1, max: 5, step: 0.5, description: '1 minute at full voltage' },
      { name: 'leakageCurrent', label: 'Leakage Current', type: 'number', unit: 'mA', required: true, defaultValue: 0, description: 'Measured leakage current' },
      { name: 'breakdown', label: 'Breakdown Occurred', type: 'boolean', unit: '', required: true, defaultValue: false, description: 'Whether dielectric breakdown occurred' },
    ],
    acceptanceCriteria: [
      { parameter: 'breakdown', operator: 'eq', value: 0, unit: '', description: 'No dielectric breakdown' },
      { parameter: 'leakageCurrent', operator: 'lte', value: 50, unit: 'mA', description: 'Leakage current ≤ 50 mA' },
    ],
    testSequence: [
      { step: 1, name: 'Preparation', description: 'Short circuit all module leads together', duration: '10 min', parameters: {} },
      { step: 2, name: 'Ramp Up', description: 'Gradually increase voltage to test level over 5 seconds', duration: '1 min', parameters: {} },
      { step: 3, name: 'Hold', description: 'Maintain test voltage for 1 minute', duration: '1 min', parameters: {} },
      { step: 4, name: 'Ramp Down', description: 'Gradually decrease voltage to zero', duration: '1 min', parameters: {} },
    ],
  },
  {
    id: 'iec61730-ground-continuity',
    name: 'Ground Continuity Test',
    standard: 'IEC 61730',
    clause: '10.14',
    category: 'safety',
    description: 'Verify the integrity of the protective grounding path for Class I modules.',
    estimatedDurationHours: 1,
    requiredEquipment: ['multimeter'],
    prerequisites: [],
    inputParameters: [
      { name: 'testCurrent', label: 'Test Current', type: 'number', unit: 'A', required: true, defaultValue: 2.5, description: '2.5× rated current or 25A (whichever is greater)' },
      { name: 'measuredResistance', label: 'Measured Resistance', type: 'number', unit: 'Ω', required: true, defaultValue: 0, description: 'Resistance between grounding point and frame' },
    ],
    acceptanceCriteria: [
      { parameter: 'measuredResistance', operator: 'lte', value: 0.1, unit: 'Ω', description: 'Ground continuity resistance ≤ 0.1Ω' },
    ],
    testSequence: [
      { step: 1, name: 'Setup', description: 'Connect test leads between earth terminal and furthest frame point', duration: '10 min', parameters: {} },
      { step: 2, name: 'Test', description: 'Pass test current for minimum 2 minutes', duration: '5 min', parameters: {} },
      { step: 3, name: 'Measure', description: 'Record resistance value', duration: '5 min', parameters: {} },
    ],
  },
]

// ============================================================================
// IEC 61853 - PV Module Energy Rating Test Templates
// ============================================================================

export const IEC_61853_TEMPLATES: TestTemplate[] = [
  {
    id: 'iec61853-matrix',
    name: 'Power Matrix Measurement',
    standard: 'IEC 61853-1',
    clause: '7',
    category: 'energy_rating',
    description: 'Measure module power output across a matrix of irradiance and temperature conditions.',
    estimatedDurationHours: 40,
    requiredEquipment: ['solar_simulator', 'iv_tester', 'thermal_chamber', 'reference_cell', 'data_logger'],
    prerequisites: ['iec61215-iv-stc'],
    inputParameters: [
      { name: 'irradianceLevels', label: 'Irradiance Levels', type: 'text', unit: 'W/m²', required: true, defaultValue: '100,200,400,600,800,1000,1100', description: 'Comma-separated irradiance levels' },
      { name: 'temperatureLevels', label: 'Temperature Levels', type: 'text', unit: '°C', required: true, defaultValue: '15,25,50,75', description: 'Comma-separated temperature levels' },
      { name: 'numMeasurements', label: 'Measurements per Point', type: 'number', unit: '', required: true, defaultValue: 3, min: 1, max: 5, step: 1, description: 'Repeat measurements for averaging' },
    ],
    acceptanceCriteria: [
      { parameter: 'matrixCompleteness', operator: 'gte', value: 90, unit: '%', description: 'At least 90% of matrix points measured' },
      { parameter: 'repeatability', operator: 'lte', value: 2, unit: '%', description: 'Measurement repeatability within ±2%' },
    ],
    testSequence: [
      { step: 1, name: 'Calibration', description: 'Calibrate solar simulator and reference cell', duration: '1 hour', parameters: {} },
      { step: 2, name: 'Matrix Measurements', description: 'Measure at each irradiance×temperature combination (23 points)', duration: '~35 hours', parameters: {} },
      { step: 3, name: 'Data Validation', description: 'Verify repeatability and consistency of measurements', duration: '2 hours', parameters: {} },
      { step: 4, name: 'Temperature Coefficient', description: 'Calculate Pmax, Voc, Isc temperature coefficients', duration: '2 hours', parameters: {} },
    ],
  },
  {
    id: 'iec61853-noct',
    name: 'NMOT/NOCT Determination',
    standard: 'IEC 61853-2',
    clause: '5',
    category: 'energy_rating',
    description: 'Determine the Nominal Module Operating Temperature (NMOT) for energy yield calculations.',
    estimatedDurationHours: 80,
    requiredEquipment: ['pyranometer', 'data_logger', 'reference_cell'],
    prerequisites: [],
    inputParameters: [
      { name: 'irradiance', label: 'Reference Irradiance', type: 'number', unit: 'W/m²', required: true, defaultValue: 800, description: '800 W/m² reference condition' },
      { name: 'ambientTemp', label: 'Ambient Temperature', type: 'number', unit: '°C', required: true, defaultValue: 20, description: '20°C reference ambient' },
      { name: 'windSpeed', label: 'Wind Speed', type: 'number', unit: 'm/s', required: true, defaultValue: 1, description: '1 m/s reference wind' },
      { name: 'measuredNMOT', label: 'Measured NMOT', type: 'number', unit: '°C', required: true, defaultValue: 0, description: 'Determined NMOT value' },
    ],
    acceptanceCriteria: [
      { parameter: 'measuredNMOT', operator: 'between', value: [35, 55], unit: '°C', description: 'NMOT typically between 35-55°C' },
    ],
    testSequence: [
      { step: 1, name: 'Outdoor Setup', description: 'Mount module on open rack, install sensors', duration: '2 hours', parameters: {} },
      { step: 2, name: 'Data Collection', description: 'Collect data over multiple clear-sky days', duration: '~72 hours', parameters: {} },
      { step: 3, name: 'NMOT Calculation', description: 'Calculate NMOT from collected data', duration: '2 hours', parameters: {} },
    ],
  },
]

// ============================================================================
// IEC 60904 - PV Device Measurement Test Templates
// ============================================================================

export const IEC_60904_TEMPLATES: TestTemplate[] = [
  {
    id: 'iec60904-iv',
    name: 'I-V Curve Measurement',
    standard: 'IEC 60904-1',
    clause: '7',
    category: 'measurement',
    description: 'Measure the current-voltage characteristics of photovoltaic devices.',
    estimatedDurationHours: 2,
    requiredEquipment: ['solar_simulator', 'iv_tester', 'reference_cell', 'data_logger'],
    prerequisites: [],
    inputParameters: [
      { name: 'irradiance', label: 'Irradiance', type: 'number', unit: 'W/m²', required: true, defaultValue: 1000, min: 100, max: 1200, step: 1, description: 'Test irradiance level' },
      { name: 'cellTemperature', label: 'Cell Temperature', type: 'number', unit: '°C', required: true, defaultValue: 25, min: 15, max: 75, step: 0.1, description: 'Cell temperature during test' },
      { name: 'sweepDirection', label: 'Sweep Direction', type: 'select', unit: '', required: true, defaultValue: 'forward', options: ['forward', 'reverse', 'both'], description: 'I-V sweep direction' },
      { name: 'sweepRate', label: 'Sweep Rate', type: 'number', unit: 'ms', required: true, defaultValue: 100, min: 10, max: 500, step: 10, description: 'Time for complete I-V sweep' },
      { name: 'dataPoints', label: 'Number of Data Points', type: 'number', unit: '', required: true, defaultValue: 200, min: 50, max: 1000, step: 10, description: 'Number of I-V pairs in sweep' },
      { name: 'voc', label: 'Voc', type: 'number', unit: 'V', required: true, defaultValue: 0, description: 'Open circuit voltage' },
      { name: 'isc', label: 'Isc', type: 'number', unit: 'A', required: true, defaultValue: 0, description: 'Short circuit current' },
      { name: 'pmax', label: 'Pmax', type: 'number', unit: 'W', required: true, defaultValue: 0, description: 'Maximum power' },
      { name: 'vmp', label: 'Vmp', type: 'number', unit: 'V', required: true, defaultValue: 0, description: 'Voltage at Pmax' },
      { name: 'imp', label: 'Imp', type: 'number', unit: 'A', required: true, defaultValue: 0, description: 'Current at Pmax' },
      { name: 'fillFactor', label: 'Fill Factor', type: 'number', unit: '%', required: true, defaultValue: 0, description: 'FF = Pmax / (Voc × Isc)' },
    ],
    acceptanceCriteria: [
      { parameter: 'fillFactor', operator: 'gte', value: 65, unit: '%', description: 'Fill factor ≥ 65% for crystalline' },
    ],
    testSequence: [
      { step: 1, name: 'Simulator Stabilization', description: 'Allow simulator to reach steady-state', duration: '30 min', parameters: {} },
      { step: 2, name: 'Reference Cell Check', description: 'Verify irradiance with calibrated reference cell', duration: '10 min', parameters: {} },
      { step: 3, name: 'Temperature Equilibrium', description: 'Wait for device to reach target temperature', duration: '30 min', parameters: {} },
      { step: 4, name: 'Forward Sweep', description: 'Sweep from Isc to Voc', duration: '1 min', parameters: {} },
      { step: 5, name: 'Reverse Sweep', description: 'Sweep from Voc to Isc (for hysteresis)', duration: '1 min', parameters: {} },
      { step: 6, name: 'Data Processing', description: 'Calculate Pmax, FF, extract parameters', duration: '15 min', parameters: {} },
    ],
  },
  {
    id: 'iec60904-spectral',
    name: 'Spectral Response Measurement',
    standard: 'IEC 60904-8',
    clause: '6',
    category: 'measurement',
    description: 'Measure the relative spectral response of a PV device.',
    estimatedDurationHours: 4,
    requiredEquipment: ['spectroradiometer', 'reference_cell', 'data_logger'],
    prerequisites: [],
    inputParameters: [
      { name: 'wavelengthStart', label: 'Start Wavelength', type: 'number', unit: 'nm', required: true, defaultValue: 300, min: 280, max: 400, step: 1, description: 'Starting wavelength' },
      { name: 'wavelengthEnd', label: 'End Wavelength', type: 'number', unit: 'nm', required: true, defaultValue: 1200, min: 1000, max: 1400, step: 1, description: 'Ending wavelength' },
      { name: 'wavelengthStep', label: 'Wavelength Step', type: 'number', unit: 'nm', required: true, defaultValue: 10, min: 1, max: 50, step: 1, description: 'Measurement interval' },
      { name: 'temperature', label: 'Device Temperature', type: 'number', unit: '°C', required: true, defaultValue: 25, description: '25°C ±2°C' },
    ],
    acceptanceCriteria: [
      { parameter: 'spectralRange', operator: 'gte', value: 300, unit: 'nm', description: 'Response measured from 300nm to 1200nm' },
    ],
    testSequence: [
      { step: 1, name: 'Calibration', description: 'Calibrate spectroradiometer with known source', duration: '30 min', parameters: {} },
      { step: 2, name: 'Dark Current', description: 'Measure device dark current at each wavelength', duration: '1 hour', parameters: {} },
      { step: 3, name: 'Spectral Scan', description: 'Measure photocurrent at each wavelength step', duration: '2 hours', parameters: {} },
      { step: 4, name: 'Data Processing', description: 'Calculate relative and absolute spectral response', duration: '30 min', parameters: {} },
    ],
  },
]

// ============================================================================
// All templates combined
// ============================================================================

export const ALL_TEST_TEMPLATES: TestTemplate[] = [
  ...IEC_61215_TEMPLATES,
  ...IEC_61730_TEMPLATES,
  ...IEC_61853_TEMPLATES,
  ...IEC_60904_TEMPLATES,
]

export function getTemplateById(id: string): TestTemplate | undefined {
  return ALL_TEST_TEMPLATES.find(t => t.id === id)
}

export function getTemplatesByStandard(standard: string): TestTemplate[] {
  return ALL_TEST_TEMPLATES.filter(t => t.standard.includes(standard))
}

export function getTemplatesByCategory(category: string): TestTemplate[] {
  return ALL_TEST_TEMPLATES.filter(t => t.category === category)
}
