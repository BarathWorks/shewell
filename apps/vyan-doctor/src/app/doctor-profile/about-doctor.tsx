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

/**
 * The About tab of a practitioner profile.
 *
 * Now that it sits inside a card with its own header, its section headings no
 * longer need to compete with a page title: they were `text-lg md:text-xl
 * xl:text-2xl` over a 2px teal rule, three of them stacked, which made the tab
 * read as three pages rather than one.
 *
 * Two substantive fixes:
 *  - **Every table row was keyed by a value that repeats.** Degrees keyed on
 *    `item.degree` and experience on `item.startingYear` — a practitioner with
 *    two roles beginning in the same year, or two qualifications with the same
 *    name, gave React duplicate keys and rows that reorder wrongly on update.
 *    Both are keyed by index-plus-content now.
 *  - **The experience table had no small-screen form.** Four columns at fixed
 *    `w-[150px]` inside a card meant the profile scrolled sideways on a phone.
 *    Below `sm` the same data renders as stacked rows; the table is used from
 *    `sm` up, and even then it scrolls inside its own container rather than
 *    taking the page with it.
 *
 * `text-justify` is gone for the same reason as on the policy pages: without
 * hyphenation it opens rivers of whitespace through the paragraph.
 *
 * It was also a client component with no state or handlers, and the shared
 * `Table` primitives it pulled in for two simple tables. Server component now.
 */

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-primary-600" />
      {children}
    </h3>
  );
}

const AboutDoctor = ({
  degrees,
  experience,
  aboutYou,
  aboutEducation,
}: IDoctorProps) => {
  return (
    <div className="flex flex-col gap-7">
      {/* About */}
      <section>
        <SectionHeading icon={User}>About</SectionHeading>
        <p className="mt-2.5 text-sm leading-relaxed text-body">
          {aboutYou || (
            <span className="text-muted">
              Nothing written yet. Add a bio from Edit profile so clients know
              how you work.
            </span>
          )}
        </p>
      </section>

      {/* Education */}
      <section>
        <SectionHeading icon={GraduationCap}>Education</SectionHeading>

        {aboutEducation ? (
          <p className="mt-2.5 text-sm leading-relaxed text-body">
            {aboutEducation}
          </p>
        ) : null}

        {degrees.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {degrees.map((item, index) => (
              <li
                key={`${item.degree}-${index}`}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-body ring-1 ring-inset ring-slate-200/70"
              >
                {item.degree}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2.5 text-sm text-muted">
            No qualifications listed yet.
          </p>
        )}
      </section>

      {/* Experience */}
      <section>
        <SectionHeading icon={Briefcase}>Experience</SectionHeading>

        {experience.length === 0 ? (
          <p className="mt-2.5 text-sm text-muted">
            No practice history listed yet.
          </p>
        ) : (
          <>
            {/* Below `sm`: stacked rows, so nothing scrolls sideways. */}
            <ul className="mt-3 flex flex-col gap-2 sm:hidden">
              {experience.map((item, index) => (
                <li
                  key={`${item.startingYear}-${item.position}-${index}`}
                  className="rounded-lg border border-hairline p-3.5"
                >
                  <p className="text-sm font-semibold text-ink">
                    {item.position}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{item.department}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span className="tabular">
                      {item.startingYear}&ndash;{item.endingYear}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span>{item.location}</span>
                  </p>
                </li>
              ))}
            </ul>

            {/* From `sm`: a table, scrolling inside its own container. */}
            <div className="mt-3 hidden overflow-x-auto rounded-lg border border-hairline sm:block">
              <table className="w-full min-w-[34rem] text-left">
                <thead className="bg-canvas">
                  <tr className="border-b border-hairline">
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-[0.09em] text-muted"
                    >
                      Years
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-[0.09em] text-muted"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-[0.09em] text-muted"
                    >
                      Department
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-2xs font-semibold uppercase tracking-[0.09em] text-muted"
                    >
                      Location
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-hairline">
                  {experience.map((item, index) => (
                    <tr
                      key={`${item.startingYear}-${item.position}-${index}`}
                      className="transition-colors duration-200 hover:bg-slate-50"
                    >
                      <td className="tabular whitespace-nowrap px-4 py-3 text-sm font-medium text-ink">
                        {item.startingYear}&ndash;{item.endingYear}
                      </td>
                      <td className="px-4 py-3 text-sm text-body">
                        {item.position}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {item.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {item.location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AboutDoctor;
