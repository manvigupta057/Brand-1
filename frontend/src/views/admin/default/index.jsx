import { useState, useEffect } from "react";
import axios from "axios";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard } from "react-icons/md";

import Widget from "components/widget/Widget";

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
    <div className="pb-8">
      {/* Metrics Section */}
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

      <div className="mt-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
           <p className="text-gray-400 font-medium italic">Welcome to the Brand Analyst Admin Panel. Use the sidebar to manage your database.</p>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
