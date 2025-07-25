import { useEffect, useRef, useState } from 'react';
import styles from './SimpleChart.module.css';

export default function SimpleChart({ data, type = 'line', height = 300 }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle canvas resizing
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        const width = parent.clientWidth;
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current || !data.length || !dimensions.width) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    // Set canvas size for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Chart margins
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (type === 'line') {
      drawLineChart(ctx, data, margin, chartWidth, chartHeight);
    } else if (type === 'bar') {
      drawBarChart(ctx, data, margin, chartWidth, chartHeight);
    } else if (type === 'horizontal-bar') {
      drawHorizontalBarChart(ctx, data, margin, chartWidth, chartHeight);
    }
  }, [data, type, dimensions]);

  const drawLineChart = (ctx, data, margin, chartWidth, chartHeight) => {
    if (!data.length) return;

    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw line
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = margin.left + (chartWidth / (data.length - 1)) * index;
      const y = margin.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#2563eb';
    data.forEach((point, index) => {
      const x = margin.left + (chartWidth / (data.length - 1)) * index;
      const y = margin.top + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // Y-axis labels (values)
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i);
      const y = margin.top + (chartHeight / 5) * i;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toLocaleString(), margin.left - 10, y + 4);
    }
  };

  const drawBarChart = (ctx, data, margin, chartWidth, chartHeight) => {
    if (!data.length) return;

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    // Draw bars
    ctx.fillStyle = '#10b981';
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = margin.top + chartHeight - barHeight;

      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    data.forEach((item, index) => {
      const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2;
      const y = margin.top + chartHeight + 20;
      ctx.fillText(item.day || item.label, x, y);
    });
  };

  const drawHorizontalBarChart = (ctx, data, margin, chartWidth, chartHeight) => {
    if (!data.length) return;

    const values = data.map(d => d.bookings || d.value);
    const maxValue = Math.max(...values);
    const barHeight = chartHeight / data.length * 0.8;
    const barSpacing = chartHeight / data.length * 0.2;

    // Draw bars
    data.forEach((item, index) => {
      const barWidth = (item.bookings / maxValue) * chartWidth;
      const x = margin.left;
      const y = margin.top + index * (barHeight + barSpacing) + barSpacing / 2;

      // Gradient fill
      const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#a78bfa');
      ctx.fillStyle = gradient;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    
    data.forEach((item, index) => {
      const y = margin.top + index * (barHeight + barSpacing) + barSpacing / 2 + barHeight / 2 + 4;
      ctx.fillText(item.name, margin.left - 10, y);
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyChart} style={{ height }}>
        <div className={styles.emptyIcon}>📊</div>
        <p className={styles.emptyText}>אין נתונים להצגה</p>
      </div>
    );
  }

  return (
    <div className={styles.chartWrapper} style={{ height }}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
      />
    </div>
  );
}