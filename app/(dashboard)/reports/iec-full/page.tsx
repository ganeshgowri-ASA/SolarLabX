// @ts-nocheck
import IECFullReportView from '@/components/reports/IECFullReportView'

export default function IECFullReportPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IEC Full Compliance Report</h1>
        <p className="text-sm text-gray-500">
          Exhaustive test report – IEC 61215:2021 / IEC 61730:2023 / IEC 61853:2020 / IEC 61701:2020
          &nbsp;·&nbsp; All MQTs &amp; MSTs with pass/fail status, measured values, and charts
        </p>
      </div>
      <IECFullReportView />
    </div>
  )
}
