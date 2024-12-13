'use client'

import { useState } from "react"
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
import { Billboards } from "@/types-db"
import { AlertModal } from "@/components/Modal/alert-modal"
import { useOrigin } from "@/hooks/use-origin"
import ImageUpload from "@/components/image-upload"
import { deleteObject, ref } from "firebase/storage"
import { storage } from "@/lib/firebase"

interface BillboardFormProps {
    initialData: Billboards | null
}

const formSchema = z.object({
    label: z.string().min(1, "Label is required"),
    imageUrl: z.string().min(1, "Image is required"),
})

type BillboardFormValues = z.infer<typeof formSchema>

export const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin()

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: '',
            imageUrl: '',
        }
    })

    const title = initialData ? 'Edit Billboard' : 'Create Billboard';
    const description = initialData ? "Edit a billboard" : "Add a new billboard";
    const toastMessage = initialData ? 'Billboard Updated' : 'Billboard Created';
    const action = initialData ? 'Save Changes' : "Create Billboard"

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            if(initialData){
                await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
            }else{
                await axios.post(`/api/${params.storeId}/billboards`, data);
            }
            toast.success(toastMessage)
            router.refresh()
            router.push(`/${params.storeId}/billboards`)
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setIsLoading(true);
            const {imageUrl} = form.getValues()
            await deleteObject(ref(storage, imageUrl)).then(async ()=>{
                await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
            })
            router.refresh();
            router.push(`/${params.storeId}/billboards`)
            toast.success("Billboard Removed");
        } catch (error) {
            toast.error("Make sure you removed all categories using this billboard first.");
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
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Background image</FormLabel>
                                <FormControl>
                                    <ImageUpload 
                                        value={field.value ? [field.value] : []} 
                                        disabled={isLoading} 
                                        onChange={(url) => field.onChange(url)}
                                        onRemove={() => field.onChange('')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Billboard label" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={isLoading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    )
}