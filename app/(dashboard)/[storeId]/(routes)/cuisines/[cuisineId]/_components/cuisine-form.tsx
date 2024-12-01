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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Cuisine } from "@/types-db"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    value: z.string().min(1, "Value is required"),
})

type CuisineFormValues = z.infer<typeof formSchema>

interface CuisineFormProps {
    initialData: Cuisine | null
}

export const CuisineForm = ({
    initialData
}: CuisineFormProps) => {
    const params = useParams()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<CuisineFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            value: initialData?.value || ''
        }
    })

    const title = initialData ? 'Edit cuisine' : 'Create cuisine'
    const description = initialData ? "Edit a cuisine" : "Add a new cuisine"
    const toastMessage = initialData ? 'cuisine Updated' : 'cuisine Created'
    const action = initialData ? 'Save Changes' : "Create cuisine"

    const onSubmit = async (data: CuisineFormValues) => {
        try {
            setIsLoading(true)
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/cuisines/${params.cuisineId}`, data)
            } else {
                await axios.post(`/api/${params.storeId}/cuisines`, data)
            }
            router.refresh()
            router.push(`/${params.storeId}/cuisines`)
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
            await axios.delete(`/api/${params.storeId}/cuisines/${params.cuisineId}`)
            router.refresh()
            router.push(`/${params.storeId}/cuisines`)
            toast.success("cuisine Removed")
        } catch (error) {
            toast.error("Make sure you removed all products using this cuisine first")
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
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
                                            placeholder="Your cuisine name..." 
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
                                            placeholder="Your cuisine value..." 
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