import * as React from "react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { productSchema } from "../../../../shared/schema";
import { X, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CodeEditor } from "../ui/code-editor";
import { nanoid } from "nanoid";
import { Label } from "../ui/label";
import { MongoProduct, MongoCategory } from "../../types/mongo";

type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductFormProps {
  product?: MongoProduct;
  onSuccess?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);
  
  // Setup custom HTML sections field array
  const [customSectionTemplates, setCustomSectionTemplates] = useState<{id: string, title: string, content: string, displayOrder?: number, enabled: boolean}[]>(
    product?.customHtmlSections || [
    {
      id: 'clinically-tested',
      title: 'Clinically Tested To',
      content: `<div>
  <h3 class="text-xl font-medium mb-4">Clinically Tested To</h3>
  <ul class="list-disc pl-5 space-y-2">
    <li>Clinically Tested To Protect From UVA & UVB rays</li>
    <li>Based on clinical trials conducted over 30 days!</li>
  </ul>
  
  <h3 class="text-xl font-medium mt-8 mb-4">Natural Sunscreen Top Ingredients</h3>
  <p class="mb-4">A light organic sunscreen containing natural origin UV protection minerals such as <strong>Titanium Dioxide</strong> and <strong>Zinc Dioxide</strong> which protect the sun rays back from exposed skin. <strong>Natural Glycerine</strong> and <strong>Olive Oil</strong> condition skin without making it greasy. Nourishing <strong>Shea Butter</strong> protects, hydrates, repairs blemishes and other signs of sun damage. <strong>Pure essential oils</strong> - <strong>Nutmeg, Ginger and Lime</strong> have the anti-aging and fruity aromas.</p>
  
  <div class="border border-gray-200 p-4 my-6 bg-gray-50">
    <blockquote class="italic text-center">
      Did you know that Natural Sun Protection contains the natural mineral Zinc Oxide known as Yasad Bhsma, which protects from both UVA & UVB rays?
    </blockquote>
  </div>
</div>`,
      displayOrder: 0,
      enabled: false
    },
    {
      id: 'ingredients-list',
      title: 'Ingredients List',
      content: `<div>
  <h3 class="text-xl font-medium mb-4">Ingredients List</h3>
  <p class="mb-4">Purified Water, Elaeis Guineensis (Olive) Oil, Glycerin, Zinc Oxide & Titanium Dioxide (Natural Sun protection minerals), Cera Alba (Beeswax), Butyrospermum Parkii (Shea) Butter, Theobroma Cacao (Cocoa) Seed Butter, Xanthan Gum, Syzygium Aromaticum (Clove) Bud Oil, Citrus Aurantium Bergamia (Bergamot) Fruit Oil, Cetyl Alcohol.</p>
</div>`,
      displayOrder: 1,
      enabled: false
    }
  ]);

  // Get categories for the form
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/categories");
      return response.json();
    }
  });
  
  // Ensure categories is always an array
  const categories: MongoCategory[] = Array.isArray(categoriesData) ? categoriesData : [];
  
  // Initialize form with default values or product data if editing
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription || "",
          price: product.price,
          discountedPrice: product.discountedPrice || null,
          stock: product.stock,
          categoryId: product.categoryId || "",
          slug: product.slug,
          featured: product.featured || false,
          bestseller: product.bestseller || false,
          isNew: product.isNew || false,
          videoUrl: product.videoUrl || "",
          imageUrl: product.imageUrl || "",
          images: product.images || [],
          faqs: product.faqs || [],
          structuredIngredients: product.structuredIngredients || [],
          howToUse: product.howToUse || "",
          howToUseVideo: product.howToUseVideo || ""
  });
  
  // Setup field arrays for managing FAQs, ingredients, and how-to-use steps
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faqs",
  });
  
  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "structuredIngredients",
  });
  
  const { fields: howToUseStepFields, append: appendHowToUseStep, remove: removeHowToUseStep } = useFieldArray({
    control: form.control,
    name: "howToUseSteps",
  });

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control: form.control,
    name: "structuredBenefits",
  });

  const { fields: customSectionFields, append: appendCustomSection, remove: removeCustomSection } = useFieldArray({
    control: form.control,
    name: "customSections",
    keyName: "key" // Use key as keyName to avoid conflicts with id
  });
  
  // Add backward compatibility for customSections
  useEffect(() => {
    try {
      // Check if customSections exists in the form values
      if (form && !form.getValues().customSections) {
        // Initialize with empty array if it doesn't exist
        form.setValue("customSections", []);
      }
    } catch (error) {
      console.error("Error initializing customSections:", error);
      // Fallback - ensure customSections is defined
      form.setValue("customSections", []);
    }
  }, [form]);

  // Form submission handler
  const onSubmit = async (values: ProductFormValues): Promise<void> => {
    try {
      setIsSubmitting(true);

      // Extract values from the form
      const { faqs, structuredIngredients, howToUseSteps, structuredBenefits, ...productData } = values;
      
      // Create FormData instance
      const formData = new FormData();
      
      // Add custom HTML sections to the product data
      const productWithCustomSections = {
        ...productData,
        customHtmlSections: customSectionTemplates,
        faqs: faqs || [],
        structuredIngredients: structuredIngredients || [],
        howToUseSteps: howToUseSteps || [],
        structuredBenefits: structuredBenefits || []
      };
      
      // Convert the product data with custom HTML sections to JSON and append it
      formData.append('product', JSON.stringify(productWithCustomSections));
      
      // Append each image file
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Send request (POST or PUT)
      const method = product ? 'PUT' : 'POST';
      const url = product ? `/api/products/${product._id}` : '/api/products';
      const response = await apiRequest(method, url, { body: formData, includeAuth: true, skipContentType: true });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to save product');
      }

      // Process successful response
      await response.json();

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: product ? "Product Updated" : "Product Created",
        description: `The product has been successfully ${product ? "updated" : "created"}.`,
      });
      
      // Clear form
      form.reset();
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      
      // Call onSuccess prop if provided
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a handle submit function that uses the form's handleSubmit and calls onSubmit
  const handleSubmitWithImages = form.handleSubmit(onSubmit);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  // Remove selected image before upload
  const handleRemoveSelectedImage = (idx: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles.splice(idx, 1);
    newPreviews.splice(idx, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Remove existing image (for edit)
  const handleRemoveExistingImage = (idx: number) => {
    const newExisting = [...existingImages];
    newExisting.splice(idx, 1);
    setExistingImages(newExisting);
  };

  // Generate slug from name
  const generateSlug = () => {
    const name = form.getValues("name");
    if (name) {
      const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue("slug", slug);
    }
  };

  if (isCategoriesLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithImages} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SKU field */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Name field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name*</FormLabel>
                <FormControl>
                  <Input {...field} onBlur={() => {
                    if (!product && !form.getValues("slug")) {
                      generateSlug();
                    }
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Slug field */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug*</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateSlug}
                    className="flex-shrink-0"
                  >
                    Generate
                  </Button>
                </div>
                <FormDescription>URL-friendly version of the name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Price field */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value === undefined || field.value === null ? '' : field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Discounted Price field */}
          <FormField
            control={form.control}
            name="discountedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discounted Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={field.value === null ? "" : field.value} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : parseFloat(value));
                    }} 
                  />
                </FormControl>
                <FormDescription>Leave empty for no discount</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Stock field */}
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value === undefined || field.value === null ? '' : field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Category field */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={categories.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="none" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map((category) => {
                        const categoryId = category.id || category._id;
                        return (
                          <SelectItem 
                            key={categoryId?.toString() || `cat-${category.name}`} 
                            value={categoryId?.toString() || `cat-${category.name}`}
                          >
                            {category.name}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Images input and preview */}
          <div className="col-span-full mb-4">
            <FormLabel>Product Images</FormLabel>
            <Input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            {/* Preview existing images */}
            <div className="flex flex-wrap gap-2 mt-2">
              {existingImages.map((url, idx) => {
                // Always ensure the URL is /uploads/filename or /admin/uploads/filename
                let normalizedUrl = url;
                if (!url.startsWith('/uploads/')) {
                  normalizedUrl = `/uploads/${url.replace(/^\/+/, '')}`;
                }
                return (
                  <div key={`existing-${idx}`} className="relative">
                    <img
                      src={normalizedUrl}
                      alt={`existing-${idx}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }}
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                      }}
                    />
                    <button type="button" onClick={() => handleRemoveExistingImage(idx)} className="absolute -top-2 -right-2 bg-white rounded-full border shadow p-0.5">
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
              {/* Preview newly selected images */}
              {imagePreviews.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} alt={`preview-${idx}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '2px solid #aaa' }} />
                  <button type="button" onClick={() => handleRemoveSelectedImage(idx)} className="absolute -top-2 -right-2 bg-white rounded-full border shadow p-0.5">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <FormDescription>Upload up to 5 images. The first image will be used as the main image.</FormDescription>
          </div>
          
          {/* Video URL field */}
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Product Video URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://youtube.com/... or direct video link" {...field} />
                </FormControl>
                <FormDescription>Paste a YouTube link or direct video URL. If provided, a video icon will show on the product grid.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Short Description field */}
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description for product listings" 
                    className="resize-none" 
                    rows={2}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Main Description field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Full Description*</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed product description" 
                    className="resize-none" 
                    rows={5}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Featured checkbox */}
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Product</FormLabel>
                  <FormDescription>
                    Featured products appear on the homepage.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {/* Bestseller checkbox */}
          <FormField
            control={form.control}
            name="bestseller"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Bestseller</FormLabel>
                  <FormDescription>
                    Mark as a bestselling product to highlight popularity.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {/* New Product checkbox */}
          <FormField
            control={form.control}
            name="isNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>New Product</FormLabel>
                  <FormDescription>
                    Highlight as a newly added product.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          {/* Product FAQs Section */}
          <div className="col-span-full mt-6">
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg font-medium">Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Add common questions and answers about this product that will be displayed on the product page.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {faqFields.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-muted-foreground mb-2">No FAQs added yet</p>
                    <p className="text-sm text-muted-foreground">Add some frequently asked questions to help customers learn more about this product.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {faqFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md relative">
                        <button 
                          type="button" 
                          className="absolute top-2 right-2 text-destructive hover:text-destructive/90"
                          onClick={() => removeFaq(index)}
                          aria-label="Remove FAQ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label htmlFor={`faqs.${index}.question`} className="text-sm font-medium">
                              Question
                            </label>
                            <input
                              {...form.register(`faqs.${index}.question`)}
                              id={`faqs.${index}.question`}
                              placeholder="Enter customer question"
                              className="w-full p-2 border rounded-md text-sm"
                            />
                            {form.formState.errors?.faqs?.[index]?.question && (
                              <p className="text-destructive text-xs mt-1">
                                {form.formState.errors.faqs[index]?.question?.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <label htmlFor={`faqs.${index}.answer`} className="text-sm font-medium">
                              Answer
                            </label>
                            <textarea
                              {...form.register(`faqs.${index}.answer`)}
                              id={`faqs.${index}.answer`}
                              placeholder="Enter your answer to the question"
                              rows={3}
                              className="w-full p-2 border rounded-md text-sm resize-none"
                            />
                            {form.formState.errors?.faqs?.[index]?.answer && (
                              <p className="text-destructive text-xs mt-1">
                                {form.formState.errors.faqs[index]?.answer?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => appendFaq({ question: '', answer: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Ingredients Section */}
          <div className="col-span-full mt-6">
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg font-medium">Product Ingredients</CardTitle>
                <CardDescription>
                  Add the key ingredients and their details to display on the product page.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Ingredients List</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          {...field} 
                          placeholder="List all ingredients separated by commas"
                        />
                      </FormControl>
                      <FormDescription>
                        Add a general list of ingredients that will be shown on the product page
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {ingredientFields.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md mt-6">
                    <p className="text-muted-foreground mb-2">No structured ingredients added yet</p>
                    <p className="text-sm text-muted-foreground">Add featured ingredients with detailed information to highlight on the product page.</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-6">
                    <h3 className="text-base font-medium mb-2">Featured Ingredients</h3>
                    {ingredientFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md relative">
                        <button 
                          type="button" 
                          className="absolute top-2 right-2 text-destructive hover:text-destructive/90"
                          onClick={() => removeIngredient(index)}
                          aria-label="Remove Ingredient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label htmlFor={`structuredIngredients.${index}.name`} className="text-sm font-medium">
                              Ingredient Name
                            </label>
                            <input
                              {...form.register(`structuredIngredients.${index}.name`)}
                              id={`structuredIngredients.${index}.name`}
                              placeholder="Enter ingredient name"
                              className="w-full p-2 border rounded-md text-sm"
                            />
                            {form.formState.errors?.structuredIngredients?.[index]?.name && (
                              <p className="text-destructive text-xs mt-1">
                                {form.formState.errors.structuredIngredients[index]?.name?.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <label htmlFor={`structuredIngredients.${index}.imageUrl`} className="text-sm font-medium">
                              Image URL
                            </label>
                            <input
                              {...form.register(`structuredIngredients.${index}.imageUrl`)}
                              id={`structuredIngredients.${index}.imageUrl`}
                              placeholder="URL to ingredient image"
                              className="w-full p-2 border rounded-md text-sm"
                            />
                            {form.formState.errors?.structuredIngredients?.[index]?.imageUrl && (
                              <p className="text-destructive text-xs mt-1">
                                {form.formState.errors.structuredIngredients[index]?.imageUrl?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-1 mt-3">
                          <label htmlFor={`structuredIngredients.${index}.description`} className="text-sm font-medium">
                            Description
                          </label>
                          <textarea
                            {...form.register(`structuredIngredients.${index}.description`)}
                            id={`structuredIngredients.${index}.description`}
                            placeholder="Describe what this ingredient is and its origin"
                            rows={2}
                            className="w-full p-2 border rounded-md text-sm resize-none"
                          />
                          {form.formState.errors?.structuredIngredients?.[index]?.description && (
                            <p className="text-destructive text-xs mt-1">
                              {form.formState.errors.structuredIngredients[index]?.description?.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-1 mt-3">
                          <label htmlFor={`structuredIngredients.${index}.benefits`} className="text-sm font-medium">
                            Benefits
                          </label>
                          <textarea
                            {...form.register(`structuredIngredients.${index}.benefits`)}
                            id={`structuredIngredients.${index}.benefits`}
                            placeholder="List the benefits of this ingredient"
                            rows={2}
                            className="w-full p-2 border rounded-md text-sm resize-none"
                          />
                          {form.formState.errors?.structuredIngredients?.[index]?.benefits && (
                            <p className="text-destructive text-xs mt-1">
                              {form.formState.errors.structuredIngredients[index]?.benefits?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => appendIngredient({ name: '', description: '', benefits: '', imageUrl: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </CardContent>
            </Card>
            
            {/* Custom HTML Sections */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Custom HTML Sections</CardTitle>
                <CardDescription>
                  Create rich HTML sections like "Clinically Tested To" or "Ingredients List"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customSectionFields && Array.isArray(customSectionFields) && customSectionFields.map((section, index) => (
                    <div key={section.id} className="border rounded-lg p-4 relative">
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomSection(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`customSections.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., Clinically Tested To" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`customSections.${index}.displayOrder`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Order</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>Determines the order of sections (lower numbers appear first)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`customSections.${index}.enabled`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Enable this section
                                </FormLabel>
                                <FormDescription>
                                  When disabled, this section will not be shown on the product page.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`customSections.${index}.htmlContent`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HTML Content</FormLabel>
                            <FormControl>
                              <CodeEditor
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  <div className="pt-2">
                    <div className="flex flex-col space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          try {
                            appendCustomSection({
                              id: nanoid(),
                              title: '',
                              htmlContent: '',
                              displayOrder: (customSectionFields && Array.isArray(customSectionFields)) ? customSectionFields.length : 0,
                              enabled: true
                            });
                          } catch (error) {
                            console.error("Error adding custom section:", error);
                            toast({
                              title: "Error adding section",
                              description: "Please try again or contact support.",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Section
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {customSectionTemplates.map(template => (
                          <Button
                            key={template.id}
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              try {
                                appendCustomSection({
                                  id: nanoid(),
                                  title: template.title,
                                  htmlContent: template.content,
                                  displayOrder: (customSectionFields && Array.isArray(customSectionFields)) ? customSectionFields.length : 0,
                                  enabled: true
                                });
                              } catch (error) {
                                console.error("Error adding template:", error);
                                toast({
                                  title: "Error adding template",
                                  description: "Please try again or contact support.",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            + {template.title} Template
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* How to Use Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
                <CardDescription>Provide instructions on how to use the product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="howToUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Usage Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide general instructions on how to use the product"
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="howToUseVideo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="YouTube or other video URL demonstrating usage"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          For YouTube videos, use the embed URL format (e.g., https://www.youtube.com/embed/VIDEO_ID)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base">Step-by-Step Instructions</FormLabel>
                    </div>
                    
                    {howToUseStepFields.length > 0 && (
                      <div className="space-y-4">
                        {howToUseStepFields.map((field, index) => (
                          <div key={field.id} className="p-4 border rounded-md relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2 h-8 w-8 p-0"
                              onClick={() => removeHowToUseStep(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="grid gap-4">
                              <div className="grid gap-2">
                                <FormField
                                  control={form.control}
                                  name={`howToUseSteps.${index}.stepNumber`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Step Number</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          {...field}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseInt(e.target.value) || 1)}
                                          value={field.value || 1}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <FormField
                                  control={form.control}
                                  name={`howToUseSteps.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Step Title</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g., Prepare for the Day"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <FormField
                                  control={form.control}
                                  name={`howToUseSteps.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Step Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Detailed instructions for this step"
                                          {...field}
                                          className="min-h-[80px]"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendHowToUseStep({ stepNumber: howToUseStepFields.length + 1, title: '', description: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Benefits Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Product Benefits</CardTitle>
                <CardDescription>Add the key benefits of your product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="benefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>General Benefits Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the general benefits of this product"
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base">Structured Benefits</FormLabel>
                    </div>
                    
                    {benefitFields.length > 0 && (
                      <div className="space-y-4">
                        {benefitFields.map((field, index) => (
                          <div key={field.id} className="p-4 border rounded-md relative">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-2 h-8 w-8 p-0"
                              onClick={() => removeBenefit(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="grid gap-2">
                                <FormField
                                  control={form.control}
                                  name={`structuredBenefits.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Benefit Title</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g., 99.3% Natural, Safe for Children"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <div className="grid gap-2">
                                <FormField
                                  control={form.control}
                                  name={`structuredBenefits.${index}.imageUrl`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Image URL</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="URL for benefit image"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            
                            <div className="grid gap-2 mt-4">
                              <FormField
                                control={form.control}
                                name={`structuredBenefits.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Benefit Description</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Detailed description of this benefit"
                                        {...field}
                                        className="min-h-[100px]"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendBenefit({ title: '', description: '', imageUrl: '' })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Benefit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Custom HTML Sections */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Custom HTML Sections</CardTitle>
            <CardDescription>Create rich HTML sections like "Clinically Tested To" or "Ingredients List"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {customSectionTemplates.map((section, index) => (
                <div key={section.id} className="border rounded-md p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={`section-enabled-${section.id}`}
                        checked={section.enabled}
                        onCheckedChange={(checked: boolean) => {
                          const updatedSections = [...customSectionTemplates];
                          updatedSections[index].enabled = !!checked;
                          setCustomSectionTemplates(updatedSections);
                        }}
                      />
                      <div className="flex flex-col">
                        <label 
                          htmlFor={`section-enabled-${section.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {section.title}
                        </label>
                        <p className="text-xs text-gray-500">
                          {section.enabled ? 'Visible on product page' : 'Hidden on product page'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCustomSectionTemplates(
                          customSectionTemplates.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`section-title-${index}`}>Section Title</Label>
                        <Input
                          id={`section-title-${index}`}
                          value={section.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const updatedSections = [...customSectionTemplates];
                            updatedSections[index].title = e.target.value;
                            setCustomSectionTemplates(updatedSections);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`section-order-${index}`}>Display Order</Label>
                        <Input
                          id={`section-order-${index}`}
                          type="number"
                          min="0"
                          value={section.displayOrder?.toString() || '0'}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const updatedSections = [...customSectionTemplates];
                            updatedSections[index].displayOrder = parseInt(e.target.value) || 0;
                            setCustomSectionTemplates(updatedSections);
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Lower numbers appear first
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`section-content-${index}`}>HTML Content</Label>
                      <CodeEditor
                        value={section.content}
                        onChange={(value: string) => {
                          const updatedSections = [...customSectionTemplates];
                          updatedSections[index].content = value;
                          setCustomSectionTemplates(updatedSections);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCustomSectionTemplates([
                    ...customSectionTemplates,
                    {
                      id: nanoid(8),
                      title: 'New Section',
                      content: '<div>\n  <!-- Content goes here -->\n</div>',
                      displayOrder: customSectionTemplates.length,
                      enabled: false
                    }
                  ]);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add HTML Section
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                {product ? "Updating..." : "Creating..."}
              </>
            ) : (
              product ? "Update Product" : "Create Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
