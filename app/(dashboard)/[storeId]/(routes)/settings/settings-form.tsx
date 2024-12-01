'use client'

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from "axios"
import { Trash } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Store } from "@/types-db"
import { useOrigin } from "@/hooks/use-origin"
import { AlertModal } from "@/components/Modal/alert-modal"
import { Heading } from "@/components/heading"
import { ApiAlert } from "@/components/api-alert"

interface SettingsFormProps {
    initialData: Store
}

const formSchema = z.object({
    name: z.string().min(3, { message: "Store name should be minimum 3 characters" })
})

type SettingsFormValues = z.infer<typeof formSchema>

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin()

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name
        }
    })

    const onSubmit = async (values: SettingsFormValues) => {
        try {
            setIsLoading(true);
            await axios.patch(`/api/${params.storeId}`, values);
            router.refresh();
            toast.success("Store updated successfully");
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/${params.storeId}`);
            router.refresh();
            router.push('/');
            toast.success("Store Removed");
        } catch (error) {
            console.error("Error deleting store:", error);
            toast.error("Failed to delete store");
        } finally {
            setIsLoading(false);
            setIsOpen(false);
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
                <Heading title='Settings' description='Manage store preferences'/>
                <Button
                    disabled={isLoading}
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                >
                    <Trash className="h-4 w-4"/>
                </Button>
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
                                            placeholder="Store name" 
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
                        Save changes
                    </Button>
                </form>
            </Form>
            <Separator />
            <ApiAlert 
                title='NEXT_PUBLIC_API_URL'
                description={`${origin}/api/${params.storeId}`}
                variant='public'
            />
        </>
    )
}