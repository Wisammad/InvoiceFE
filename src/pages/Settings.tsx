import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, RefreshCw, ArrowRight, Check, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getExtractorConfig, toggleExtractor, setExtractorMode, debugApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [extractorName, setExtractorName] = useState('');
  const [isToggling, setIsToggling] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    loadExtractorConfig();
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const data = await debugApi();
      setSystemInfo(data);
    } catch (error) {
      console.error('Failed to load system info', error);
      toast.error('Failed to load system information');
    }
  };

  const loadExtractorConfig = async () => {
    try {
      setIsLoading(true);
      const config = await getExtractorConfig();
      setIsEnhanced(config.is_enhanced);
      setExtractorName(config.current_extractor);
    } catch (error) {
      console.error('Failed to load extractor config', error);
      toast.error('Failed to load extractor configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExtractor = async () => {
    try {
      setIsToggling(true);
      const config = await toggleExtractor();
      setIsEnhanced(config.is_enhanced);
      setExtractorName(config.current_extractor);
      toast.success(`Extractor switched to ${config.current_extractor}`);
    } catch (error) {
      console.error('Failed to toggle extractor', error);
      toast.error('Failed to toggle extractor');
    } finally {
      setIsToggling(false);
    }
  };

  const handleSwitchChange = async (checked: boolean) => {
    try {
      setIsToggling(true);
      const config = await setExtractorMode(checked);
      setIsEnhanced(config.is_enhanced);
      setExtractorName(config.current_extractor);
      toast.success(`Extractor set to ${config.current_extractor}`);
    } catch (error) {
      console.error('Failed to set extractor mode', error);
      toast.error('Failed to set extractor mode');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure application settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Extractor Configuration
              {!isLoading && (
                <Badge variant={isEnhanced ? "success" : "secondary"} className="ml-2">
                  {isEnhanced ? "Enhanced" : "Standard"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Choose between standard and enhanced data extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-5 w-[150px]" />
              </div>
            ) : (
              <>
                <Alert variant="outline" className="bg-muted/50">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Current Extractor</AlertTitle>
                  <AlertDescription>
                    {extractorName}
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Enhanced Extraction</div>
                    <div className="text-sm text-muted-foreground">
                      Use enhanced algorithms for better field extraction
                    </div>
                  </div>
                  <Switch
                    checked={isEnhanced}
                    onCheckedChange={handleSwitchChange}
                    disabled={isToggling}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {isEnhanced 
                ? "Enhanced extraction provides more detailed field detection" 
                : "Standard extraction uses basic field detection algorithms"}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleExtractor}
              disabled={isToggling || isLoading}
            >
              {isToggling ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Toggle Extractor
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              View system and application details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!systemInfo ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-5 w-[150px]" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Environment</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Python Version:</div>
                    <div className="font-mono">{systemInfo.environment.python_version.split(' ')[0]}</div>
                    <div className="text-muted-foreground">Working Directory:</div>
                    <div className="font-mono truncate">{systemInfo.environment.working_directory}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Files</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Uploaded Files:</div>
                    <div>{systemInfo.upload_files.count}</div>
                    <div className="text-muted-foreground">Processed Files:</div>
                    <div>{systemInfo.processed_files.count}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Extractor</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Current Extractor:</div>
                    <div>{systemInfo.current_extractor}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={loadSystemInfo}
              disabled={!systemInfo}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${!systemInfo ? 'animate-spin' : ''}`} />
              Refresh Info
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 