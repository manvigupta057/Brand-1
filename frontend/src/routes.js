import React from "react";
import AISettings from "views/admin/aiSettings";
// Admin Imports
import MainDashboard from "views/admin/default";
import Profile from "views/admin/profile";
import DataTables from "views/admin/tables";

// Icon Imports
import {
  MdHome,
  MdBarChart,
  MdPerson,
  MdLayers,
} from "react-icons/md";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
  name: "AI Settings",
  layout: "/admin",
  path: "ai-settings",
  component: <AISettings />,
  },
  {
    name: "Brands Table",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "data-tables",
    component: <DataTables />,
  },
  {
    name: "Profile",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },
];
export default routes;
