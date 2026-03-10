// IEC Test Workflow Flowchart Data

export interface FlowchartNode {
  id: string
  label: string
  type: 'start' | 'process' | 'decision' | 'end' | 'subprocess'
  description?: string
  standard?: string
  x: number
  y: number
}

export interface FlowchartEdge {
  from: string
  to: string
  label?: string
}

export interface FlowchartDefinition {
  id: string
  title: string
  standard: string
  description: string
  nodes: FlowchartNode[]
  edges: FlowchartEdge[]
}

export const flowcharts: FlowchartDefinition[] = [
  {
    id: 'iec-61215',
    title: 'IEC 61215 - Design Qualification',
    standard: 'IEC 61215',
    description: 'Terrestrial PV module design qualification and type approval test sequence',
    nodes: [
      { id: 'start', label: 'Sample Reception', type: 'start', description: 'Receive & register PV module sample', x: 400, y: 30 },
      { id: 'visual', label: 'Visual Inspection\n(MQT 01)', type: 'process', standard: 'IEC 61215-2 Cl.4.1', x: 400, y: 110 },
      { id: 'stc', label: 'STC Power\nMeasurement (MQT 06)', type: 'process', standard: 'IEC 60904-1', x: 400, y: 190 },
      { id: 'el-initial', label: 'EL Imaging\n(Initial)', type: 'process', standard: 'IEC TS 60904-13', x: 400, y: 270 },
      { id: 'split', label: 'Test Sequence\nAllocation?', type: 'decision', description: 'Allocate modules to test sequences', x: 400, y: 360 },
      { id: 'seq-a', label: 'Sequence A:\nThermal Cycling\n(MQT 11) 200 cycles', type: 'subprocess', standard: 'IEC 61215-2 Cl.4.11', x: 150, y: 470 },
      { id: 'seq-b', label: 'Sequence B:\nDamp Heat\n(MQT 13) 1000h', type: 'subprocess', standard: 'IEC 61215-2 Cl.4.13', x: 400, y: 470 },
      { id: 'seq-c', label: 'Sequence C:\nMechanical Load\n(MQT 16)', type: 'subprocess', standard: 'IEC 61215-2 Cl.4.16', x: 650, y: 470 },
      { id: 'hf-a', label: 'Humidity Freeze\n(MQT 12) 10 cycles', type: 'process', standard: 'IEC 61215-2 Cl.4.12', x: 150, y: 570 },
      { id: 'wet-b', label: 'Wet Leakage\n(MQT 15)', type: 'process', standard: 'IEC 61215-2 Cl.4.15', x: 400, y: 570 },
      { id: 'hail', label: 'Hail Test\n(MQT 17)', type: 'process', standard: 'IEC 61215-2 Cl.4.17', x: 650, y: 570 },
      { id: 'final-stc', label: 'Final STC Power\nMeasurement', type: 'process', standard: 'IEC 60904-1', x: 400, y: 660 },
      { id: 'el-final', label: 'EL Imaging\n(Final)', type: 'process', standard: 'IEC TS 60904-13', x: 400, y: 740 },
      { id: 'pass-fail', label: 'Degradation\n≤ 5%?', type: 'decision', description: 'Compare initial vs final power', x: 400, y: 830 },
      { id: 'pass', label: 'PASS\nIssue Certificate', type: 'end', x: 250, y: 920 },
      { id: 'fail', label: 'FAIL\nIssue Report', type: 'end', x: 550, y: 920 },
    ],
    edges: [
      { from: 'start', to: 'visual' },
      { from: 'visual', to: 'stc' },
      { from: 'stc', to: 'el-initial' },
      { from: 'el-initial', to: 'split' },
      { from: 'split', to: 'seq-a', label: 'Seq A' },
      { from: 'split', to: 'seq-b', label: 'Seq B' },
      { from: 'split', to: 'seq-c', label: 'Seq C' },
      { from: 'seq-a', to: 'hf-a' },
      { from: 'seq-b', to: 'wet-b' },
      { from: 'seq-c', to: 'hail' },
      { from: 'hf-a', to: 'final-stc' },
      { from: 'wet-b', to: 'final-stc' },
      { from: 'hail', to: 'final-stc' },
      { from: 'final-stc', to: 'el-final' },
      { from: 'el-final', to: 'pass-fail' },
      { from: 'pass-fail', to: 'pass', label: 'Yes' },
      { from: 'pass-fail', to: 'fail', label: 'No' },
    ],
  },
  {
    id: 'iec-61730',
    title: 'IEC 61730 - Safety Qualification',
    standard: 'IEC 61730',
    description: 'PV module safety qualification — construction and testing requirements',
    nodes: [
      { id: 'start', label: 'Sample Reception', type: 'start', description: 'Receive & register PV module', x: 400, y: 30 },
      { id: 'construct', label: 'Construction\nEvaluation (MST 01)', type: 'process', standard: 'IEC 61730-1', x: 400, y: 110 },
      { id: 'marking', label: 'Marking &\nDocumentation (MST 02)', type: 'process', standard: 'IEC 61730-1 Cl.6', x: 400, y: 190 },
      { id: 'visual', label: 'Visual Inspection\n(MST 01)', type: 'process', standard: 'IEC 61730-2 Cl.10.1', x: 400, y: 270 },
      { id: 'split', label: 'Safety Test\nGroup?', type: 'decision', x: 400, y: 360 },
      { id: 'group-e', label: 'Electrical:\nInsulation (MST 16)\nDielectric (MST 17)\nGround Continuity (MST 13)', type: 'subprocess', standard: 'IEC 61730-2', x: 150, y: 480 },
      { id: 'group-f', label: 'Fire:\nFlammability (MST 23)\nIgnition (MST 24)\nBurning Brand (MST 25)', type: 'subprocess', standard: 'IEC 61730-2', x: 400, y: 480 },
      { id: 'group-m', label: 'Mechanical:\nMechanical Load (MST 34)\nImpact Test (MST 32)\nBend Test (MST 31)', type: 'subprocess', standard: 'IEC 61730-2', x: 650, y: 480 },
      { id: 'access', label: 'Accessibility\nTest (MST 12)', type: 'process', standard: 'IEC 61730-2 Cl.10.3', x: 400, y: 600 },
      { id: 'hotspot', label: 'Hot Spot\nEndurance (MST 22)', type: 'process', standard: 'IEC 61730-2 Cl.10.18', x: 400, y: 680 },
      { id: 'result', label: 'All Safety Tests\nPassed?', type: 'decision', x: 400, y: 770 },
      { id: 'pass', label: 'Safety Class\nCertified', type: 'end', x: 250, y: 860 },
      { id: 'fail', label: 'FAIL\nSafety Non-Conformance', type: 'end', x: 550, y: 860 },
    ],
    edges: [
      { from: 'start', to: 'construct' },
      { from: 'construct', to: 'marking' },
      { from: 'marking', to: 'visual' },
      { from: 'visual', to: 'split' },
      { from: 'split', to: 'group-e', label: 'Electrical' },
      { from: 'split', to: 'group-f', label: 'Fire' },
      { from: 'split', to: 'group-m', label: 'Mechanical' },
      { from: 'group-e', to: 'access' },
      { from: 'group-f', to: 'access' },
      { from: 'group-m', to: 'access' },
      { from: 'access', to: 'hotspot' },
      { from: 'hotspot', to: 'result' },
      { from: 'result', to: 'pass', label: 'Yes' },
      { from: 'result', to: 'fail', label: 'No' },
    ],
  },
  {
    id: 'iec-61853',
    title: 'IEC 61853 - Energy Rating',
    standard: 'IEC 61853',
    description: 'PV module performance testing and energy rating under various conditions',
    nodes: [
      { id: 'start', label: 'Sample Reception', type: 'start', x: 400, y: 30 },
      { id: 'stc', label: 'STC Baseline\nMeasurement', type: 'process', standard: 'IEC 60904-1', x: 400, y: 110 },
      { id: 'stabilize', label: 'Light Soaking\nStabilization', type: 'process', standard: 'IEC 61215-2 MQT 19', x: 400, y: 190 },
      { id: 'split', label: 'Energy Rating\nTest Set?', type: 'decision', x: 400, y: 280 },
      { id: 'part1', label: 'Part 1:\nIrradiance &\nTemp Matrix\n(6x4 = 24 points)', type: 'subprocess', standard: 'IEC 61853-1', x: 150, y: 400 },
      { id: 'part2', label: 'Part 2:\nSpectral Response\n& Angle of\nIncidence', type: 'subprocess', standard: 'IEC 61853-2', x: 400, y: 400 },
      { id: 'part3', label: 'Part 3:\nEnergy Rating\nCalculation\n(Climate Profiles)', type: 'subprocess', standard: 'IEC 61853-3', x: 650, y: 400 },
      { id: 'noct', label: 'NMOT / NOCT\nMeasurement', type: 'process', standard: 'IEC 61853-2 Cl.6', x: 150, y: 520 },
      { id: 'aoi', label: 'AOI Correction\nFactor', type: 'process', standard: 'IEC 61853-2 Cl.5', x: 400, y: 520 },
      { id: 'climate', label: 'Climate-Specific\nYield Calculation', type: 'process', standard: 'IEC 61853-3', x: 650, y: 520 },
      { id: 'compile', label: 'Compile Energy\nRating Report', type: 'process', x: 400, y: 620 },
      { id: 'end', label: 'Report Delivered', type: 'end', x: 400, y: 710 },
    ],
    edges: [
      { from: 'start', to: 'stc' },
      { from: 'stc', to: 'stabilize' },
      { from: 'stabilize', to: 'split' },
      { from: 'split', to: 'part1', label: 'Part 1' },
      { from: 'split', to: 'part2', label: 'Part 2' },
      { from: 'split', to: 'part3', label: 'Part 3' },
      { from: 'part1', to: 'noct' },
      { from: 'part2', to: 'aoi' },
      { from: 'part3', to: 'climate' },
      { from: 'noct', to: 'compile' },
      { from: 'aoi', to: 'compile' },
      { from: 'climate', to: 'compile' },
      { from: 'compile', to: 'end' },
    ],
  },
  {
    id: 'iec-62915-bom',
    title: 'IEC 62915 - BoM Change Impact',
    standard: 'IEC 62915',
    description: 'Bill of Materials change impact assessment per IEC 62915 — retesting decision flowchart',
    nodes: [
      { id: 'start', label: 'BoM Change\nNotification', type: 'start', x: 400, y: 30 },
      { id: 'classify', label: 'Classify Change\nType', type: 'process', description: 'Identify component changed', x: 400, y: 110 },
      { id: 'level', label: 'Change\nLevel?', type: 'decision', description: 'Minor / Major / Critical', x: 400, y: 200 },
      { id: 'minor', label: 'Minor Change:\nDocumentation\nReview Only', type: 'process', standard: 'IEC 62915 Cl.5.2', x: 150, y: 310 },
      { id: 'major', label: 'Major Change:\nPartial Retesting\nRequired', type: 'subprocess', standard: 'IEC 62915 Cl.5.3', x: 400, y: 310 },
      { id: 'critical', label: 'Critical Change:\nFull Requalification\nRequired', type: 'subprocess', standard: 'IEC 62915 Cl.5.4', x: 650, y: 310 },
      { id: 'impact', label: 'Impact\nAssessment', type: 'process', description: 'Evaluate which tests affected', x: 400, y: 420 },
      { id: 'select', label: 'Select Required\nTest Sequences', type: 'process', standard: 'IEC 62915 Table 1', x: 400, y: 500 },
      { id: 'execute', label: 'Execute\nRetest Program', type: 'subprocess', x: 400, y: 580 },
      { id: 'eval', label: 'Retest\nPassed?', type: 'decision', x: 400, y: 670 },
      { id: 'approve', label: 'BoM Change\nApproved', type: 'end', x: 250, y: 760 },
      { id: 'reject', label: 'BoM Change\nRejected', type: 'end', x: 550, y: 760 },
    ],
    edges: [
      { from: 'start', to: 'classify' },
      { from: 'classify', to: 'level' },
      { from: 'level', to: 'minor', label: 'Minor' },
      { from: 'level', to: 'major', label: 'Major' },
      { from: 'level', to: 'critical', label: 'Critical' },
      { from: 'minor', to: 'approve' },
      { from: 'major', to: 'impact' },
      { from: 'critical', to: 'impact' },
      { from: 'impact', to: 'select' },
      { from: 'select', to: 'execute' },
      { from: 'execute', to: 'eval' },
      { from: 'eval', to: 'approve', label: 'Yes' },
      { from: 'eval', to: 'reject', label: 'No' },
    ],
  },
  {
    id: 'lab-workflow',
    title: 'Lab Workflow - Sample to Report',
    standard: 'ISO 17025',
    description: 'Complete lab workflow from sample reception to report delivery',
    nodes: [
      { id: 'start', label: 'Client Request\nReceived', type: 'start', x: 400, y: 30 },
      { id: 'review', label: 'Request Review\n& Quotation', type: 'process', x: 400, y: 110 },
      { id: 'accepted', label: 'Quote\nAccepted?', type: 'decision', x: 400, y: 200 },
      { id: 'reject-req', label: 'Request\nClosed', type: 'end', x: 600, y: 200 },
      { id: 'receive', label: 'Sample\nReception &\nInspection', type: 'process', standard: 'ISO 17025 Cl.7.4', x: 400, y: 300 },
      { id: 'condition', label: 'Sample\nCondition OK?', type: 'decision', x: 400, y: 390 },
      { id: 'ncr', label: 'Raise NCR\nNotify Client', type: 'process', x: 600, y: 390 },
      { id: 'register', label: 'Register in LIMS\nAssign Sample ID\nGenerate QR Code', type: 'process', x: 400, y: 480 },
      { id: 'allocate', label: 'Allocate Test\nSequences &\nEquipment', type: 'process', x: 400, y: 560 },
      { id: 'execute', label: 'Test Execution\n(Per Route Card)', type: 'subprocess', x: 400, y: 640 },
      { id: 'data-review', label: 'Data Review\n& Validation', type: 'process', standard: 'ISO 17025 Cl.7.7', x: 400, y: 720 },
      { id: 'report', label: 'Report\nGeneration', type: 'process', standard: 'ISO 17025 Cl.7.8', x: 400, y: 800 },
      { id: 'approve', label: 'Technical\nReview &\nApproval?', type: 'decision', x: 400, y: 890 },
      { id: 'rework', label: 'Rework\nRequired', type: 'process', x: 600, y: 890 },
      { id: 'deliver', label: 'Report Delivered\nto Client', type: 'end', x: 400, y: 980 },
    ],
    edges: [
      { from: 'start', to: 'review' },
      { from: 'review', to: 'accepted' },
      { from: 'accepted', to: 'reject-req', label: 'No' },
      { from: 'accepted', to: 'receive', label: 'Yes' },
      { from: 'receive', to: 'condition' },
      { from: 'condition', to: 'ncr', label: 'No' },
      { from: 'condition', to: 'register', label: 'Yes' },
      { from: 'ncr', to: 'receive' },
      { from: 'register', to: 'allocate' },
      { from: 'allocate', to: 'execute' },
      { from: 'execute', to: 'data-review' },
      { from: 'data-review', to: 'report' },
      { from: 'report', to: 'approve' },
      { from: 'approve', to: 'rework', label: 'No' },
      { from: 'approve', to: 'deliver', label: 'Yes' },
      { from: 'rework', to: 'data-review' },
    ],
  },
]
