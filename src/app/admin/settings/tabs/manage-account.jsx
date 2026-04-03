"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFetchData, usePatch } from "@/hooks/useApi";
import { Loader2 } from "lucide-react";
import { useImageSrc } from "@/hooks/useImageSrc";

export default function ManageAccount() {
  // FIX: Add isFormData: true as third parameter
  const patchProfile = usePatch("/api/admin/profile", "profile", true);
  
  const { data, refetch } = useFetchData(
    "/api/admin/profile",
    "profile"
  );

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    dateOfBirth: "",
    city: "",
    postalCode: "",
    image: null,
  });
  const imageSrc = useImageSrc(form?.image, "/placeholder-user.jpg");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (data?.success) {
      setForm({
        fullName: data.data.fullName || "",
        email: data.data.email || "",
        dateOfBirth: data.data.dateOfBirth
          ? new Date(data.data.dateOfBirth).toISOString().substring(0, 10)
          : "",
        city: data.data.city || "",
        postalCode: data.data.postalCode || "",
        image: data.data.image || null,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) setForm({ ...form, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("dateOfBirth", form.dateOfBirth);
    formData.append("city", form.city);
    formData.append("postalCode", form.postalCode);
    if (form.image instanceof File) formData.append("image", form.image);
    
    // FIX: Pass data directly, not in an options object
    patchProfile.mutate(formData, {
      onSuccess: () => refetch(),
    });
  };

  return (
    <div className="bg-white border rounded-md p-6 shadow-sm w-full md:w-[65%]">
      <h2 className="text-base text-center font-medium mb-1">
        Manage your profile and security settings
      </h2>
      <p className="text-sm text-center text-muted-foreground mb-8">
        Admin Account
      </p>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={imageSrc}
              alt="Profile photo"
            />
            <AvatarFallback>
              {form.fullName
                ? form.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition">
            <span className="text-xs font-medium">Change</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">Profile photo</p>
          <p className="text-xs text-muted-foreground">
            Click the avatar to upload a new one.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Full name"
            name="fullName"
            value={form.fullName}
            disabled
          />
          <Input
            placeholder="Email Address"
            name="email"
            value={form.email}
            disabled
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
          />
          <Input
            placeholder="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Postal code"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
          />
        </div>

        <Button
          type="submit"
          className="mt-4 bg-[#3C3CF6] text-white hover:bg-[#2e2ee6] min-w-[140px] flex items-center justify-center gap-2"
          disabled={patchProfile.isPending}
        >
          {patchProfile.isPending ? "Saving" : "Save Changes"}
          {patchProfile.isPending && (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          )}
        </Button>
      </form>
    </div>
  );
}