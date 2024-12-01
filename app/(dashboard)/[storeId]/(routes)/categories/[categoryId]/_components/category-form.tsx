'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from "axios"
import { Trash } from "lucide-react"
import toast from "react-hot-toast"

import { Heading } from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AlertModal } from "@/components/Modal/alert-modal"
import { Billboards, Category } from "@/types-db"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryFormProps {
    initialData?: Category | null
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    billboardId: z.string().min(1, "Billboard is required"),
})

export const CategoryForm: React.FC<CategoryFormProps> = ({ 
    initialData
}) => {
    const params = useParams()
    const router = useRouter()

    const [billboards, setBillboards] = useState<Billboards[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const fetchBillboards = async () => {
            try {
                const response = await axios.get(`/api/${params.storeId}/billboards`)
                setBillboards(response.data)
            } catch (error) {
                toast.error("Failed to load billboards")
                console.error(error)
            }
        }

        fetchBillboards()
    }, [params.storeId])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            billboardId: initialData?.billboardId || '',
        }
    })

    const title = initialData ? 'Edit Category' : 'Create Category'
    const description = initialData ? "Edit a category" : "Add a new category"
    const toastMessage = initialData ? 'Category Updated' : 'Category Created'
    const action = initialData ? 'Save Changes' : "Create Category"

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true)
            const billboardLabel = billboards.find(b => b.id === data.billboardId)?.label || ''
            
            const payload = { 
                ...data, 
                billboardLabel 
            }

            if (initialData) {
                await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, payload)
            } else {
                await axios.post(`/api/${params.storeId}/categories`, payload)
            }
            toast.success(toastMessage)
            router.push(`/${params.storeId}/categories`)
        } catch (error) {
            toast.error("Something went wrong")
            console.error(error)
        } finally {
            router.refresh()
            setIsLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setIsLoading(true)
            await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`)
            router.refresh()
            router.push(`/${params.storeId}/categories`)
            toast.success("Category Removed")
        } catch (error) {
            toast.error("Make sure you removed all products using this category first")
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
                <Heading title={title} description={description}/>
                {initialData && (
                    <Button
                        disabled={isLoading}
                        variant="destructive"
                        size="icon"
                        onClick={() => setIsOpen(true)}
                    >
                        <Trash className="h-4 w-4"/>
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                                            placeholder="Category name" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="billboardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billboard</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue 
                                                    placeholder={billboards.length > 0 
                                                        ? "Select a billboard" 
                                                        : "Loading billboards..."
                                                    } 
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {billboards.length === 0 ? (
                                                <SelectItem value="empty" disabled>
                                                    No billboards found
                                                </SelectItem>
                                            ) : (
                                                billboards.map(billboard => (
                                                    <SelectItem 
                                                        key={billboard.id} 
                                                        value={billboard.id}
                                                    >
                                                        {billboard.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button 
                        disabled={isLoading} 
                        className="ml-auto" 
                        type="submit"
                    >
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    )
}