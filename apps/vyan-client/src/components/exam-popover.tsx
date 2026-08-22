import { Button } from "@repo/ui/src/@/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/src/@/components/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/src/@/components/dialog";

const ExamplePopover = () => {
  return (
    <>
      <div className="container mx-auto flex items-center justify-center py-5 ">
        <Dialog>
          <DialogTrigger>Add Address</DialogTrigger>
          <DialogContent className="max-w-full bg-slate-500">
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                <div className="mt-5 flex flex-col w-full justify-between gap-5">
                  <div  className="mt-5 flex w-full justify-between gap-5">
                  <div className="flex w-full flex-col">
                    <label
                      htmlFor="purityLevel"
                      className="text-secoundary block text-sm font-medium leading-6 2xl:text-base"
                    >
                      Purity Level
                    </label>
                    <div className="mt-2">
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <button
                            type="button"
                            role="combobox"
                            aria-controls="radix-:r28:"
                            aria-expanded="false"
                            aria-autocomplete="none"
                            dir="ltr"
                            data-state="closed"
                            data-placeholder=""
                            className="ring-stepcolor flex w-full items-center justify-between rounded-md border-hairline-strong p-4 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-slate-300 focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6"
                          >
                            <span>Purity Level</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="h-4 w-4 opacity-50"
                              aria-hidden="true"
                            >
                              <path d="m6 9 6 6 6-6"></path>
                            </svg>
                          </button>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex w-full flex-col">
                    <label
                      htmlFor="fuelcolour"
                      className="text-secoundary block text-sm font-medium leading-6 2xl:text-base"
                    >
                      Fuel Colour
                    </label>
                    <div className="mt-2">
                    <Select>
                        <SelectTrigger className="w-[180px]">
                        <button
                        type="button"
                        role="combobox"
                        aria-controls="radix-:r29:"
                        aria-expanded="false"
                        aria-autocomplete="none"
                        dir="ltr"
                        data-state="closed"
                        data-placeholder=""
                        className="ring-stepcolor text-secoundary focus:text-secoundary flex h-auto w-full items-center justify-between rounded-md border-hairline-strong p-4 placeholder-[#CCCCCC] shadow-sm ring-1 ring-inset placeholder:text-slate-300 focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6"
                      >
                        <span>Fuel Colour</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="h-4 w-4 opacity-50"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      
                    </div>
                  </div>
                  <div className="flex w-full flex-col">
                    <label
                      htmlFor="weight"
                      className="text-secoundary block text-sm font-medium leading-6 2xl:text-base"
                    >
                      Weight
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        className="ring-stepcolor block w-full rounded-md border-hairline-strong p-4 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-slate-300 focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6"
                        id="weight"
                        placeholder="Weight"
                        name="fuelWeight"
                        value=""
                      />
                    </div>
                  </div>
                  <div className="flex w-full flex-col">
                    <label
                      htmlFor="weightunit"
                      className="text-secoundary block text-sm font-medium leading-6 2xl:text-base"
                    >
                      Weight Unit
                    </label>
                    <div className="mt-2">
                    <Select>
                        <SelectTrigger className="w-[180px]">
                        <button
                        type="button"
                        role="combobox"
                        aria-controls="radix-:r2a:"
                        aria-expanded="false"
                        aria-autocomplete="none"
                        dir="ltr"
                        data-state="closed"
                        data-placeholder=""
                        className="ring-stepcolor placeholde-[#CCCCCC] text-secoundary focus:text-secoundary flex h-auto w-full items-center justify-between rounded-md border-hairline-strong p-4 shadow-sm ring-1 ring-inset placeholder:text-slate-300 focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6"
                      >
                        <span>Weight Unit</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="h-4 w-4 opacity-50"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      
                    </div>
                  </div>
                  </div>
                 <div className="mt-5 flex w-full justify-between gap-5">
                     <div className="flex w-full flex-col">
                    <label
                      htmlFor="purityLevel"
                      className="text-secoundary block text-sm font-medium leading-6 2xl:text-base"
                    >
                      Purity Level
                    </label>
                    <div className="mt-2">
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <button
                            type="button"
                            role="combobox"
                            aria-controls="radix-:r28:"
                            aria-expanded="false"
                            aria-autocomplete="none"
                            dir="ltr"
                            data-state="closed"
                            data-placeholder=""
                            className="ring-stepcolor flex w-full items-center justify-between rounded-md border-hairline-strong p-4 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-slate-300 focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6"
                          >
                            <span>Purity Level</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="h-4 w-4 opacity-50"
                              aria-hidden="true"
                            >
                              <path d="m6 9 6 6 6-6"></path>
                            </svg>
                          </button>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex w-full flex-col">
                    <label
                      htmlFor="fuelcolour"
                      className="text-secoundary block text-sm font-medium leading-6 2xl:text-base"
                    >
                      Fuel Colour
                    </label>
                    <div className="mt-2">
                    <Select>
                        <SelectTrigger className="w-[180px]">
                        <button
                        type="button"
                        role="combobox"
                        aria-controls="radix-:r29:"
                        aria-expanded="false"
                        aria-autocomplete="none"
                        dir="ltr"
                        data-state="closed"
                        data-placeholder=""
                        className="ring-stepcolor text-secoundary focus:text-secoundary flex h-auto w-full items-center justify-between rounded-md border-hairline-strong p-4 placeholder-[#CCCCCC] shadow-sm ring-1 ring-inset placeholder:text-slate-300 focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6"
                      >
                        <span>Fuel Colour</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="h-4 w-4 opacity-50"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      
                    </div>
                  </div>
                  <div className="flex w-full flex-col">
                    <label
                      htmlFor="weight"
                      className="text-secoundary block text-sm font-medium leading-6 2xl:text-base"
                    >
                      Weight
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        className="ring-stepcolor block w-full rounded-md border-hairline-strong p-4 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-slate-300 focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6"
                        id="weight"
                        placeholder="Weight"
                        name="fuelWeight"
                        value=""
                      />
                    </div>
                  </div>
                  <div className="flex w-full flex-col">
                    <label
                      htmlFor="weightunit"
                      className="text-secoundary block text-sm font-medium leading-6 2xl:text-base"
                    >
                      Weight Unit
                    </label>
                    <div className="mt-2">
                    <Select>
                        <SelectTrigger className="w-[180px]">
                        <button
                        type="button"
                        role="combobox"
                        aria-controls="radix-:r2a:"
                        aria-expanded="false"
                        aria-autocomplete="none"
                        dir="ltr"
                        data-state="closed"
                        data-placeholder=""
                        className="ring-stepcolor placeholde-[#CCCCCC] text-secoundary focus:text-secoundary flex h-auto w-full items-center justify-between rounded-md border-hairline-strong p-4 shadow-sm ring-1 ring-inset placeholder:text-slate-300 focus:ring-1 focus:ring-primary sm:text-sm sm:leading-6"
                      >
                        <span>Weight Unit</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          className="h-4 w-4 opacity-50"
                          aria-hidden="true"
                        >
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </button>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      
                    </div>
                  </div>
                 </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
export default ExamplePopover;

{
  /* <Popover>
            <PopoverTrigger>
              <Button>Add Address</Button>
            </PopoverTrigger>
            <PopoverContent>
              <Select>
                <SelectTrigger classNameName="w-[180px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent classNameName="bg-white">
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover> */
}
