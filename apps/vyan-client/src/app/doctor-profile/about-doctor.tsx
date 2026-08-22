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

interface IExperienceProps {
  startingYear : string;
  endingYear : string;
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
        <div className="flex flex-col gap-2 md:gap-5 xl:gap-6 2xl:gap-7">
          <h3 className="  border-b-[2px] border-secondary pb-1 font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px]">
            About me:
          </h3>
          <div className="text-justify font-inter text-xs font-normal text-inactive md:text-base pl-4">
            {aboutYou}
          </div>
        </div>
        {/* education */}
        <div className="flex flex-col gap-2 md:gap-5 xl:gap-6 2xl:gap-7">
          <h3 className=" border-b-[2px] border-secondary pb-1 font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px]">
            Education:
          </h3>
          {aboutEducation && (
            <div className="text-justify font-inter text-xs font-normal text-inactive md:text-base pl-4">
              {aboutEducation}
            </div>
          )}
          {/* education-table */}
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] rounded-t-lg bg-primary-200 py-2 pl-4 font-inter text-base font-semibold text-active">
                    Degree
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {degrees &&
                  degrees.map((item) => (
                    <TableRow key={item.degree}>
                      <TableCell className="py-2 pl-4 font-inter text-xs md:text-base font-normal text-inactive hover:bg-primary-50 hover:text-active ">
                        {item.degree}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* experience */}
        <div className="flex flex-col gap-2 md:gap-5 xl:gap-6 2xl:gap-7">
          <h3 className=" border-b-[2px] border-secondary pb-1 font-inter text-base font-semibold text-active md:text-[20px] md:leading-[30px] xl:text-2xl 2xl:text-[28px] 2xl:leading-[38px]">
            Experience:
          </h3>

          <Table>
            <TableHeader className=" bg-primary-200">
              <TableRow className="rounded-t-lg">
                <TableHead className="w-[100px]  py-2 pl-4 font-inter text-base font-semibold text-active">
                  Year
                </TableHead>
                <TableHead className="w-[100px]  py-2 pl-4 font-inter text-base font-semibold text-active">
                  Department
                </TableHead>
                <TableHead className="w-[100px]  py-2 pl-4 font-inter text-base font-semibold text-active">
                  Position
                </TableHead>
                <TableHead className="w-[100px]  py-2 pl-4 font-inter text-base font-semibold text-active">
                  Location
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experience.map((item) => (
                <TableRow
                  className="hover:bg-primary-50 hover:text-active "
                  key={item.startingYear}
                >
                  <TableCell className="py-2 pl-4 font-inter text-base font-normal text-inactive ">
                    {item.startingYear}-{item.endingYear}
                  </TableCell>
                  <TableCell className="py-2 pl-4 font-inter text-base font-normal text-inactive ">
                    {item.department}
                  </TableCell>
                  <TableCell className="py-2 pl-4 font-inter text-base font-normal text-inactive">
                    {item.position}
                  </TableCell>
                  <TableCell className="py-2 pl-4 font-inter text-base font-normal text-inactive ">
                    {item.location}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};
export default AboutDoctor;
