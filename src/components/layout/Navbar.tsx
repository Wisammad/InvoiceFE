import React, { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/use-theme';
import { getExtractorConfig, ExtractorConfig } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [extractor, setExtractor] = useState<ExtractorConfig | null>(null);

  useEffect(() => {
    const fetchExtractorConfig = async () => {
      try {
        const config = await getExtractorConfig();
        setExtractor(config);
      } catch (error) {
        console.error('Failed to load extractor config', error);
      }
    };
    
    fetchExtractorConfig();
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-14 items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="w-full pl-8 bg-background/50 border-input"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {extractor && (
            <Link to="/settings">
              <Badge variant={extractor.is_enhanced ? "outline" : "secondary"} className="cursor-pointer">
                <Zap className="h-3 w-3 mr-1" />
                {extractor.current_extractor}
              </Badge>
            </Link>
          )}
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
