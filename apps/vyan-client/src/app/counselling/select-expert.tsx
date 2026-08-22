"use client";
import UIFormLabel from "@repo/ui/src/@/components/form/label";
import SelectFilter from "./select-filter";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@repo/ui/src/@/components/button";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

interface IDoctorDetails {
  id: string;
  firstName: string;
}

interface IDoctorProps {
  onSelectDoctor: (doctorDetails: IDoctorDetails) => void;
  isActive: boolean;
  onNextStep: () => void;
  defaultDoctorId: string;
  defaultSpecialisation: string;
  onSelectSpecialisation: (value: string) => void;
}

const SelectExpert = ({
  onSelectDoctor,
  isActive,
  onNextStep,
  defaultSpecialisation,
  defaultDoctorId,
  onSelectSpecialisation,
}: IDoctorProps) => {
  // const [selectedDoctorDetails, setSelectedDoctorDetails]=useState<IDoctorDetails>()
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(
    defaultDoctorId,
  );
  // state to store selected doctor based on the specialization

  // state to store specialization
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");
  const [languageIds, setLanguageIds] = useState<string[]>();

  // function to handle doctor selectiion
  const handleDoctorSelection = (
    // index: number,
    doctorDetails: IDoctorDetails,
  ) => {
    setSelectedDoctorId(doctorDetails.id);

    // calling the onSelectDoctor and passing the doctor details
    onSelectDoctor(doctorDetails);
  };

  const { data: selectedDoctorDetails } =
    api.findDoctorbasedOnDoctor.findDoctorbasedOnDoctorId.useQuery({
      doctorId: defaultDoctorId,
    });

  const StarDrawing = (
    <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
  );

  const customStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#00898F",
    inactiveFillColor: "#B5B5B5",
  };

  // fetching specialisations
  const { data } = api.searchSpecialization.searchSpecialization.useQuery();

  useEffect(() => {
    setSelectedSpecialization(defaultSpecialisation);
  }, [defaultSpecialisation]);

  // fetching expert data based on the selected specialisation
  const { data: expertData, error } = api.searchExpert.searchExpert.useQuery(
    { specialization: selectedSpecialization, languageIds: languageIds },
    // {
    //   enabled: !!selectedSpecialization, // Only run the query when a specialization is selected
    // },
  );

  // const { data: doctors } =
  //   api.findDoctorWithoutFilter.findDoctorWithoutFilter.useQuery();

  // transforming the data from {id, specialization} to {value, title} using map
  const transformData = data?.specializations.map((item) => ({
    value: item.id,
    title: item.specialization,
  }));

  // Handler for when specialization is changed
  const handleSpecializationChange = (selectedValue: string) => {
    setSelectedSpecialization(selectedValue);
    onSelectSpecialisation(selectedValue);
    // setSelectedDoctorId(null);
    // console.log("Selected Specialization:", selectedValue);
  };

  const handleLanguageChange = (value: string[]) => {
    setLanguageIds(value);
  };

  useEffect(() => {
    if (selectedDoctorDetails && selectedDoctorId === defaultDoctorId) {
      handleDoctorSelection({
        id: selectedDoctorDetails.professionalUser?.id!,
        firstName: selectedDoctorDetails.professionalUser?.firstName!,
      });
    }
  }, [selectedDoctorDetails, selectedDoctorId]);

  return (
    <div className="flex flex-col gap-3 rounded-md border-[1.5px] p-3 sm:gap-4 sm:p-4 md:p-5 lg:px-4 lg:py-[14px] xl:gap-4 xl:px-6 xl:py-5">
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 xl:flex-row xl:gap-4">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row xl:gap-4">
          <div className="w-full sm:w-auto">
            <SelectFilter
              defaultValue={defaultSpecialisation}
              Filter={transformData!}
              onSelectSpecialization={handleSpecializationChange}
              onSelectLanguage={handleLanguageChange}
            />
          </div>
          <div>
            {/* <UIFormLabel>Language</UIFormLabel> */}
            {/* <SelectFilter Filter={} /> */}
          </div>
        </div>
      </div>

      <div className="flex max-h-[260px] flex-col gap-3 overflow-y-auto sm:gap-4 md:max-h-[350px] lg:max-h-[400px]">
        {selectedDoctorId &&
          expertData?.experts
            .sort((a, b) => {
              // Place the selected doctor first
              if (a.id === selectedDoctorId) return -1;
              if (b.id === selectedDoctorId) return 1;
              return 0;
            })
            .map((doctor, index) => (
              <div
                key={index}
                className={`flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:gap-2 sm:p-4 md:gap-3 md:p-4 ${
                  selectedDoctorId === doctor.id
                    ? "border-primary"
                    : "border-hairline-strong"
                } xs:px-1`}
              >
                <input
                  type="radio"
                  checked={selectedDoctorId === doctor.id}
                  onChange={() =>
                    handleDoctorSelection({
                      id: doctor.id,
                      firstName: doctor.firstName!,
                    })
                  }
                  className="mt-1 sm:mt-2"
                />
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-3 md:gap-4 lg:gap-6 xl:gap-[40px]">
                  <div className="w-full self-center sm:w-[70px] md:w-[85px] lg:w-[95px]">
                    <div className="relative aspect-square">
                      <Image
                        src={
                          doctor.media?.fileUrl ||
                          "/images/fallback-user-profile.png"
                        }
                        alt="feature-card"
                        className="rounded-full object-cover"
                        fill={true}
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 sm:gap-3 xl:flex-row xl:gap-[40px] xl:self-center">
                    <div className="flex flex-col gap-1">
                      <div className="font-inter text-sm font-semibold sm:text-base md:text-lg lg:text-lg">
                        {doctor.firstName}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-1">
                        <div className="flex gap-1">
                          <div>
                            <Rating
                              className="inline"
                              readOnly={true}
                              style={{ maxWidth: 80 }}
                              value={Number(doctor.avgRating || "0")}
                              itemStyles={customStyles}
                            />
                          </div>
                          <div className="border-r border-primary pr-2 font-inter text-xs font-medium sm:text-sm">
                            {Number(doctor.avgRating || "0").toFixed(1)}
                          </div>
                        </div>
                        <div className="font-inter text-xs font-normal">
                          {doctor?.totalConsultations || 0} Consultation
                        </div>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto sm:self-center">
                      <Link
                        href={`/doctor-profile/${doctor.userName}`}
                        className="w-full"
                      >
                        <Button className="w-full rounded-md bg-black px-3 py-2 text-xs font-medium text-white hover:bg-black sm:w-auto sm:text-sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      <Button
        className="self-end rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary sm:px-6 sm:py-2 sm:text-base md:px-[30px]"
        onClick={onNextStep}
        disabled={!isActive}
      >
        Next
      </Button>
    </div>
  );
};

export default SelectExpert;
