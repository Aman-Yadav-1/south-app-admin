"use client"

import { Modal } from "@/components/modal"
import { useStoreModal } from "@/hooks/use-store-modal"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {toast} from "react-hot-toast"

const formSchema = z.object({
    name: z.string().min(3, {message: "Store name should be minimum 3 characters"})
})

export const StoreModal = () => {
    const storeModal = useStoreModal()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const response = await axios.post("/api/stores", values);
            toast.success("Store created successfully!");
            window.location.assign(`/${response.data.id}`)
        } catch (error) {
            console.error("Error creating store:", error);
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data || "An error occurred while creating the store";
                console.error("Server error:", errorMessage);
                toast.error(errorMessage);
            } else {
                console.error("Unexpected error:", error);
                toast.error("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal 
            title="Create a new store" 
            description="Add a new store to manage the products and categories" 
            isOpen={storeModal.isOpen} 
            onClose={storeModal.onClosed}
        >
            <div>
                <div className="space-y-4 py-2 pb-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input disabled={isLoading} placeholder="Your store name..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
                                <Button disabled={isLoading} variant={"outline"} size={"sm"} onClick={storeModal.onClosed} type="button">
                                    Cancel
                                </Button>
                                <Button disabled={isLoading} type="submit" size={"sm"}>
                                    Continue
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </Modal>
    )
}