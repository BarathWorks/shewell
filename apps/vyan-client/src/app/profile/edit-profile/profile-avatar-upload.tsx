"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@repo/ui/src/@/components/button";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import { Camera, Trash2, User as UserIcon } from "lucide-react";

interface ProfileAvatarUploadProps {
  name: string;
  initialAvatarUrl?: string | null;
}

export default function ProfileAvatarUpload({
  name,
  initialAvatarUrl,
}: ProfileAvatarUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialAvatarUrl || "/profile-user.png"
  );

  const getInitials = (userName: string) => {
    if (!userName) return "U";
    return userName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, or WEBP).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 2MB.",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    toast({
      title: "Avatar updated",
      description: "Profile photo preview updated successfully.",
    });
  };

  const handleRemove = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Avatar removed",
      description: "Profile photo set to default initials.",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start pb-6 border-b border-gray-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#E6F4EE] bg-gray-100 shadow-sm transition-all group-hover:border-[#00898F]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name || "User avatar"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#E6F4EE] font-poppins text-2xl font-bold text-[#00898F]">
              {getInitials(name)}
            </div>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <h3 className="font-poppins text-lg font-semibold text-[#181818]">
          {name || "User Profile"}
        </h3>
        <p className="font-inter text-xs text-[#666666] mb-3">
          PNG, JPG or WEBP up to 2MB
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-gray-200 font-poppins text-xs text-[#00898F] hover:bg-[#E6F4EE] hover:text-[#00898F]"
          >
            <Camera className="mr-1.5 h-3.5 w-3.5" />
            Upload Photo
          </Button>

          {avatarUrl && avatarUrl !== "/profile-user.png" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="rounded-xl font-poppins text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
