
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, FileUp, Menu, Search, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-sidebar h-screen flex flex-col border-r border-border/80 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border/80">
        {!collapsed && (
          <h1 className="text-xl font-bold flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            <span className="text-primary">
              Invoice Vision
            </span>
          </h1>
        )}
        {collapsed && (
          <Zap className="h-5 w-5 mx-auto text-primary" />
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-2 px-2">
          <NavItem 
            to="/"
            icon={<BarChart3 size={20} />}
            label="Dashboard"
            collapsed={collapsed}
          />
          <NavItem 
            to="/upload"
            icon={<FileUp size={20} />}
            label="Upload"
            collapsed={collapsed}
          />
          <NavItem 
            to="/search"
            icon={<Search size={20} />}
            label="Search"
            collapsed={collapsed}
          />
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border/80">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>Invoice Vision</p>
            <p className="text-primary">v1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, collapsed }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center px-3 py-2 transition-colors",
            collapsed ? "justify-center" : "space-x-3",
            isActive
              ? "bg-primary/10 text-primary border-l-2 border-primary"
              : "hover:bg-secondary/80 text-foreground"
          )
        }
      >
        {icon}
        {!collapsed && <span>{label}</span>}
      </NavLink>
    </li>
  );
};
