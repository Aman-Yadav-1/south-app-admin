'use client'

import { Badge, BadgeProps } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ApiAlertProps{
    title: string;
    description: string;
    variant:'public'| 'admin';
}

const textMap: Record<ApiAlertProps['variant'], string>={
    public: 'Public',
    admin: 'Admin'
}

const variantMap: Record<ApiAlertProps['variant'], BadgeProps['variant']>={
    public : 'secondary',
    admin: 'destructive',
}

export const ApiAlert = ({title, description, variant}: ApiAlertProps)=>{
    const onCopy=()=>{
        navigator.clipboard.writeText(description);
        toast.success("Api Route Copied to clipboard");
    };
    return (
        <Alert>
            <Server className="h-4 w-4"/>
            <AlertTitle className="flex items-center gap-x-2 text-xs">
                {title}
                <Badge variant={variantMap[variant]} className="text-xs">{textMap[variant]}</Badge>
            </AlertTitle>
            <AlertDescription className="mt-4 flex items-center justify-between text-xs">
                <code className="relative rounded=md bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-xs">
                    {description}
                </code>
                <Button variant={'outline'} size={'icon'} onClick={onCopy} className="text-xs">
                    <Copy className='h-4 w-4'/>
                </Button>
            </AlertDescription>
        </Alert>
    )
}