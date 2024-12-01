'use client'
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { z } from "zod"
import axios from "axios"
import { Trash, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/Modal/alert-modal"
import { Product, Category, Size, Kitchen, Cuisine } from "@/types-db"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox"
import ImagesUpload from "@/components/images-upload"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
    price: z.coerce.number()
        .min(0.01, "Price must be greater than zero")
        .max(100000, "Price is too high"),
    images: z.object({
        url: z.string().url("Invalid image URL")
    }).array().min(1, "At least one image is required").max(7, "Maximum 7 images allowed"),
    isFeatured: z.boolean().optional().default(false),
    isArchived: z.boolean().optional().default(false),
    category: z.string().min(1, "Category is required"),
    size: z.string().optional(),
    cuisine: z.string().optional(),
    kitchen: z.string().optional(),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
    initialData?: Product | null;
    categories: Category[];
    sizes: Size[];
    kitchens: Kitchen[];
    cuisines: Cuisine[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    categories,
    sizes,
    kitchens,
    cuisines
}) => {
    const params = useParams()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const title = initialData ? `Edit product: ${initialData.name}` : 'Create product'
    const action = initialData ? 'Save changes' : "Create product"
    const description = initialData 
        ? `Edit product: ${initialData.name}` 
        : 'Add a new product to your store'
    const toastMessage = initialData ? 'Product updated successfully' : 'Product created successfully'

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            name: initialData.name || '',
            price: initialData.price || 0,
            images: initialData.images?.map(img => ({ url: img.url })) || [],
            isFeatured: initialData.isFeatured || false,
            isArchived: initialData.isArchived || false,
            category: initialData.category || '',
            size: initialData.size || '',
            kitchen: initialData.kitchen || '',
            cuisine: initialData.cuisine || ''
        } : {
            name: '',
            price: 0,
            images: [],
            isFeatured: false,
            isArchived: false,
            category: '',
            size: '',
            kitchen: '',
            cuisine: ''
        }
    })

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setIsLoading(true)
            if(initialData) {
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data)
            } else {
                await axios.post(`/api/${params.storeId}/products`, data)
            }
            router.refresh()
            router.push(`/${params.storeId}/products`)
            toast.success(toastMessage)
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setIsLoading(true)
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
            router.refresh()
            router.push(`/${params.storeId}/products`)
            toast.success("Product removed successfully")
        } catch (error) {
            toast.error("Failed to remove product. Please try again.")
            console.error(error)
        } finally {
            setIsLoading(false)
            setIsOpen(false)
        }
    }

    return (
        <>
            <AlertModal 
                isOpen={isOpen} 
                onClose={() => setIsOpen(false)}
                onConfirm={onDelete}
                loading={isLoading}
            />
            <div className="flex items-center justify-between">
                <Heading 
                    title={title} 
                    description={description} 
                />
                {initialData && (
                    <Button
                        disabled={isLoading}
                        variant="destructive"
                        size="icon"
                        onClick={() => setIsOpen(true)}
                        aria-label="Delete product"
                    >
                        <Trash className="h-4 w-4"/>
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="images"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Product Images</FormLabel>
                                <FormControl>
                                    <ImagesUpload
                                        value={field.value.map(image => image.url)}
                                        onChange={(urls)=>{
                                            if (urls.length > 7) {
                                                toast.error("Maximum 7 images allowed")
                                                return
                                            }
                                            field.onChange(urls.map((url) => ({url})))
                                        }}
                                        onRemove={(url)=>{
                                            field.onChange(
                                                field.value.filter(current =>current.url !== url)
                                            )
                                        }}
                                    />
                                </FormControl>
                                <FormDescription>Upload between 1 and 7 product images</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            disabled={isLoading} 
                                            placeholder="Product name" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number"
                                            disabled={isLoading} 
                                            placeholder="0" 
                                            {...field}
                                            className="appearance-none no-arrows" 
                                            onWheel={(e) => e.currentTarget.blur()}
                                        />
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
                                        disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        value={field.value} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
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
                                        disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        value={field.value} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select a size" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sizes.map((size) => (
                                                <SelectItem key={size.id} value={size.id}>
                                                    {size.name}
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
                            name="kitchen"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kitchen</FormLabel>
                                    <Select 
                                        disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        value={field.value} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select kitchen type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {kitchens.map((kitchen) => (
                                                <SelectItem key={kitchen.id} value={kitchen.id}>
                                                    {kitchen.name}
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
                            name="cuisine"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cuisine</FormLabel>
                                    <Select 
                                        disabled={isLoading} 
                                        onValueChange={field.onChange} 
                                        value={field.value} 
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue={field.value} placeholder="Select cuisine" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {cuisines.map((cuisine) => (
                                                <SelectItem key={cuisine.id} value={cuisine.id}>
                                                    {cuisine.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="isFeatured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Featured</FormLabel>
                                        <FormDescription>This product will be on home screen under featured products</FormDescription>
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
                                        <FormLabel>Archived</FormLabel>
                                        <FormDescription>
                                            This product will not be displayed anywhere inside the store
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button 
                        disabled={isLoading} 
                        className="ml-auto" 
                        type="submit"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : action}
                    </Button>
                </form>
            </Form>
        </>
    )
}

export default ProductForm