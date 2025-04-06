
import React from 'react';
import { Bell, HelpCircle, Search, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-border/80 flex items-center justify-between px-4 bg-popover">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="w-full pl-8 rounded-none bg-background/90 border-border/80 focus:border-primary/80 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary/80">
          <Bell size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary/80">
          <HelpCircle size={20} />
        </Button>
        <div className="h-8 w-8 flex items-center justify-center text-primary-foreground animate-glow border border-primary/80">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};
