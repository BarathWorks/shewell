"use client";

import { useState } from "react";
import { Button } from "@repo/ui/src/@/components/button";
import { toast } from "@repo/ui/src/@/components/use-toast";
import AddressForm from "./address-form";
import { IAddressForm } from "~/models/address.model";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/src/@/components/alert-dialog";
import { deleteAddress } from "./address-actions";
import { Edit2, Trash2, Phone, MapPin, Home, Briefcase, Tag, X, Loader2 } from "lucide-react";

type ICard = {
  values: IAddressForm;
  countries: { id: string; name: string }[];
};

export default function AddressCard({ values, countries }: ICard) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddressCreated = () => {
    setIsEditDialogOpen(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const resp = await deleteAddress(values.id!);
      if (resp.error) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: resp.error,
        });
      } else if (resp.message) {
        toast({
          title: "Address Removed",
          description: resp.message,
        });
        setIsDeleteDialogOpen(false);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete address.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getAddressIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "home":
        return <Home className="h-3.5 w-3.5" />;
      case "office":
      case "work":
        return <Briefcase className="h-3.5 w-3.5" />;
      default:
        return <Tag className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-md md:p-6">
      <div className="flex flex-col gap-3">
        {/* Header: Name + Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-poppins text-base font-semibold text-[#181818] md:text-lg">
              {values.name}
            </h3>
            {values.addressType && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#E6F4EE] px-2.5 py-0.5 font-inter text-xs font-semibold text-[#00898F]">
                {getAddressIcon(values.addressType)}
                {values.addressType}
              </span>
            )}
          </div>
        </div>

        {/* Address & Phone Details */}
        <div className="flex flex-col gap-1.5 font-inter text-sm text-[#666666]">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{values.mobile}</span>
          </div>

          <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>
              {values.houseNo}, {values.area}, {values.city}, {values.pincode}
              {values.landmark && ` (Landmark: ${values.landmark})`}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="mt-5 flex items-center gap-4 border-t border-gray-100 pt-4">
        {/* Edit Address Dialog */}
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 font-poppins text-xs font-semibold text-[#00898F] hover:underline"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-full max-w-[650px] rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <AlertDialogCancel
              onClick={() => setIsEditDialogOpen(false)}
              className="absolute right-4 top-4 border-none p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </AlertDialogCancel>
            <AddressForm
              countries={countries}
              initialValues={values}
              onAddressCreated={handleAddressCreated}
            />
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Address Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 font-poppins text-xs font-semibold text-red-500 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-full max-w-[450px] rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-poppins text-lg font-semibold text-[#181818]">
                Delete Address?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-inter text-xs text-[#666666]">
                Are you sure you want to delete this saved address? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 flex gap-2">
              <AlertDialogCancel
                onClick={() => setIsDeleteDialogOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 font-poppins text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 font-poppins text-xs font-semibold text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Address"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

