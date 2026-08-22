"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/src/@/components/table";
import { Briefcase, GraduationCap, User } from "lucide-react";

interface IExperienceProps {
  startingYear: string;
  endingYear: string;
  department: string;
  position: string;
  location: string;
}
interface IDegree {
  degree: string;
}
interface IDoctorProps {
  degrees: IDegree[];
  experience: IExperienceProps[];
  aboutYou: string;
  aboutEducation: string;
}
const AboutDoctor = ({
  degrees,
  experience,
  aboutYou,
  aboutEducation,
}: IDoctorProps) => {
  return (
    <>
      <div className="flex flex-col gap-[18px] md:gap-[30px] xl:gap-[40px]">
        {/* about-me */}
        <div className="flex flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-2 border-b-[2px] border-hairline pb-2">
            <User className="h-5 w-5 text-primary-700 md:h-6 md:w-6" />
            <h3 className="font-poppins text-lg font-semibold text-ink md:text-xl xl:text-2xl">
              About me:
            </h3>
          </div>
          <div className="pl-4 text-justify font-inter text-sm font-normal leading-relaxed text-muted md:text-base">
            {aboutYou}
          </div>
        </div>

        {/* education */}
        <div className="flex flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-2 border-b-[2px] border-hairline pb-2">
            <GraduationCap className="h-5 w-5 text-primary-700 md:h-6 md:w-6" />
            <h3 className="font-poppins text-lg font-semibold text-ink md:text-xl xl:text-2xl">
              Education:
            </h3>
          </div>
          {aboutEducation && (
            <div className="pl-4 text-justify font-inter text-sm font-normal leading-relaxed text-muted md:text-base">
              {aboutEducation}
            </div>
          )}
          {/* education-table */}
          <div className="mt-2 overflow-hidden rounded-xl border border-hairline">
            <Table>
              <TableHeader className="bg-primary-600/5">
                <TableRow className="border-b-gray-100 hover:bg-primary-600/5">
                  <TableHead className="w-[100px] py-3 pl-6 font-inter text-base font-semibold text-primary-700">
                    Degree
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {degrees &&
                  degrees.map((item) => (
                    <TableRow
                      key={item.degree}
                      className="border-b-gray-50 hover:bg-gray-50"
                    >
                      <TableCell className="py-3 pl-6 font-inter text-sm font-medium text-ink md:text-base">
                        {item.degree}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* experience */}
        <div className="flex flex-col gap-2 md:gap-4">
          <div className="flex items-center gap-2 border-b-[2px] border-hairline pb-2">
            <Briefcase className="h-5 w-5 text-primary-700 md:h-6 md:w-6" />
            <h3 className="font-poppins text-lg font-semibold text-ink md:text-xl xl:text-2xl">
              Experience:
            </h3>
          </div>

          <div className="mt-2 overflow-hidden rounded-xl border border-hairline">
            <Table>
              <TableHeader className="bg-primary-600/5">
                <TableRow className="border-b-gray-100 hover:bg-primary-600/5">
                  <TableHead className="w-[100px] py-3 pl-6 font-inter text-base font-semibold text-primary-700">
                    Year
                  </TableHead>
                  <TableHead className="w-[150px] py-3 pl-4 font-inter text-base font-semibold text-primary-700">
                    Department
                  </TableHead>
                  <TableHead className="w-[150px] py-3 pl-4 font-inter text-base font-semibold text-primary-700">
                    Position
                  </TableHead>
                  <TableHead className="w-[150px] py-3 pl-4 font-inter text-base font-semibold text-primary-700">
                    Location
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experience.map((item) => (
                  <TableRow
                    className="border-b-gray-50 hover:bg-gray-50"
                    key={item.startingYear}
                  >
                    <TableCell className="py-3 pl-6 font-inter text-sm font-medium text-ink md:text-base">
                      {item.startingYear}-{item.endingYear}
                    </TableCell>
                    <TableCell className="py-3 pl-4 font-inter text-sm font-normal text-muted md:text-base">
                      {item.department}
                    </TableCell>
                    <TableCell className="py-3 pl-4 font-inter text-sm font-normal text-muted md:text-base">
                      {item.position}
                    </TableCell>
                    <TableCell className="py-3 pl-4 font-inter text-sm font-normal text-muted md:text-base">
                      {item.location}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};
export default AboutDoctor;
