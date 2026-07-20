"use client";

import AddressCard from "./address-card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogCancel,
} from "@repo/ui/src/@/components/alert-dialog";
import AddressForm from "./address-form";
import { IAddress, IAddressForm } from "~/models/address.model";
import { useState } from "react";
import { useCartStore } from "~/store/cart.store";
import { Plus, X, MapPinOff } from "lucide-react";

type IAddressPopUp = {
  countries: { id: string; name: string }[];
  addedAddresses: IAddress[];
};

export default function AddressPopUp({
  countries,
  addedAddresses,
}: IAddressPopUp) {
  const emptyForm: IAddressForm = {
    id: "",
    area: "",
    name: "",
    countryId: "",
    stateId: "",
    city: "",
    houseNo: "",
    mobile: "",
    landmark: "",
    pincode: "",
    addressType: "Home",
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { cart, setAddress } = useCartStore((state) => ({
    cart: state.cart,
    setAddress: state.setAddress,
  }));

  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(
    cart.address || null
  );

  const handleAddressCreated = () => {
    setIsDialogOpen(false);
  };

  const handleSelect = (item: IAddress) => {
    setAddress(item);
    setSelectedAddress(item);
  };

  return (
    <div className="flex flex-col gap-5">
      {addedAddresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {addedAddresses.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`cursor-pointer rounded-2xl transition-all ${
                selectedAddress?.id === item.id
                  ? "ring-2 ring-[#00898F] ring-offset-2"
                  : ""
              }`}
            >
              <AddressCard values={item} countries={countries} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
          <MapPinOff className="h-10 w-10 text-gray-400 mb-2" />
          <h3 className="font-poppins text-base font-semibold text-gray-700">
            No Addresses Saved
          </h3>
          <p className="font-inter text-xs text-gray-500 max-w-sm mt-1 mb-4">
            You haven't added any delivery addresses yet. Add one now for faster checkout.
          </p>
        </div>
      )}

      {/* Add New Address Button & Modal */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <div
            onClick={() => setIsDialogOpen(true)}
            className="group flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#00898F] bg-[#E6F4EE]/40 p-5 transition-all hover:bg-[#E6F4EE]"
          >
            <Plus className="h-5 w-5 text-[#00898F] transition-transform group-hover:scale-110" />
            <span className="font-poppins text-base font-semibold text-[#00898F]">
              Add New Address
            </span>
          </div>
        </AlertDialogTrigger>

        <AlertDialogContent className="w-full max-w-[700px] rounded-3xl p-0 max-h-[85vh] overflow-y-auto">
          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="font-poppins text-xl font-semibold text-[#181818]">
                Add New Delivery Address
              </h2>
              <AlertDialogCancel
                onClick={() => setIsDialogOpen(false)}
                className="border-none p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </AlertDialogCancel>
            </div>
            <AddressForm
              countries={countries}
              initialValues={emptyForm}
              onAddressCreated={handleAddressCreated}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

