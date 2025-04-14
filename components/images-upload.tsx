"use client";

import React, { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";
import Image from "next/image";
import { ImagePlus, Trash, Upload, X, Check, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Badge } from "./ui/badge";

interface ImagesUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
}

interface UploadProgress {
  totalProgress: number;
  filesCompleted: number;
  totalFiles: number;
}

const ImagesUpload: React.FC<ImagesUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    totalProgress: 0,
    filesCompleted: 0,
    totalFiles: 0,
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
    // Reset the input value to allow uploading the same file again
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      toast.error("Please drop image files only");
      return;
    }

    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    // Check if total images would exceed limit
    if (files.length + value.length > 7) {
      toast.error("Maximum 7 images allowed");
      return;
    }

    // Check file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setIsLoading(true);
    const newUrls: string[] = [];
    setUploadProgress({
      totalProgress: 0,
      filesCompleted: 0,
      totalFiles: validFiles.length,
    });

    // Create an array to track individual file progress
    const fileProgresses = new Array(validFiles.length).fill(0);

    validFiles.forEach((file: File, index: number) => {
      const fileName = `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      )}`;
      const uploadTask = uploadBytesResumable(
        ref(storage, `Images/${fileName}`),
        file,
        { contentType: file.type }
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Update progress for this specific file
          fileProgresses[index] =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          // Calculate total progress across all files
          const totalProgress =
            fileProgresses.reduce((a, b) => a + b, 0) / validFiles.length;

          setUploadProgress((prev) => ({
            ...prev,
            totalProgress,
          }));
        },
        (error) => {
          toast.error(`Error uploading ${file.name}: ${error.message}`);
          setIsLoading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            newUrls.push(downloadURL);

            setUploadProgress((prev) => ({
              ...prev,
              filesCompleted: prev.filesCompleted + 1,
            }));

            // Only update state when all files are done
            if (newUrls.length === validFiles.length) {
                onChange([...value, ...newUrls]); // This is correct - we're adding new URLs to existing ones
                setIsLoading(false);
                toast.success("All files uploaded successfully");
              }
          });
        }
      );
    });
  };

  const onDelete = (url: string) => {
    try {
      // First update the UI by removing the URL from the value array
      const newValue = value.filter((imageUrl) => imageUrl !== url);
      onChange(newValue); // Update the form state first
      onRemove(url); // Then call the onRemove callback
      
      // Then try to delete from storage
      const fileRef = ref(storage, url);
      deleteObject(fileRef)
        .then(() => {
          toast.success("Image deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting image:", error);
          toast.error("Error deleting image from storage");
        });
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("Failed to delete image");
    }
  };
  

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <Card
              key={`${url}-${index}`}
              className="overflow-hidden group relative"
            >
              <CardContent className="p-0">
                <div className="relative w-full pt-[100%]">
                  {url ? (
                    <Image
                    fill
                    src={url || '/placeholder-image.jpg'} // Add a fallback image path
                    alt={`Product Image ${index + 1}`}
                    className="object-cover transition-all duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={!url} // Add this to handle empty URLs
                />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => onDelete(url)}
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="rounded-full"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 bg-black/60 text-white"
              >
                {index === 0 ? "Main" : `Image ${index + 1}`}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      {value.length < 7 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4 transition-all",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-primary/50"
          )}
        >
          {isLoading ? (
            <div className="w-full flex flex-col items-center gap-4 py-4">
              <PuffLoader size={40} color="#555" />
              <Progress
                value={uploadProgress.totalProgress}
                className="w-full max-w-xs h-2"
              />
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-muted-foreground">
                  {`${uploadProgress.filesCompleted} of ${uploadProgress.totalFiles} files`}
                </p>
                <p className="text-sm font-medium">
                  {`${uploadProgress.totalProgress.toFixed(0)}% complete`}
                </p>
              </div>
            </div>
          ) : (
            <label className="w-full h-full cursor-pointer flex flex-col items-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <ImagePlus className="h-8 w-8 text-primary" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-medium">Drag & drop images here</p>
                <p className="text-xs text-muted-foreground">
                  or click to browse (max 7 images, 5MB each)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {value.length} of 7 images uploaded
                </p>
              </div>
              <Button
  type="button"
  variant="outline"
  className="mt-2"
  disabled={disabled}
  onClick={() => fileInputRef.current?.click()} // Add this onClick handler
>
  <Upload className="h-4 w-4 mr-2" />
  Select Files
</Button>
              <input
                ref={fileInputRef} // Add this ref
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

      {value.length >= 7 && (
        <div className="flex items-center justify-center p-4 border rounded-md bg-muted/20">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Maximum number of images (7) reached</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesUpload;
