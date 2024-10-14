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
          A[草稿] -->|提交申请| B(待审批)
          B -->|批准| C(已批准)
          B -->|拒绝| D(已拒绝)
          C -->|归档| E[已归档]
          D -->|归档| E
          
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
      case 'draft': return 'A';
      case 'pending_approval': return 'B';
      case 'approved': return 'C';
      case 'rejected': return 'D';
      case 'archived': return 'E';
      default: return '';
    }
  };

  const statusDescriptions: { [key: string]: string } = {
    draft: '请假申请刚创建，等待提交',
    pending_approval: '请假申请已提交，等待审批',
    approved: '请假申请已批准',
    rejected: '请假申请已拒绝',
    archived: '请假申请已归档'
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">请假申请状态流程图</h3>
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