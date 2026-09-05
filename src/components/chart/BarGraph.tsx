import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface BarChartProps {
  categories: string[];
  seriesData: number[];
}

function wrapCategoryLabel(label: string, maxLineLength = 16): string[] {
  const words = label.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxLineLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

export default function BarChartOne({ categories, seriesData }: BarChartProps) {
  const mobileHeight = Math.max(280, categories.length * 45);
  const wrappedCategories = categories.map((label) => wrapCategoryLabel(label));

  // Dynamic color detection o tamang contrast color para sa dark/light mode labels
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const labelColor = isDarkMode ? "#94A3B8" : "#64748B"; // Mas matingkad na Gray para hindi mawala sa dark background

  const options: ApexOptions = {
    colors: ["#059669"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 320,
      width: "100%",
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
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
      categories: wrappedCategories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: 0,
        trim: true,
        style: {
          colors: labelColor, // Ginagamit ang adjusted label color para lumitaw sa dark/light mode
          fontSize: "12px",
          fontWeight: 600,
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
          colors: labelColor,
          fontSize: "12px",
          fontWeight: 600,
        },
      },
    },
    grid: {
      borderColor: "rgba(156, 163, 175, 0.15)",
      strokeDashArray: 6,
      padding: {
        bottom: 10,
      },
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
        gradientToColors: ["#34D399"],
        inverseColors: false,
        opacityFrom: 0.95,
        opacityTo: 0.7,
        stops: [0, 85, 100],
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val} tasks/items`,
      },
      style: {
        fontSize: "12px",
        fontFamily: "Outfit, sans-serif",
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: mobileHeight,
          },
          plotOptions: {
            bar: {
              horizontal: true,
              barHeight: "60%",
              borderRadius: 6,
              borderRadiusApplication: "end",
            },
          },
          grid: {
            padding: {
              bottom: 0,
            },
            yaxis: {
              lines: {
                show: false,
              },
            },
            xaxis: {
              lines: {
                show: true,
              },
            },
          },
          xaxis: {
            labels: {
              style: {
                fontSize: "11px",
                colors: labelColor,
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                fontSize: "11px",
                colors: labelColor,
              },
            },
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Workflow Volume",
      data: seriesData,
    },
  ];

  return (
    <div id="chartOne" className="w-full transition-all">
      <Chart options={options} series={series} type="bar" width="100%" height={320} />
    </div>
  );
}