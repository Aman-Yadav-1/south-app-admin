'use client'

import React, { useEffect, useState } from "react"
import { PuffLoader } from 'react-spinners'
import Image from 'next/image'
import { ImagePlus, Trash } from 'lucide-react'
import toast from "react-hot-toast"
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { Button } from "./ui/button"

interface ImagesUploadProps {
    disabled?: boolean
    onChange: (value: string[]) => void
    onRemove: (value: string) => void
    value: string[]
}

interface UploadProgress {
    totalProgress: number
    filesCompleted: number
    totalFiles: number
}

const ImagesUpload: React.FC<ImagesUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value
}) => {
    const [isMounted, setIsMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
        totalProgress: 0,
        filesCompleted: 0,
        totalFiles: 0
    })

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        
        // Check if total images would exceed limit
        if (files.length + value.length > 7) {
            toast.error("Maximum 7 images allowed")
            return
        }
        
        setIsLoading(true)
        const newUrls: string[] = []
        setUploadProgress({
            totalProgress: 0,
            filesCompleted: 0,
            totalFiles: files.length
        })

        // Create an array to track individual file progress
        const fileProgresses = new Array(files.length).fill(0)

        files.forEach((file: File, index: number) => {
            const uploadTask = uploadBytesResumable(
                ref(storage, `Images/${Date.now()}-${file.name}`), 
                file, 
                {contentType: file.type}
            )

            uploadTask.on(
                "state_changed", 
                (snapshot) => {
                    // Update progress for this specific file
                    fileProgresses[index] = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    
                    // Calculate total progress across all files
                    const totalProgress = fileProgresses.reduce((a, b) => a + b, 0) / files.length
                    
                    setUploadProgress(prev => ({
                        ...prev,
                        totalProgress
                    }))
                },
                (error) => {
                    toast.error(`Error uploading ${file.name}: ${error.message}`)
                    setIsLoading(false)
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        newUrls.push(downloadURL)
                        
                        setUploadProgress(prev => ({
                            ...prev,
                            filesCompleted: prev.filesCompleted + 1
                        }))

                        // Only update state when all files are done
                        if (newUrls.length === files.length) {
                            onChange([...value, ...newUrls])
                            setIsLoading(false)
                            toast.success("All files uploaded successfully")
                        }
                    })
                }
            )
        })
    }

    const onDelete = (url: string) => {
        const newValue = value.filter(imageUrl => imageUrl !== url)
        onRemove(url)
        onChange(newValue)
        deleteObject(ref(storage, url)).then(() => {
            toast.success("Image deleted successfully")
        }).catch((error) => {
            toast.error(error.message)
        })
    }

    return (
        <div>
            {value.length > 0 && (
                <div className="mb-4 flex items-center gap-4 flex-wrap">
                    {value.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative w-52 h-52 rounded-md overflow-hidden">
                            <Image
                                fill
                                src={url}
                                alt={`Uploaded Image ${index + 1}`}
                                className="object-cover rounded-md"
                            />
                            <div className="absolute z-10 top-2 right-2">
                                <Button
                                    onClick={() => onDelete(url)}
                                    type="button" 
                                    variant="destructive" 
                                    size="icon"
                                >
                                    <Trash className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {value.length < 7 && (
                <div
                    className={`w-52 h-52 rounded-md overflow-hidden border-dashed border-2 ${
                        disabled ? 'border-blue-500' : 'border-gray-200'
                    } flex items-center justify-center flex-col gap-3 cursor-pointer`}
                >
                    {isLoading ? (
                        <>
                            <PuffLoader size={30} color="#555" />
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-sm text-gray-500">
                                    {`${uploadProgress.filesCompleted} of ${uploadProgress.totalFiles} files`}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {`${uploadProgress.totalProgress.toFixed(0)}%`}
                                </p>
                            </div>
                        </>
                    ) : (
                        <label className="w-full h-full cursor-pointer">
                            <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                                <ImagePlus className="h-6 w-6 text-gray-500" />
                                <p className="text-sm text-gray-500">Click to upload multiple images</p>
                            </div>
                            <input
                                type="file"
                                onChange={onUpload}
                                className="hidden"
                                accept="image/*"
                                multiple
                                disabled={disabled}
                            />
                        </label>
                    )}
                </div>
            )}
        </div>
    )
}

export default ImagesUpload