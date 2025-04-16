'use client'

import { Badge, BadgeProps } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useState } from "react";

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
    const [isCopied, setIsCopied] = useState(false);
    
    const onCopy = () => {
        navigator.clipboard.writeText(description);
        setIsCopied(true);
        toast.success("API Route copied to clipboard");
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };
    
    return (
        <Alert>
            <div className="flex items-start">
                <Server className="h-4 w-4 mt-0.5" />
                <div className="ml-2 flex-1 overflow-hidden">
                    <AlertTitle className="flex flex-wrap items-center gap-x-2 text-xs">
                        {title}
                        <Badge variant={variantMap[variant]} className="text-xs">
                            {textMap[variant]}
                        </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <code className="relative rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-xs break-all">
                            {description}
                        </code>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={onCopy} 
                            className="h-8 w-8 shrink-0 self-end sm:self-auto"
                        >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">
                                {isCopied ? "Copied" : "Copy API Route"}
                            </span>
                        </Button>
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    )
}
