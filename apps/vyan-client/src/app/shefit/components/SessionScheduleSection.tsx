import { Badge } from "../../../../src/components/ui/badge";
import { Card, CardContent } from "../../../../src/components/ui/card";
import { InteractiveButton } from "../../../../src/components/ui/interactive-button";

const pricingPackages = [
  { title: "3-Month Package", price: "5,000", period: "All sessions" },
  { title: "Monthly Fee", price: "2,000", period: "Per month" },
  { title: "Flexible 1 on 1", price: "700", period: "Per Session" },
];

const eveningSessions = [
  {
    trimester: "For 3rd Trimester",
    days: "Monday to Friday",
    time: "6:00 AM - 7:00 AM",
  },
  {
    trimester: "For 3rd Trimester",
    days: "Monday to Friday",
    time: "6:00 AM - 7:00 AM",
  },
];

const morningSessions = [...eveningSessions];

const customSession = {
  trimester: "Tailored yoga experience",
  days: "Anytime",
  time: "Flexible!",
};

const sessionCardClasses = `
  group
  w-full
  bg-white
  rounded-2xl sm:rounded-3xl
  border-0
  transition-all duration-300 ease-out
  hover:shadow-lg
  hover:-translate-y-[2px]
  hover:outline
  hover:outline-2
  hover:outline-[#00898F]/30
`;

export const SessionScheduleSection = (): JSX.Element => {
  return (
    <section className="px-4 sm:px-8 md:px-12 lg:px-24 xl:px-[200px] pb-[150px] flex flex-col gap-[120px] w-full">

      {/* HEADER */}
      <header className="flex flex-col items-center gap-3">
        <h2 className="font-poppins text-center font-medium text-[#333] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          Flow When Your Body Feels Ready
        </h2>

        <p className="font-poppins text-center font-medium text-muted text-sm sm:text-base md:text-xl lg:text-2xl max-w-4xl">
          Whether it's sunrise stillness or moonlight calm — we offer sessions
          that meet your rhythm, not the clock.
        </p>
      </header>

      {/* PRICING */}
      <div className="flex flex-col sm:flex-row gap-6">
        {pricingPackages.map((pkg, i) => (
          <Card key={i} className="flex-1 rounded-3xl border-2 border-[#00000066]">
            <CardContent className="p-6 flex flex-col gap-4">
              <h3 className="font-poppins text-muted text-xl">{pkg.title}</h3>
              <div className="flex items-end gap-2">
                <span className="font-poppins text-4xl font-semibold text-muted">₹</span>
                <span className="font-poppins text-4xl font-semibold text-[#000000b2]">{pkg.price}</span>
                <span className="font-poppins text-muted">{pkg.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* EVENING */}
      <Card className="bg-primary-50 rounded-3xl border-0">
        <CardContent className="p-10 flex flex-col gap-10">
          <div className="flex justify-between items-center">
            <h3 className="font-poppins text-[40px] font-medium">Evening sessions</h3>
            <Badge className="bg-slate-100 rounded-full px-6 py-2">
              <div className="w-3 h-3 bg-[#5bb600] rounded-md mr-2 inline-block" />
              Group sessions
            </Badge>
          </div>

          {eveningSessions.map((s, i) => (
            <Card key={i} className={sessionCardClasses}>
              <CardContent className="flex justify-between items-center p-6 hover:bg-primary-600 transition-colors duration-300 ease-in-out rounded-2xl sm:rounded-3xl hover:text-white">
                <div className="flex flex-col gap-4">
                  <h4 className="font-poppins text-muted  text-lg group-hover:text-white">{s.trimester}</h4>
                  <p className="font-poppins text-body group-hover:text-white">{s.days}</p>
                  <p className="font-poppins text-2xl font-semibold group-hover:text-white">{s.time}</p>
                </div>

                <InteractiveButton />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* MORNING */}
      <Card className="bg-primary-50 rounded-3xl border-0 ">
        <CardContent className="p-10 flex flex-col gap-10">
          <div className="flex justify-between items-center">
            <h3 className="font-poppins text-[40px] font-medium">Morning sessions</h3>
            <Badge className="bg-slate-100 rounded-full px-6 py-2">
              <div className="w-3 h-3 bg-[#5bb600] rounded-md mr-2 inline-block" />
              Group sessions
            </Badge>
          </div>

          {morningSessions.map((s, i) => (
            <Card key={i} className={sessionCardClasses}>
              <CardContent className="flex justify-between items-center p-6 hover:bg-primary-600 transition-colors duration-300 ease-in-out rounded-2xl sm:rounded-3xl hover:text-white">
                <div className="flex flex-col gap-4">
                  <h4 className="font-poppins text-muted text-lg group-hover:text-white">{s.trimester}</h4>
                  <p className="font-poppins text-body group-hover:text-white">{s.days}</p>
                  <p className="font-poppins text-2xl font-semibold group-hover:text-white">{s.time}</p>
                </div>

                <InteractiveButton  />
              </CardContent> 
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* CUSTOM */}
      <Card className="bg-primary-50 rounded-3xl border-0">
        <CardContent className="p-10 flex flex-col gap-8">
          <h3 className="font-poppins text-[40px] font-medium">
            Custom Yoga, Anytime You Need It
          </h3>

          <p className="font-poppins text-xl">
            Book sessions around your own rhythm—your practice, your pace, your peace.
          </p>

          <Card className={sessionCardClasses}>
            <CardContent className="flex justify-between items-center p-6 hover:bg-primary-600 transition-colors duration-300 ease-in-out rounded-2xl sm:rounded-3xl hover:text-white">
              <div className="flex flex-col gap-4">
                <h4 className="font-poppins text-muted text-lg group-hover:text-white">{customSession.trimester}</h4>
                <p className="font-poppins text-body group-hover:text-white">{customSession.days}</p>
                <p className="font-poppins text-2xl font-semibold group-hover:text-white">{customSession.time}</p>
              </div>

              <InteractiveButton />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  );
};