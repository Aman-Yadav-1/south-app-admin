'use client'

import { useEffect, useState, useCallback } from "react"
import { PuffLoader } from 'react-spinners'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { ImagePlus, Trash } from 'lucide-react'
import toast from "react-hot-toast"
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { Button } from "./ui/button"

interface ImageUploadProps {
    disabled?: boolean
    onChange: (value: string) => void
    onRemove: (value: string) => void
    value: string[]
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value
}) => {
    const [isMounted, setIsMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState<number>(0)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': []
        },
        disabled: disabled || isLoading,
        multiple: false
    })

    const onUpload = async (file: File) => {
        setIsLoading(true)

        const uploadTask = uploadBytesResumable(ref(storage, `Image/${Date.now()}-${file.name}`), file)

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setProgress(progress)
            },
            (error) => {
                toast.error(error.message)
                setIsLoading(false)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    onChange(downloadURL)
                    setIsLoading(false)
                    setProgress(0)
                    toast.success("Image uploaded successfully!")
                });
            }
        )
    }

    const onDelete=(url:string)=>{
        onRemove(url)
        deleteObject(ref(storage, url)).then(()=>{
            toast.success("Image Removed")
        })
    }

    if (!isMounted) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-4">
            {value.map((url, index) => (
                <div key={`${url}-${index}`} className="relative w-52 h-52">
                    <Image
                        fill
                        src={url}
                        alt={`Uploaded Image ${index + 1}`}
                        className="object-cover rounded-md"
                    />
                    <div className="absolute z10 top-2 right-2">
                    <Button
                    onClick={()=>onDelete(url)}
                        type="button" variant={"destructive"} size="icon"
                    >
                        <Trash className="h-4 w-4"/>
                    </Button>
                    </div>
                </div>
            ))}
            <div
                {...getRootProps()}
                className={`w-52 h-52 rounded-md overflow-hidden border-dashed border-2 ${
                    isDragActive ? 'border-blue-500' : 'border-gray-200'
                } flex items-center justify-center flex-col gap-3 cursor-pointer`}
            >
                <input {...getInputProps()} />
                {isLoading ? (
                    <>
                        <PuffLoader size={30} color="#555" />
                        <p>{`${progress.toFixed(2)}%`}</p>
                    </>
                ) : (
                    <>
                        <ImagePlus className="h-6 w-6 text-gray-500" />
                        <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                    </>
                )}
            </div>
        </div>
    )
}

export default ImageUpload