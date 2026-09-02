import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface BarChartProps {
  categories: string[];
  seriesData: number[];
}

export default function BarChartOne({ categories, seriesData }: BarChartProps) {
  const options: ApexOptions = {
    colors: ["#059669"], // Primary emerald tone
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "38%",
        borderRadius: 8,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#9CA3AF",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: { 
          colors: "#9CA3AF", 
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: "rgba(156, 163, 175, 0.15)",
      strokeDashArray: 6,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: ["#34D399"], // Modern mint gradient glow at the top
        inverseColors: false,
        opacityFrom: 0.95,
        opacityTo: 0.7,
        stops: [0, 85, 100],
      },
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val} tasks/items`,
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Outfit, sans-serif',
      },
    },
  };

  const series = [
    {
      name: "Workflow Volume",
      data: seriesData,
    },
  ];

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" className="min-w-[650px] transition-all">
        <Chart options={options} series={series} type="bar" height={300} />
      </div>
    </div>
  );
}