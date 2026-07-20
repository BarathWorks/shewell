"use client";
import { Button } from "@repo/ui/src/@/components/button";
import AddPatient from "./edit-patient";
import { api } from "~/trpc/react";
import { useEffect, useState } from "react";
import DeletePatient from "./delete-patient-user-action";
import { useToast } from "@repo/ui/src/@/components/use-toast";
import AddNewPatient from "./add-new-patient";
import EditPatient from "./edit-patient";

interface IPatientInformation {
  id: string;
  firstName: string;
  phoneNumber: string;
  email: string;
}

interface IPatientInformationProps {
  // onSelectPatient: (patient: IPatientInformation) => void;
  onSelectPatient: (patient: IPatientProps) => void;
  isActive: boolean;
  onNextStep: () => void;
  timeDuration: number;
  defaultDuration: number;
  // defaultSelectedPatient: IPatientInformation
  defaultSelectedPatient: IPatientProps;
  onSelectFinalPrice: (priceInCents: number) => void;
  onSelectCouple: (value: boolean) => void;
  expertId: string;
  defaultCouple: boolean;
}

interface IPatientProps {
  id?: string;
  message?: string | null | undefined;
  firstName?: string;
  lastName?: string | null | undefined;
  phoneNumber?: string;
  email?: string;
  additionalPatients?: {
    firstName?: string;
    lastName?: string | undefined | null;
    phoneNumber?: string;
    message?: string | undefined | null;
    email?: string;
    id?: string;
    deletedAt?: string;
    patientId?: string | null;
  }[];
}

const PatientInformation = ({
  defaultSelectedPatient,
  defaultDuration,
  timeDuration,
  defaultCouple,
  onSelectPatient,
  onSelectFinalPrice,
  onSelectCouple,
  isActive,
  onNextStep,
  expertId,
}: IPatientInformationProps) => {
  // const [selectPatient, setSelectPatient] = useState<IPatientInformation>(
  //   defaultSelectedPatient
  // );
  const [selectPatient, setSelectPatient] = useState<IPatientProps | null>(
    defaultSelectedPatient,
  );
  const [isCouple, setIsCouple] = useState<boolean>(defaultCouple);
  const [openDialogEditPatient, setOpenDialogEditPatient] =
    useState<boolean>(false);
  const [openDialogAddNewPatient, setOpenDialogAddNewPatient] =
    useState<boolean>(false);

  const handleOnOpenDialogEditPatient = () => {
    setOpenDialogEditPatient(true);
  };

  const handleOnOpenDialogAddNewPatient = () => {
    setOpenDialogAddNewPatient(true);
  };

  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  // calling an api to fetch patient-info based on the login user (not used await db.patient.find bcoz component has to render in client component)
  const { data, refetch } = api.searchPatient.searchPatient.useQuery(
    {},
    {
      refetchOnWindowFocus: true,
      enabled: true,
    },
  );

  console.log(
    "defaultCouple",
    defaultCouple,
    data?.patient[0]?.firstName,
    data?.patient[0]?.additionalPatients[0]?.firstName,
  );
  const { data: priceForSinlgle, refetch: refetchPrice } =
    api.findPrice.findPrice.useQuery({
      duration: timeDuration || defaultDuration,
      expertId: expertId,
      // couple: defaultCouple
    });
  const { data: priceForCouple, refetch: refetchPriceForCouple } =
    api.findPriceForCouple.findPriceForCouple.useQuery({
      duration: timeDuration || defaultDuration,
      expertId: expertId,
      // couple: defaultCouple
    });

  useEffect(() => {
    (refetchPrice(), refetchPriceForCouple());
  }, [defaultCouple]);

  useEffect(() => {
    refetch();
  }, [defaultCouple]);

  useEffect(() => {
    if (data?.patient?.length === 1) {
      const singlePatient = data.patient[0];
      setSelectPatient(singlePatient!);
      onSelectPatient(singlePatient!);
      handleFinalPriceOnSelectingCouple(singlePatient!); // ← fix: also update couple flag & price
    }
  }, [data?.patient, onSelectPatient]);

  const handleSelectPatient = (patient: IPatientProps) => {
    setSelectPatient(patient);
    onSelectPatient(patient);
  };

  const handleFinalPriceOnSelectingCouple = (item: IPatientProps) => {
    if (item.additionalPatients.length > 0) {
      onSelectCouple(true);
      onSelectFinalPrice(priceForCouple?.price?.priceInCentsForCouple!);
    } else {
      onSelectCouple(false);
      onSelectFinalPrice(priceForSinlgle?.price?.priceInCentsForSingle!);
    }
  };

  useEffect(() => {
    if (defaultCouple === true) {
      if (priceForCouple?.price) {
        onSelectFinalPrice(priceForCouple.price.priceInCentsForCouple);
      }
    } else {
      if (priceForSinlgle?.price) {
        onSelectFinalPrice(priceForSinlgle.price.priceInCentsForSingle);
      }
    }
  }, [defaultCouple]);

  const { toast } = useToast();

  const handleDeletePatient = (patientId: string) => {
    DeletePatient({ patientId })
      .then((resp) => {
        setSelectPatient(null);
        toast({
          title: resp?.message,
          variant: "default",
        });
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: err.message,
        });
      });
  };

  useEffect(() => {
    setIsCouple(isCouple);
    onSelectCouple(isCouple);
  }, [isCouple]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-1.5 p-1 font-poppins lg:mb-8 2xl:mb-10">
        <div className="text-base font-bold text-[#0b1c30] sm:text-lg md:text-xl lg:text-2xl">
          For whom are you booking the appointment?
        </div>
        <div className="text-xs font-medium text-gray-500 sm:text-sm xl:text-base">
          Select the patient or couple for this session.
        </div>
      </div>

      <div
        className={`flex flex-col gap-3 p-1 sm:gap-4 ${data?.patient && data.patient.length > 2 ? "scrollbar-thin max-h-[400px] overflow-y-auto pr-2" : ""}`}
      >
        {data?.patient && data.patient.length > 0 ? (
          data.patient.map((item, index) => {
            const isSelected = selectPatient?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  handleSelectPatient(item);
                  handleFinalPriceOnSelectingCouple(item);
                }}
                className={`flex w-full cursor-pointer justify-between rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${
                  isSelected 
                    ? "border-[#00898F] bg-[#E1EBED]/60 shadow-md ring-1 ring-[#00898F]/20" 
                    : "border-gray-200 bg-white shadow-sm hover:border-[#00898F]/50 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border sm:h-5 sm:w-5 ${
                        isSelected ? "border-[#00898F]" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-[#00898F] sm:h-2.5 sm:w-2.5" />
                      )}
                    </div>

                    <div className="flex flex-col font-poppins">
                      <div className="text-sm font-bold text-[#0b1c30] sm:text-base lg:text-lg">
                        <span className="capitalize">{item.firstName}</span>
                        {item.additionalPatients.map((p) => (
                          <span key={p.id}> & {p.firstName}</span>
                        ))}
                      </div>

                      <div className="mt-1 flex flex-col gap-0.5 text-[11px] leading-tight text-[#0b1c30]/80 sm:gap-1 sm:text-sm lg:text-base">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#00898F]">
                            Mobile:
                          </span>
                          {item.phoneNumber}
                          {item.additionalPatients.map(
                            (p) => `, ${p.phoneNumber}`,
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-[#00898F]">
                            Email:
                          </span>
                          <span className="break-all">{item.email}</span>
                          {item.additionalPatients.map((p) => `, ${p.email}`)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-3 sm:gap-4">
                  <div
                    className={`rounded-full px-2.5 py-0.5 font-poppins text-[10px] font-bold uppercase tracking-wider sm:px-3 sm:py-1 sm:text-xs ${
                      item.additionalPatients.length > 0 
                        ? "bg-[#E1EBED]/60 text-[#00898F] border border-[#00898F]/15" 
                        : "bg-[#f1f3f5] text-[#495057] border border-gray-200"
                    }`}
                  >
                    {item.additionalPatients.length > 0 ? "Couple" : "Single"}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOnOpenDialogEditPatient();
                        setSelectedPatientId(item.id);
                      }}
                      className="rounded-full p-2 text-[#00898F] transition-colors hover:bg-[#E1EBED]"
                      title="Edit Patient"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 16.6665H17.5"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.75 2.91669C14.0815 2.58517 14.5312 2.39893 15 2.39893C15.2321 2.39893 15.462 2.44465 15.6765 2.53349C15.891 2.62233 16.0858 2.75254 16.25 2.91669C16.4142 3.08084 16.5444 3.27572 16.6332 3.4902C16.722 3.70467 16.7678 3.93455 16.7678 4.16669C16.7678 4.39884 16.722 4.62871 16.6332 4.84319C16.5444 5.05766 16.4142 5.25254 16.25 5.41669L5.83333 15.8334L2.5 16.6667L3.33333 13.3334L13.75 2.91669Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePatient(item.id);
                      }}
                      className="rounded-full p-2 text-[#DC2626] transition-colors hover:bg-red-50 hover:text-red-700"
                      title="Delete Patient"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.4453 2.98145H13.7598V2.44434C13.7598 1.55585 13.0369 0.833008 12.1484 0.833008H7.85156C6.96308 0.833008 6.24023 1.55585 6.24023 2.44434V2.98145H3.55469C2.6662 2.98145 1.94336 3.70429 1.94336 4.59277C1.94336 5.30634 2.40975 5.91267 3.05356 6.12393L4.01159 17.6888C4.08059 18.5173 4.78592 19.1663 5.61733 19.1663H14.3827C15.2141 19.1663 15.9194 18.5173 15.9885 17.6885L16.9464 6.12389C17.5902 5.91267 18.0566 5.30634 18.0566 4.59277C18.0566 3.70429 17.3338 2.98145 16.4453 2.98145ZM7.31445 2.44434C7.31445 2.14817 7.5554 1.90723 7.85156 1.90723H12.1484C12.4446 1.90723 12.6855 2.14817 12.6855 2.44434V2.98145H7.31445V2.44434ZM14.9179 17.5996C14.8949 17.8758 14.6598 18.0921 14.3827 18.0921H5.61733C5.34022 18.0921 5.10511 17.8758 5.08215 17.5999L4.13813 6.2041H15.8619L14.9179 17.5996ZM16.4453 5.12988H3.55469C3.25853 5.12988 3.01758 4.88894 3.01758 4.59277C3.01758 4.29661 3.25853 4.05566 3.55469 4.05566H16.4453C16.7415 4.05566 16.9824 4.29661 16.9824 4.59277C16.9824 4.88894 16.7415 5.12988 16.4453 5.12988Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#c0c8cc]/60 rounded-2xl bg-[#E1EBED]/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E1EBED]/60 flex items-center justify-center text-[#00898F]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="17" y1="11" x2="23" y2="11"/>
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0b1c30]">No patients registered</h3>
              <p className="text-xs text-gray-500 max-w-[280px]">Please add your profile details or a family member to register for the session.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mt-10">
        <div
          onClick={() => handleOnOpenDialogAddNewPatient()}
          className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-[#00898F] bg-white px-6 font-poppins text-sm font-bold text-[#00898F] transition-all hover:bg-[#E1EBED]/60 hover:shadow-sm active:scale-[0.98] sm:h-12 sm:px-8 md:h-auto md:py-3"
        >
          + Add New Patient
        </div>
        <Button
          className="h-11 rounded-xl bg-[#00898F] px-10 font-poppins text-sm font-bold text-white shadow-md transition-all hover:bg-[#006e72] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 sm:h-12 sm:px-12 md:h-auto md:py-3"
          onClick={onNextStep}
          disabled={!selectPatient}
        >
          Next
        </Button>
      </div>

      <EditPatient
        patientId={selectedPatientId!}
        onOpenChange={setOpenDialogEditPatient}
        open={openDialogEditPatient}
        setIsCouple={setIsCouple}
      />
      <AddNewPatient
        onOpenChange={setOpenDialogAddNewPatient}
        open={openDialogAddNewPatient}
      />
    </>
  );
};
export default PatientInformation;
