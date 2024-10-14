import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts/extension/bmap/bmap';

interface MapComponentProps {
  address?: string;
  data?: Array<{
    name: string;
    address: string;
    value: number;
    orderCount: number; // 新增订单数量字段
  }>;
}

const MapComponent: React.FC<MapComponentProps> = ({ address, data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      
      // 加载百度地图 JS API
      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=4vmZ4F78PjlmoZrabEScBjI1g4gRCY2B&callback=initMap`;
      document.body.appendChild(script);

      window.initMap = () => {
        const option = getChartOption();
        chart.setOption(option);

        if (address) {
          geocodeAddress(address, chart);
        } else if (data && data.length > 0) {
          geocodeMultipleAddresses(data, chart);
        }
      };

      return () => {
        chart.dispose();
        document.body.removeChild(script);
      };
    }
  }, [address, data]);

  const getChartOption = () => {
    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: '委托加工厂商分布图',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const { name, value } = params.data;
          return `${name}<br/>加工金额: ¥${value[2].toFixed(2)}<br/>订单数量: ${value[3]}`;
        }
      },
      bmap: {
        center: [104.114129, 37.550339],
        zoom: 5,
        roam: true,
        mapStyle: {
          styleJson: [
            {
              featureType: 'water',
              elementType: 'all',
              stylers: {
                color: '#d1d1d1'
              }
            },
            {
              featureType: 'land',
              elementType: 'all',
              stylers: {
                color: '#f3f3f3'
              }
            },
            {
              featureType: 'railway',
              elementType: 'all',
              stylers: {
                visibility: 'off'
              }
            },
            {
              featureType: 'highway',
              elementType: 'all',
              stylers: {
                color: '#fdfdfd'
              }
            },
            {
              featureType: 'highway',
              elementType: 'labels',
              stylers: {
                visibility: 'off'
              }
            },
            {
              featureType: 'arterial',
              elementType: 'geometry',
              stylers: {
                color: '#fefefe'
              }
            },
            {
              featureType: 'arterial',
              elementType: 'geometry.fill',
              stylers: {
                color: '#fefefe'
              }
            },
            {
              featureType: 'poi',
              elementType: 'all',
              stylers: {
                visibility: 'off'
              }
            },
            {
              featureType: 'green',
              elementType: 'all',
              stylers: {
                visibility: 'off'
              }
            },
            {
              featureType: 'subway',
              elementType: 'all',
              stylers: {
                visibility: 'off'
              }
            },
            {
              featureType: 'manmade',
              elementType: 'all',
              stylers: {
                color: '#d1d1d1'
              }
            },
            {
              featureType: 'local',
              elementType: 'all',
              stylers: {
                color: '#d1d1d1'
              }
            },
            {
              featureType: 'arterial',
              elementType: 'labels',
              stylers: {
                visibility: 'off'
              }
            },
            {
              featureType: 'boundary',
              elementType: 'all',
              stylers: {
                color: '#fefefe'
              }
            },
            {
              featureType: 'building',
              elementType: 'all',
              stylers: {
                color: '#d1d1d1'
              }
            },
            {
              featureType: 'label',
              elementType: 'labels.text.fill',
              stylers: {
                color: '#999999'
              }
            }
          ]
        }
      },
      series: [
        {
          name: '供应商',
          type: 'scatter',
          coordinateSystem: 'bmap',
          data: [],
          symbolSize: (val: any) => {
            return Math.sqrt(val[3]) * 5; // 使用订单数量来决定圆圈大小
          },
          itemStyle: {
            color: (params: any) => {
              // 使用金额来决定颜色深度
              const value = params.data.value[2];
              const maxValue = Math.max(...data!.map(item => item.value));
              const minValue = Math.min(...data!.map(item => item.value));
              const normalizedValue = (value - minValue) / (maxValue - minValue);
              return `rgba(255, 0, 0, ${0.2 + normalizedValue * 0.8})`; // 红色，透明度从0.2到1
            }
          },
          encode: {
            value: 2
          },
          label: {
            formatter: '{b}',
            position: 'right',
            show: false
          },
          emphasis: {
            label: {
              show: true
            }
          }
        }
      ]
    };

    return option;
  };

  const geocodeAddress = (address: string, chart: echarts.ECharts) => {
    const geocoder = new (window as any).BMap.Geocoder();
    geocoder.getPoint(address, function(point: any) {
      if (point) {
        chart.setOption({
          bmap: {
            center: [point.lng, point.lat],
            zoom: 12
          },
          series: [
            {
              type: 'scatter',
              coordinateSystem: 'bmap',
              data: [[point.lng, point.lat, 100, 1]], // 添加默认订单数量
              symbolSize: 20,
              itemStyle: {
                color: 'red'
              }
            }
          ]
        });
      } else {
        console.error("无法解析该地址: " + address);
      }
    });
  };

  const geocodeMultipleAddresses = (addresses: Array<{ name: string; address: string; value: number; orderCount: number }>, chart: echarts.ECharts) => {
    const geocoder = new (window as any).BMap.Geocoder();
    const geocodePromises = addresses.map(item => 
      new Promise((resolve) => {
        geocoder.getPoint(item.address, function(point: any) {
          if (point) {
            resolve({ name: item.name, value: [point.lng, point.lat, item.value, item.orderCount] });
          } else {
            console.error("无法解析该地址: " + item.address);
            resolve(null);
          }
        });
      })
    );

    Promise.all(geocodePromises).then((results) => {
      const validResults = results.filter(result => result !== null);
      chart.setOption({
        series: [
          {
            data: validResults
          }
        ]
      });
    });
  };

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default MapComponent;