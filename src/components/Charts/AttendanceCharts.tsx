import { Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useApiCallback } from '../../core/hooks/useApi';
import moment from 'moment';

const options: ApexOptions = {
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    height: 335,
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },

    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: 'straight',
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: '#fff',
    strokeColors: ['#3056D3', '#80CAEE'],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: 'category',
    categories: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
    min: 0,
    max: 100,
  },
};

interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
}

export const AttendanceCharts: React.FC = () => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [currentDate, setCurrentDate] = useState<string>('');
  const mappedData = [0, 0, 0, 0, 0, 0, 0];
  const apiTicketChartReport = useApiCallback(api => api.internal.ticketChartReport())
  const [state, setState] = useState<ChartOneState>({
    series: [
      {
        name: 'Tickets',
        data: [0, 0, 0, 0, 0, 0, 0],
      }
    ],
  });
  const [modifiedOptions, setModifiedOptions] = useState(options)
  let dayOfWeekIndex = 0;
  async function initializedChartReport(){
    try {
      const res = await apiTicketChartReport.execute();
      console.log("API Data:", res.data);
      if (res.data && res.data.length > 0) {
        const mappedData = [0, 0, 0, 0, 0, 0, 0];
  
        res.data.forEach((countByday: any) => {
          const dayOfWeekIndex = countByday.day;
          mappedData[dayOfWeekIndex] = countByday.count;
        });
  
        console.log("Mapped Data:", mappedData);
  
        setState((prevState) => ({
          ...prevState,
          series: [
            {
              ...prevState.series[0],
              data: mappedData,
            },
          ],
        }));
        const newCategories = daysOfWeek.slice(dayOfWeekIndex).concat(daysOfWeek.slice(0, dayOfWeekIndex));
        setModifiedOptions((prevOptions) => ({
          ...prevOptions,
          xaxis: {
            ...prevOptions.xaxis,
            categories: newCategories,
          },
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    initializedChartReport()
  }, [])
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString(); // Adjust the format as needed
    setCurrentDate(formattedDate);
  }, []);
  return (
    <div className="col-span-12 chart-moderator-guide rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <Typography variant='button' gutterBottom>
            Ticketing Reports
          </Typography>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
          <Typography variant='button' gutterBottom>
            {moment(currentDate).format("MMM Do YYYY dddd")}
          </Typography>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={state.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};