import { useState, useEffect } from 'react';
import { get, put } from '@/lib/apiUtils';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import ProductSelector from '@/components/ProductSelector';
import { formatCurrency } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
}

interface GiftPopupConfig {
  _id?: string;
  title: string;
  subTitle: string;
  active: boolean;
  minCartValue: number;
  maxCartValue: number | null;
  maxSelectableGifts: number;
  giftProducts: string[];
}

export default function GiftPopupPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<GiftPopupConfig>({
    title: 'Claim Your Complimentary Gift',
    subTitle: 'Choose Any 2',
    active: false,
    minCartValue: 1000,
    maxCartValue: null,
    maxSelectableGifts: 2,
    giftProducts: []
  });

  // Load configuration and products
  useEffect(() => {
    loadConfig();
    loadProducts();
  }, []);

  // Update selected products when config.giftProducts changes
  useEffect(() => {
    const updateSelectedProducts = async () => {
      if (config.giftProducts.length > 0 && products.length > 0) {
        const selected = products.filter(product => 
          config.giftProducts.includes(product._id)
        );
        setSelectedProducts(selected);
      } else {
        setSelectedProducts([]);
      }
    };

    updateSelectedProducts();
  }, [config.giftProducts, products]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      console.log('Fetching gift popup configuration...');
      // Using development endpoint to bypass admin authentication during development
      const response = await get<GiftPopupConfig>('/api/dev/gift-popup');
      console.log('Gift popup config loaded:', response);
      // Ensure we have a valid GiftPopupConfig object
      if (response && typeof response === 'object') {
        setConfig(response as GiftPopupConfig);
      } else {
        console.error('Invalid gift popup config format:', response);
        throw new Error('Invalid gift popup configuration format');
      }
    } catch (error) {
      console.error('Error loading gift popup config:', error);
      toast({
        title: 'Failed to load gift popup configuration',
        description: 'Please check server logs for details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('Fetching available products...');
      // Using development endpoint to bypass admin authentication during development
      const response = await get<Product[]>('/api/dev/gift-products');
      console.log(`Loaded ${response.length} products`);
      // Ensure we have a valid array of products
      if (Array.isArray(response)) {
        setProducts(response as Product[]);
      } else {
        console.error('Invalid products format:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Failed to load products',
        description: 'Please check server logs for details',
        variant: 'destructive'
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate minimum selectable gifts
      if (config.maxSelectableGifts > selectedProducts.length && selectedProducts.length > 0) {
        toast({
          title: 'Error',
          description: `Maximum selectable gifts (${config.maxSelectableGifts}) cannot exceed the number of available gift products (${selectedProducts.length})`,
          variant: 'destructive'
        });
        setSaving(false);
        return;
      }
      
      // Update gift products array with selected product IDs
      const updatedConfig = {
        ...config,
        giftProducts: selectedProducts.map(p => p._id)
      };
      
      // Using development endpoint to bypass admin authentication during development
      const response = await put<GiftPopupConfig>('/api/dev/gift-popup', updatedConfig);
      
      // Ensure we have a valid response before updating state
      if (response && typeof response === 'object') {
        setConfig(response as GiftPopupConfig);
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }
      
      toast({
        title: 'Gift popup configuration saved successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving gift popup config:', error);
      toast({
        title: 'Failed to save gift popup configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    if (selectedProducts.some(p => p._id === product._id)) {
      // Remove if already selected
      setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
    } else {
      // Add if not selected
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleMaxSelectableChange = (value: string) => {
    const num = parseInt(value, 10);
    
    if (isNaN(num) || num < 1) {
      setConfig({ ...config, maxSelectableGifts: 1 });
    } else {
      setConfig({ ...config, maxSelectableGifts: num });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gift Popup Management</h2>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Save Configuration
        </Button>
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-12">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Popup Settings</CardTitle>
              <CardDescription>Configure how your gift popup appears to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Popup Title</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                />
              </div>
              
              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subTitle">Popup Subtitle</Label>
                <Input
                  id="subTitle"
                  value={config.subTitle}
                  onChange={(e) => setConfig({ ...config, subTitle: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">Example: "Choose Any 2"</p>
              </div>
              
              {/* Min Cart Value */}
              <div className="space-y-2">
                <Label htmlFor="minCartValue">Minimum Cart Value (₹)</Label>
                <Input
                  id="minCartValue"
                  type="number"
                  value={config.minCartValue}
                  onChange={(e) => setConfig({ ...config, minCartValue: parseFloat(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">Popup will appear when cart value is at least this amount</p>
              </div>
              
              {/* Max Cart Value */}
              <div className="space-y-2">
                <Label htmlFor="maxCartValue">Maximum Cart Value (₹) <span className="text-sm text-muted-foreground">(Optional)</span></Label>
                <Input
                  id="maxCartValue"
                  type="number"
                  value={config.maxCartValue === null ? '' : config.maxCartValue}
                  onChange={(e) => {
                    const value = e.target.value.trim() === '' ? null : parseFloat(e.target.value);
                    setConfig({ ...config, maxCartValue: value });
                  }}
                  placeholder="No upper limit"
                />
                <p className="text-sm text-muted-foreground">Popup will not appear if cart value exceeds this amount</p>
              </div>
              
              {/* Max Selectable Gifts */}
              <div className="space-y-2">
                <Label htmlFor="maxSelectableGifts">Maximum Selectable Gifts</Label>
                <Input
                  id="maxSelectableGifts"
                  type="number"
                  min="1"
                  value={config.maxSelectableGifts}
                  onChange={(e) => handleMaxSelectableChange(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Number of gifts customer can select</p>
              </div>
              
              {/* Active Status */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label htmlFor="active" className="text-base">Popup Active</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable gift popup</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={config.active}
                    onCheckedChange={(checked) => setConfig({ ...config, active: checked })}
                  />
                  <span className={config.active ? 'text-green-600' : 'text-red-600'}>
                    {config.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gift Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Gift Products</CardTitle>
              <CardDescription>Select products to offer as gifts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <ProductSelector
                  products={products}
                  selectedProducts={selectedProducts}
                  onProductSelect={handleProductSelect}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Selected Gift Products ({selectedProducts.length})</Label>
                <div className="border rounded-md p-3 min-h-[100px] max-h-[300px] overflow-y-auto">
                  {selectedProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No gift products selected</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedProducts.map(product => (
                        <div key={product._id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProductSelect(product)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <h4 className="font-semibold">Preview Settings</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Appears when cart value is: {formatCurrency(config.minCartValue)} 
                    {config.maxCartValue !== null ? ` - ${formatCurrency(config.maxCartValue)}` : ' or more'}
                  </p>
                  <p>Customer can select: <Badge variant="outline">{config.maxSelectableGifts} gift{config.maxSelectableGifts !== 1 ? 's' : ''}</Badge></p>
                  <p>Popup status: <Badge variant={config.active ? "default" : "secondary"}>{config.active ? 'Active' : 'Inactive'}</Badge></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
