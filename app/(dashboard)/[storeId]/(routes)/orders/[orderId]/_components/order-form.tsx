'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Order } from "@/types-db"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    value: z.string().min(1, "Value is required"),
})

type OrderFormValues = z.infer<typeof formSchema>

interface OrderFormProps {
    initialData: Order | null
}

export const OrderForm = ({
    initialData
}: OrderFormProps) => {
    const params = useParams()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            value: "",
        }
    })

    const title = initialData ? 'Edit Order' : 'Create Order'
    const description = initialData ? "Edit a Order" : "Add a new Order"
    const toastMessage = initialData ? 'Order Updated' : 'Order Created'
    const action = initialData ? 'Save Changes' : "Create Order"

    const onSubmit = async (data: OrderFormValues) => {
        try {
            setIsLoading(true)
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/orders/${params.orderId}`, data)
            } else {
                await axios.post(`/api/${params.storeId}/orders`, data)
            }
            router.refresh()
            router.push(`/${params.storeId}/orders`)
            toast.success(toastMessage)
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
            router.refresh()
        }
    }

    const onDelete = async () => {
        try {
            setIsLoading(true)
            await axios.delete(`/api/${params.storeId}/orders/${params.orderId}`)
            router.refresh()
            router.push(`/${params.storeId}/orders`)
            toast.success("Order Removed")
        } catch (error) {
            toast.error("Make sure you removed all products using this Order first")
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
                                            placeholder="Your Order name..." 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                        <Input 
                                            disabled={isLoading} 
                                            placeholder="Your Order value..." 
                                            {...field} 
                                        />
                                    </FormControl>
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