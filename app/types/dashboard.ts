export interface IDashboardChartItem {
  label: string
  value: string
  total: number
}

export interface IDashboardStats {
  total_pegawai: number
  bar_chart_golongan: IDashboardChartItem[]
  pie_chart_jenis_kelamin: IDashboardChartItem[]
}

export interface IDashboardStatsResponse {
  data: IDashboardStats
}
