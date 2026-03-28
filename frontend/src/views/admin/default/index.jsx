import { useState, useEffect } from "react";
import axios from "axios";
import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard } from "react-icons/md";

import { columnsDataCheck, columnsDataComplex } from "./variables/columnsData";

import Widget from "components/widget/Widget";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import TaskCard from "views/admin/default/components/TaskCard";
import tableDataCheck from "./variables/tableDataCheck.json";
import tableDataComplex from "./variables/tableDataComplex.json";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_brands: "---",
    avg_seo: "---",
    avg_sentiment: "---",
    avg_market_share: "---"
  });

  useEffect(() => {
    // Check if backend is reachable
    axios.get("http://localhost:8000/api/stats")
      .then(res => {
        setStats({
          total_brands: res.data.total_brands.toLocaleString(),
          avg_seo: res.data.avg_seo,
          avg_sentiment: res.data.avg_sentiment,
          avg_market_share: res.data.avg_market_share + "%"
        });
      })
      .catch(err => {
        console.error("API Error:", err);
        setStats({
          total_brands: "Error",
          avg_seo: "Error",
          avg_sentiment: "Error",
          avg_market_share: "Error"
        });
      });
  }, []);

  return (
    <div>
      {/* Card widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Total Brands"}
          subtitle={stats.total_brands}
        />
        <Widget
          icon={<IoDocuments className="h-6 w-6" />}
          title={"Avg SEO Score"}
          subtitle={stats.avg_seo}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Avg Sentiment Score"}
          subtitle={stats.avg_sentiment}
        />
        <Widget
          icon={<MdDashboard className="h-6 w-6" />}
          title={"Avg Market Share"}
          subtitle={stats.avg_market_share}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"New Tasks"}
          subtitle={"145"}
        />
        <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Total Projects"}
          subtitle={"$2433"}
        />
      </div>


      {/* Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TotalSpent />
        <WeeklyRevenue />
      </div>

      {/* Tables & Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Check Table */}
        <div>
          <CheckTable
            columnsData={columnsDataCheck}
            tableData={tableDataCheck}
          />
        </div>

        {/* Traffic chart & Pie Chart */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <DailyTraffic />
          <PieChartCard />
        </div>

        {/* Complex Table , Task & Calendar */}

        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />

        {/* Task chart & Calendar */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <TaskCard />
          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
