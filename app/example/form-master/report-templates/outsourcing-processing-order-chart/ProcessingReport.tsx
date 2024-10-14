import React, { useState, useEffect, useMemo } from "react"
import EChartsComponent from "../../reports/EChartsComponent"
import { EChartsOption } from "echarts"
import { getMetadata } from "../../../service/apis/metadata"
import { jsonParse } from "../../../utils"
import { Card, CardBody, CardHeader, Progress, Tooltip } from "@nextui-org/react"
import { stateMachine } from "../../from-templates/outsourcing-processing-order/state-machine"
import { Icon } from "@iconify/react"
import MapComponent from "../../reports/MapComponent"

interface ProcessingReportProps {
  reportId: string
  data: any
}

interface StatusCount {
  [key: string]: number
}

interface ChartDataItem {
  id: string
  templateId: string
  status: string
  data: {
    orderNumber: string
    manufacturerCode: string
    manufacturerName: string
    manufacturerAddress: string
    manufacturerContact: number
    manufacturerContactPerson: string
    orderDate: string
    expectedDeliveryDate: string
    items: Array<{
      物料名称: string
      规格: string
      单位: string
      数量: number
      加工工序: string
      单价: number
      总价: number
      交期: string
    }>
    totalAmount: number
    notes: string
  }
  modifiedBy: string
  versionCode: string
}

interface DailyStats {
  date: string
  count: number
  amount: number
}

interface SupplierStats {
  name: string
  totalAmount: number
  pendingPayment: number
}

interface SupplierLocation {
  name: string
  address: string
  value: number
}

const initialStatusCounts: StatusCount = Object.keys(stateMachine).reduce((acc, status) => {
  acc[status] = 0
  return acc
}, {} as StatusCount)

const statusDescriptions: { [key: string]: string } = {
  initial: "初始状态",
  pending_partner_receipt: "待委托方收货",
  pending_processing_start: "待开始加工",
  processing: "加工中",
  pending_our_receipt: "待我方收货",
  pending_inspection: "待检验",
  pending_payment: "待付款",
  pending_partner_payment_confirmation: "待委托方确认收款",
  archived: "已归档",
}

const statusColors: { [key: string]: string } = {
  initial: "default",
  pending_partner_receipt: "warning",
  pending_processing_start: "primary",
  processing: "secondary",
  pending_our_receipt: "warning",
  pending_inspection: "primary",
  pending_payment: "danger",
  pending_partner_payment_confirmation: "warning",
  archived: "success",
}

const ProcessingReport: React.FC<ProcessingReportProps> = ({ reportId, data }) => {
  const [chartOption, setChartOption] = useState<EChartsOption>({})
  const [dailyChartOption, setDailyChartOption] = useState<EChartsOption>({})
  const [statusCounts, setStatusCounts] = useState<StatusCount>(initialStatusCounts)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [pendingPayment, setPendingPayment] = useState<number>(0)
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [totalOrders, setTotalOrders] = useState<number>(0)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [supplierStats, setSupplierStats] = useState<SupplierStats[]>([])
  const [supplierLocations, setSupplierLocations] = useState<SupplierLocation[]>([])

  // 处理供应商占比数据的函数
  const processSupplierData = (chartData: ChartDataItem[]): { value: number; name: string }[] => {
    const supplierCounts: { [key: string]: number } = {}
    const supplierAmounts: { [key: string]: number } = {}
    const supplierPendingPayments: { [key: string]: number } = {}
    const supplierLocations: SupplierLocation[] = []
    let totalOrders = 0

    chartData.forEach((item) => {
      const supplierName = item.data.manufacturerName
      supplierCounts[supplierName] = (supplierCounts[supplierName] || 0) + 1
      supplierAmounts[supplierName] = (supplierAmounts[supplierName] || 0) + item.data.totalAmount
      if (item.status === "pending_payment" || item.status === "pending_partner_payment_confirmation") {
        supplierPendingPayments[supplierName] = (supplierPendingPayments[supplierName] || 0) + item.data.totalAmount
      }
      totalOrders++

      // 添加供应商位置信息
      supplierLocations.push({
        name: supplierName,
        address: item.data.manufacturerAddress,
        value: item.data.totalAmount
      })
    })

    const supplierStatsData = Object.keys(supplierCounts).map((name) => ({
      name,
      totalAmount: supplierAmounts[name],
      pendingPayment: supplierPendingPayments[name] || 0,
    }))
    setSupplierStats(supplierStatsData)
    setSupplierLocations(supplierLocations)

    return Object.entries(supplierCounts).map(([name, count]) => ({
      value: (count / totalOrders) * 100,
      name: name,
    }))
  }

  // 处理每日统计数据的函数
  const processDailyStats = (chartData: ChartDataItem[]): DailyStats[] => {
    const dailyData: { [key: string]: DailyStats } = {}

    chartData.forEach((item) => {
      const date = item.data.orderDate.split("T")[0] // 假设orderDate格式为ISO 8601
      if (!dailyData[date]) {
        dailyData[date] = { date, count: 0, amount: 0 }
      }
      dailyData[date].count += 1
      dailyData[date].amount += item.data.totalAmount
    })

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
  }

  useEffect(() => {
    async function getData() {
      const names = data?.dataSources?.map((item) => `form_${item}`)
      const res = await getMetadata(names)
      const chartData: ChartDataItem[] = res.data?.map((item) => jsonParse(item.value))
      console.log(chartData)

      // 处理状态统计
      const counts: StatusCount = { ...initialStatusCounts }
      let totalAmountSum = 0
      let pendingPaymentSum = 0
      let paidAmountSum = 0
      let totalOrdersCount = chartData.length

      chartData.forEach((item) => {
        const status = item.status
        counts[status] = (counts[status] || 0) + 1
        totalAmountSum += item.data.totalAmount

        if (status === "pending_payment" || status === "pending_partner_payment_confirmation") {
          pendingPaymentSum += item.data.totalAmount
        } else if (status === "archived") {
          paidAmountSum += item.data.totalAmount
        }
      })

      setStatusCounts(counts)
      setTotalAmount(totalAmountSum)
      setPendingPayment(pendingPaymentSum)
      setPaidAmount(paidAmountSum)
      setTotalOrders(totalOrdersCount)

      // 处理供应商占比数据
      const supplierData = processSupplierData(chartData)

      // 处理每日统计数据
      const dailyStatsData = processDailyStats(chartData)
      setDailyStats(dailyStatsData)

      const option: EChartsOption = {
        title: {
          text: "委外加工单供应商占比",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c}% ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        series: [
          {
            name: "供应商占比",
            type: "pie",
            radius: "50%",
            data: supplierData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      }

      setChartOption(option)

      // 设置每日统计图表选项
      const dailyOption: EChartsOption = {
        title: {
          text: "每日加工单统计",
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        legend: {
          data: ["加工单数量", "加工单金额"],
          bottom: 0,
        },
        xAxis: [
          {
            type: "category",
            data: dailyStatsData.map((item) => item.date),
            axisPointer: {
              type: "shadow",
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            name: "加工单数量",
            min: 0,
            axisLabel: {
              formatter: "{value}",
            },
          },
          {
            type: "value",
            name: "加工单金额",
            min: 0,
            axisLabel: {
              formatter: "{value} 元",
            },
          },
        ],
        series: [
          {
            name: "加工单数量",
            type: "bar",
            data: dailyStatsData.map((item) => item.count),
          },
          {
            name: "加工单金额",
            type: "line",
            yAxisIndex: 1,
            data: dailyStatsData.map((item) => item.amount),
          },
        ],
      }

      setDailyChartOption(dailyOption)
    }
    getData()
  }, [data])

  const renderCard = (title: string, amount: number, icon: string) => (
    <Card className='w-full'>
      <CardBody className='flex flex-row items-center justify-between'>
        <div>
          <p className='text-md'>{title}</p>
          <p className='text-2xl font-bold'>¥{amount.toFixed(2)}</p>
        </div>
        <Icon icon={icon} width='40' height='40' />
      </CardBody>
    </Card>
  )

  const renderStatusStatistics = () => (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {Object.entries(statusCounts).map(([status, count]) => (
        <Tooltip key={status} content={`${count} 个订单`}>
          <div className='flex flex-col'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm'>{statusDescriptions[status] || status}</span>
              <span className='text-sm font-semibold'>{((count / totalOrders) * 100).toFixed(1)}%</span>
            </div>
            <Progress
              value={(count / totalOrders) * 100}
              color={statusColors[status] as "default" | "primary" | "secondary" | "success" | "warning" | "danger"}
              className='h-2'
            />
          </div>
        </Tooltip>
      ))}
    </div>
  )

  const renderSupplierCard = (supplier: SupplierStats) => (
    <Card key={supplier.name} className='w-full mb-4'>
      <CardHeader>
        <h3 className='text-lg font-semibold'>{supplier.name}</h3>
      </CardHeader>
      <CardBody>
        <div className='flex justify-between items-center mb-2'>
          <span>加工总金额:</span>
          <span className='font-bold'>¥{supplier.totalAmount.toFixed(2)}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span>待付款金额:</span>
          <span className='font-bold'>¥{supplier.pendingPayment.toFixed(2)}</span>
        </div>
      </CardBody>
    </Card>
  )

  return (
    <div>
      <h2 className='text-black'>委外加工报表 (ID: {reportId})</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
        {renderCard("加工总金额", totalAmount, "mdi:cash-multiple")}
        {renderCard("待付款金额", pendingPayment, "mdi:cash-clock")}
        {renderCard("已付款金额", paidAmount, "mdi:cash-check")}
      </div>
      <Card className='mb-4'>
        <CardHeader>
          <h3 className='text-lg font-semibold'>状态统计</h3>
        </CardHeader>
        <CardBody>{renderStatusStatistics()}</CardBody>
      </Card>
      <Card className='mb-4'>
        <CardHeader>
          <h3 className='text-lg font-semibold'>状态统计（原有呈现方式）</h3>
        </CardHeader>
        <CardBody>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className='flex justify-between'>
              <span>{statusDescriptions[status] || status}:</span>
              <span>{count}</span>
            </div>
          ))}
        </CardBody>
      </Card>
      <Card className='mb-4'>
        <CardHeader>
          <h3 className='text-lg font-semibold'>供应商占比</h3>
        </CardHeader>
        <CardBody>
          <EChartsComponent option={chartOption} style={{ height: "400px", width: "100%" }} />
        </CardBody>
      </Card>
      <Card className='mb-4'>
        <CardHeader>
          <h3 className='text-lg font-semibold'>每日加工单统计</h3>
        </CardHeader>
        <CardBody>
          <EChartsComponent option={dailyChartOption} style={{ height: "400px", width: "100%" }} />
        </CardBody>
      </Card>
      <Card className='mb-4'>
        <CardHeader>
          <h3 className='text-lg font-semibold'>供应商维度统计</h3>
        </CardHeader>
        <CardBody>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {supplierStats.map(renderSupplierCard)}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default ProcessingReport
