import React from 'react';
import type { AnalyticsData } from '../../types/admin.types';

interface AnalyticsChartProps {
  data: AnalyticsData;
  type: 'userGrowth' | 'petRegistrations' | 'appointmentStats' | 'socialActivity' | 'revenue';
  title: string;
  height?: number;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  data, 
  type, 
  title, 
  height = 300 
}) => {
  const getChartData = () => {
    switch (type) {
      case 'userGrowth':
        return data.userGrowth;
      case 'petRegistrations':
        return data.petRegistrations;
      case 'appointmentStats':
        return data.appointmentStats;
      case 'socialActivity':
        return data.socialActivity;
      case 'revenue':
        return data.revenueData;
      default:
        return [];
    }
  };

  const chartData = getChartData();

  const renderLineChart = () => {
    if (!chartData.length) return null;

    const maxValue = Math.max(...chartData.map(item => {
      switch (type) {
        case 'userGrowth':
          return Math.max((item as any).users, (item as any).newUsers);
        case 'petRegistrations':
          return (item as any).count;
        case 'revenue':
          return (item as any).amount;
        default:
          return 0;
      }
    }));

    const chartHeight = height - 80;
    const chartWidth = 600;
    const padding = 40;

    return (
      <div className="relative">
        <svg width={chartWidth} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1={padding}
                y1={padding + chartHeight * ratio}
                x2={chartWidth - padding}
                y2={padding + chartHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={padding + chartHeight * ratio + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {Math.round(maxValue * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* Data line */}
          {type === 'userGrowth' && (
            <>
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points={chartData.map((item, index) => {
                  const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
                  const y = padding + chartHeight - ((item as any).users / maxValue) * chartHeight;
                  return `${x},${y}`;
                }).join(' ')}
              />
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
                points={chartData.map((item, index) => {
                  const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
                  const y = padding + chartHeight - ((item as any).newUsers / maxValue) * chartHeight;
                  return `${x},${y}`;
                }).join(' ')}
              />
            </>
          )}

          {type === 'petRegistrations' && (
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              points={chartData.map((item, index) => {
                const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
                const y = padding + chartHeight - ((item as any).count / maxValue) * chartHeight;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}

          {type === 'revenue' && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              points={chartData.map((item, index) => {
                const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
                const y = padding + chartHeight - ((item as any).amount / maxValue) * chartHeight;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}

          {/* Data points */}
          {chartData.map((item, index) => {
            const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
            let y = 0;
            
            switch (type) {
              case 'userGrowth':
                y = padding + chartHeight - ((item as any).users / maxValue) * chartHeight;
                break;
              case 'petRegistrations':
                y = padding + chartHeight - ((item as any).count / maxValue) * chartHeight;
                break;
              case 'revenue':
                y = padding + chartHeight - ((item as any).amount / maxValue) * chartHeight;
                break;
            }

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}

          {/* X-axis labels */}
          {chartData.map((item, index) => {
            if (index % Math.ceil(chartData.length / 6) === 0) {
              const x = padding + (index / (chartData.length - 1)) * (chartWidth - 2 * padding);
              return (
                <text
                  key={index}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {new Date((item as any).date).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Legend */}
        {type === 'userGrowth' && (
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Total Usuarios</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-0.5 bg-green-500 border-dashed border-t-2 mr-2"></div>
              <span className="text-sm text-gray-600">Nuevos Usuarios</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBarChart = () => {
    if (!chartData.length || type !== 'appointmentStats') return null;

    const appointmentData = data.appointmentStats;
    const maxValue = Math.max(...appointmentData.flatMap(item => [
      item.scheduled, 
      item.completed, 
      item.cancelled
    ]));

    const chartHeight = height - 80;
    const chartWidth = 600;
    const padding = 40;
    const barWidth = (chartWidth - 2 * padding) / appointmentData.length / 3 - 2;

    return (
      <div className="relative">
        <svg width={chartWidth} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1={padding}
                y1={padding + chartHeight * ratio}
                x2={chartWidth - padding}
                y2={padding + chartHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={padding + chartHeight * ratio + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {Math.round(maxValue * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* Bars */}
          {appointmentData.map((item, index) => {
            const baseX = padding + (index / appointmentData.length) * (chartWidth - 2 * padding);
            
            return (
              <g key={index}>
                {/* Scheduled */}
                <rect
                  x={baseX}
                  y={padding + chartHeight - (item.scheduled / maxValue) * chartHeight}
                  width={barWidth}
                  height={(item.scheduled / maxValue) * chartHeight}
                  fill="#3b82f6"
                />
                {/* Completed */}
                <rect
                  x={baseX + barWidth + 2}
                  y={padding + chartHeight - (item.completed / maxValue) * chartHeight}
                  width={barWidth}
                  height={(item.completed / maxValue) * chartHeight}
                  fill="#10b981"
                />
                {/* Cancelled */}
                <rect
                  x={baseX + 2 * (barWidth + 2)}
                  y={padding + chartHeight - (item.cancelled / maxValue) * chartHeight}
                  width={barWidth}
                  height={(item.cancelled / maxValue) * chartHeight}
                  fill="#ef4444"
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {appointmentData.map((item, index) => {
            if (index % Math.ceil(appointmentData.length / 6) === 0) {
              const x = padding + (index / appointmentData.length) * (chartWidth - 2 * padding) + barWidth * 1.5;
              return (
                <text
                  key={index}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {new Date(item.date).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">Programadas</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Completadas</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Canceladas</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSocialChart = () => {
    if (!chartData.length || type !== 'socialActivity') return null;

    const socialData = data.socialActivity;
    const maxValue = Math.max(...socialData.flatMap(item => [
      item.posts, 
      item.comments, 
      item.likes
    ]));

    const chartHeight = height - 80;
    const chartWidth = 600;
    const padding = 40;

    return (
      <div className="relative">
        <svg width={chartWidth} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1={padding}
                y1={padding + chartHeight * ratio}
                x2={chartWidth - padding}
                y2={padding + chartHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={padding + chartHeight * ratio + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {Math.round(maxValue * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* Lines */}
          <polyline
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            points={socialData.map((item, index) => {
              const x = padding + (index / (socialData.length - 1)) * (chartWidth - 2 * padding);
              const y = padding + chartHeight - (item.posts / maxValue) * chartHeight;
              return `${x},${y}`;
            }).join(' ')}
          />
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            points={socialData.map((item, index) => {
              const x = padding + (index / (socialData.length - 1)) * (chartWidth - 2 * padding);
              const y = padding + chartHeight - (item.comments / maxValue) * chartHeight;
              return `${x},${y}`;
            }).join(' ')}
          />
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            points={socialData.map((item, index) => {
              const x = padding + (index / (socialData.length - 1)) * (chartWidth - 2 * padding);
              const y = padding + chartHeight - (item.likes / maxValue) * chartHeight;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* X-axis labels */}
          {socialData.map((item, index) => {
            if (index % Math.ceil(socialData.length / 6) === 0) {
              const x = padding + (index / (socialData.length - 1)) * (chartWidth - 2 * padding);
              return (
                <text
                  key={index}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {new Date(item.date).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-purple-500 mr-2"></div>
            <span className="text-sm text-gray-600">Posts</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-cyan-500 mr-2"></div>
            <span className="text-sm text-gray-600">Comentarios</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-amber-500 mr-2"></div>
            <span className="text-sm text-gray-600">Likes</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <span className="text-4xl mb-2 block">📊</span>
            <p className="text-gray-500">No hay datos disponibles</p>
          </div>
        </div>
      ) : (
        <div>
          {type === 'appointmentStats' && renderBarChart()}
          {type === 'socialActivity' && renderSocialChart()}
          {(type === 'userGrowth' || type === 'petRegistrations' || type === 'revenue') && renderLineChart()}
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;