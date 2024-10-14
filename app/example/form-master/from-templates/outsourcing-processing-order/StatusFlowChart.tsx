import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface StatusFlowChartProps {
  currentStatus: string;
}

const StatusFlowChart: React.FC<StatusFlowChartProps> = ({ currentStatus }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [chartDirection, setChartDirection] = useState<'LR' | 'TD'>('LR');

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 50,
        rankSpacing: 70,
      },
      theme: 'neutral',
    });
    
    const checkDeviceType = () => {
      const isMobile = window.innerWidth <= 768;
      setChartDirection(isMobile ? 'TD' : 'LR');
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    renderChart();

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, [currentStatus, chartDirection]);

  const renderChart = () => {
    if (mermaidRef.current) {
      const chart = `
        graph ${chartDirection}
          A[初始状态] -->|发送给委托方| B(待委托方收货)
          B -->|确认收货并发送给加工部门| C(待开始加工)
          C -->|开始加工| D(加工中)
          D -->|加工完成并送货| E(待我方收货)
          E -->|确认收货并发送给仓库检验| F(待检验)
          F -->|检验完成并发送给财务| G(待付款)
          G -->|已付款并发送给委托方| H(待委托方确认收款)
          H -->|确认收款| I[归档]
          
          style ${getStatusNode(currentStatus)} fill:#f9f,stroke:#333,stroke-width:4px
          
          classDef default fill:#f0f0f0,stroke:#333,stroke-width:2px,rx:5px,ry:5px;
          classDef active fill:#ff7f50,stroke:#333,stroke-width:4px,rx:5px,ry:5px;
          class ${getStatusNode(currentStatus)} active;
      `;

      mermaid.render('mermaid-chart', chart, (svgCode) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svgCode;
        }
      });
    }
  };

  const getStatusNode = (status: string): string => {
    switch (status) {
      case 'initial': return 'A';
      case 'pending_partner_receipt': return 'B';
      case 'pending_processing_start': return 'C';
      case 'processing': return 'D';
      case 'pending_our_receipt': return 'E';
      case 'pending_inspection': return 'F';
      case 'pending_payment': return 'G';
      case 'pending_partner_payment_confirmation': return 'H';
      case 'archived': return 'I';
      default: return '';
    }
  };

  const statusDescriptions: { [key: string]: string } = {
    initial: '订单刚创建，等待发送给委托方',
    pending_partner_receipt: '订单已发送给委托方，等待委托方确认收货',
    pending_processing_start: '委托方已确认收货，等待加工部门开始加工',
    processing: '加工部门正在进行加工',
    pending_our_receipt: '加工完成，等待我方确认收货',
    pending_inspection: '我方已收货，等待仓库检验',
    pending_payment: '检验完成，等待财务付款',
    pending_partner_payment_confirmation: '已付款，等待委托方确认收款',
    archived: '订单已完成并归档'
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">订单状态流程图</h3>
      <div className="overflow-x-auto pb-4">
        <div ref={mermaidRef} className="mermaid min-w-[800px]"></div>
      </div>
      <div className="mt-4">
        <h4 className="text-md font-semibold mb-2">当前状态说明：</h4>
        <p className="text-sm text-gray-600">{statusDescriptions[currentStatus] || '未知状态'}</p>
      </div>
    </div>
  );
};

export default StatusFlowChart;