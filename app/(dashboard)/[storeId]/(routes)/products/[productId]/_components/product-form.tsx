"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import * as z from "zod";
import {
  Trash,
  Save,
  ArrowLeft,
  ImagePlus,
  DollarSign,
  Tag,
  Layers,
  Star,
  Archive,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/Modal/alert-modal";
import ImagesUpload from "@/components/images-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/types-db";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Hardcoded options with improved display
const categoryOptions = [
  { id: "food", name: "Food", description: "Meals and main dishes" },
  { id: "beverage", name: "Beverage", description: "Drinks and refreshments" },
  { id: "dessert", name: "Dessert", description: "Sweet treats and desserts" },
  {
    id: "appetizer",
    name: "Appetizer",
    description: "Starters and small plates",
  },
  { id: "side", name: "Side Dish", description: "Accompaniments and sides" },
];

const sizeOptions = [
  { id: "small", name: "Small", description: "Individual portion" },
  { id: "medium", name: "Medium", description: "Regular size" },
  { id: "large", name: "Large", description: "Family size" },
  { id: "xlarge", name: "Extra Large", description: "Party size" },
];

// Enhanced form schema with additional fields
const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  size: z.string().min(1, "Size is required"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  nutritionalInfo: z.string().optional(),
  ingredients: z.string().optional(),
  preparationTime: z.coerce.number().min(0).optional(),
  qty: z.coerce.number().min(0).default(0),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: Product | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit a product" : "Add a new product";
  const toastMessage = initialData ? "Product updated" : "Product created";
  const action = initialData ? "Save changes" : "Create";

  // Initialize form with default values or existing product data
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: parseFloat(String(initialData?.price)),
          images: initialData?.images.map((image) => image.url) || [],
          category: initialData?.category || "",
          size: initialData?.size || "",
          description: initialData?.description || "",
          tags: initialData?.tags || [],
          nutritionalInfo: initialData?.nutritionalInfo || "",
          ingredients: initialData?.ingredients || "",
          preparationTime: initialData?.preparationTime || 0,
          qty: initialData?.qty || 0,
        }
      : {
          name: "",
          images: [],
          price: 0,
          description: "",
          category: "",
          size: "",
          isFeatured: false,
          isArchived: false,
          tags: [],
          nutritionalInfo: "",
          ingredients: "",
          preparationTime: 0,
          qty: 0,
        },
  });

  // Initialize tags from form values
  useEffect(() => {
    const formTags = form.getValues("tags");
    if (formTags) {
      setTags(formTags);
    }
  }, [form]);

  // Handle tag addition
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      form.setValue("tags", newTags);
      setTagInput("");
    }
  };

  // Handle tag removal
  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    form.setValue("tags", newTags);
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      // Transform data for Firestore
      const formattedData = {
        ...data,
        price: Number(data.price),
        images: data.images.map((url) => ({ url })),
        storeId: params.storeId,
        updatedAt: serverTimestamp(),
      };

      if (initialData) {
        // Update existing product
        const productRef = doc(db, "stores", params.storeId as string, "products", params.productId as string);
        await updateDoc(productRef, formattedData);
      } else {
        // Create new product
        const productRef = doc(collection(db, "stores", params.storeId as string, "products"));
        await setDoc(productRef, {
          ...formattedData,
          createdAt: serverTimestamp()
        });
      }
      
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success(toastMessage);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      // Delete images from storage
      const images = form.getValues("images");
      for (const imageUrl of images) {
        try {
          // Extract the file path from the URL
          const filePathMatch = imageUrl.match(/o\/([^?]+)/);
          if (filePathMatch && filePathMatch[1]) {
            const filePath = decodeURIComponent(filePathMatch[1]);
            const imageRef = ref(storage, filePath);
            await deleteObject(imageRef);
          }
        } catch (error) {
          console.log("[IMAGE_DELETE_ERROR]", error);
          // Continue with deletion even if image deletion fails
        }
      }

      // Delete product from Firestore
      const productRef = doc(db, "products", params.productId as string);
      await deleteDoc(productRef);

      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success("Product deleted.");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/${params.storeId}/products`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Heading title={title} description={description} />
        </div>
        <div className="flex items-center gap-2">
          {initialData && (
            <Button
              disabled={loading}
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            disabled={loading}
            type="submit"
            form="product-form"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {action}
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <Form {...form}>
        <form
          id="product-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <Tabs
            defaultValue="basic"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="flex items-center gap-2"
              >
                <Layers className="h-4 w-4" />
                Inventory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>
                      Enter the basic details about your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder="Product name"
                              {...field}
                              className="focus-visible:ring-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              disabled={loading}
                              placeholder="Describe your product"
                              {...field}
                              className="resize-none focus-visible:ring-2"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pricing & Categorization</CardTitle>
                    <CardDescription>
                      Set the price and categorize your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                ₹
                              </span>
                              <Input
                                type="number"
                                disabled={loading}
                                placeholder="9.99"
                                {...field}
                                className="pl-7"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="focus-visible:ring-2">
                                <SelectValue
                                  defaultValue={field.value}
                                  placeholder="Select a category"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryOptions.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  <div className="flex flex-col">
                                    <span>{category.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {category.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="focus-visible:ring-2">
                                <SelectValue
                                  defaultValue={field.value}
                                  placeholder="Select a size"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sizeOptions.map((size) => (
                                <SelectItem key={size.id} value={size.id}>
                                  <div className="flex flex-col">
                                    <span>{size.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {size.description}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Product Tags</CardTitle>
                  <CardDescription>
                    Add tags to help customers find your product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {tags.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No tags added yet
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      className="focus-visible:ring-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addTag}
                      disabled={!tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <div className="flex items-center">
                          <FormLabel className="font-medium">
                            Featured Product
                          </FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Featured products appear on the home page</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormDescription>
                          This product will appear on the home page
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isArchived"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <div className="flex items-center">
                          <FormLabel className="font-medium">
                            Archived
                          </FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Archived products are hidden from customers
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormDescription>
                          This product will not appear anywhere in the store
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Add up to 7 images to showcase your product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                          <ImagesUpload
                            value={field.value}
                            disabled={loading}
                            onChange={(urls) => field.onChange(urls)}
                            onRemove={(url) =>
                              field.onChange(
                                field.value.filter((current) => current !== url)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Ingredients</CardTitle>
                    <CardDescription>
                      List the ingredients used in this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              disabled={loading}
                              placeholder="List ingredients here"
                              {...field}
                              className="resize-none focus-visible:ring-2"
                              rows={6}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Nutritional Information</CardTitle>
                    <CardDescription>
                      Add nutritional details for this product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="nutritionalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              disabled={loading}
                              placeholder="Add nutritional information"
                              {...field}
                              className="resize-none focus-visible:ring-2"
                              rows={6}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Preparation Time</CardTitle>
                  <CardDescription>
                    How long does it take to prepare this product?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="preparationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              disabled={loading}
                              placeholder="15"
                              {...field}
                              className="w-24 focus-visible:ring-2"
                            />
                            <span className="text-muted-foreground">
                              minutes
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>
                    Track stock levels for this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="qty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity in Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={loading}
                            placeholder="0"
                            {...field}
                            className="w-full focus-visible:ring-2"
                          />
                        </FormControl>
                        <FormDescription>
                          Current inventory level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Inventory is automatically updated when orders are placed
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.push(`/${params.storeId}/products`)}
            >
              Cancel
            </Button>
            <Button disabled={loading} type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
