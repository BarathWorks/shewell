import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const socialLinks = [
  { icon: "/link.svg", label: "Quick links" },
  { icon: "/link-2.svg", label: "Quick links" },
  { icon: "/link-1.svg", label: "Quick links" },
  { icon: "/link-3.svg", label: "Quick links" },
];

const quickLinks = ["About Us", "Blog", "Recipe", "Reviews"];

const counsellingLinks = [
  "Phycology",
  "Nutritious",
  "Mental Health",
  "New Born Child",
];

const serviceLinks = ["Pregnancies", "Child Health", "Prenatal", "Postnatal"];

const contactInfo = [
  "123 colony Gurgram, Haryana- 122001",
  "abcdvyan@gmail.com",
  "+91-1234567890",
];

export const FooterSection = (): JSX.Element => {
  return (
    <footer className="flex flex-col items-center justify-center gap-12 sm:gap-16 md:gap-24 lg:gap-[140px] pt-12 sm:pt-16 md:pt-24 lg:pt-[100px] pb-4 sm:pb-6 px-4 sm:px-8 md:px-12 lg:px-20 w-full bg-[#272727]">
      <div className="flex flex-col lg:flex-row items-start gap-8 sm:gap-12 lg:gap-[200px] w-full">
        <div className="inline-flex flex-col items-start justify-between gap-8 sm:gap-12 w-full lg:w-auto">
          <div className="relative w-[280px] sm:w-[380px] lg:w-[534px] h-[78px] sm:h-[110px] lg:h-[149px]">
            <img
              className="top-[22px] sm:top-[30px] lg:top-[41px] w-[49px] sm:w-[70px] lg:w-[94px] h-[52px] sm:h-[73px] lg:h-[99px] absolute left-0"
              alt="Vector"
              src="/vector.svg"
            />
            <div className="-top-4 sm:-top-6 lg:-top-8 left-[51px] sm:left-[73px] lg:left-[98px] text-[75px] sm:text-[105px] lg:text-[143.1px] absolute [font-family:'Agbalumo',Helvetica] font-normal text-white tracking-[0] leading-[normal]">
              hewell
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-12 w-full">
            {socialLinks.map((link, index) => (
              <div key={index} className="inline-flex items-center gap-2 sm:gap-3 lg:gap-4">
                <img className="w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9" alt="Link" src={link.icon} />
                <div className="hidden sm:block [font-family:'Poppins',Helvetica] font-extralight text-white text-sm sm:text-base lg:text-xl tracking-[0] leading-6 whitespace-nowrap">
                  {link.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 sm:gap-6 pl-0 pr-0 lg:pr-10 py-0 flex-1 w-full">
          <div className="[font-family:'Poppins',Helvetica] font-extralight text-white text-2xl sm:text-3xl lg:text-[40px] tracking-[0] leading-tight lg:leading-[normal]">
            Join for Pregnancy &amp; Wellness Updates
          </div>

          <div className="flex flex-col items-start gap-4 sm:gap-6 w-full">
            <div className="flex flex-col items-start gap-2 sm:gap-4 w-full">
              <Label className="[font-family:'Poppins',Helvetica] font-normal text-sm sm:text-base tracking-[0] leading-5 whitespace-nowrap">
                <span className="text-white">First name</span>
                <span className="text-danger-600">*</span>
              </Label>
              <Input className="w-full h-12 sm:h-14 bg-slate-50 rounded-lg border border-solid border-hairline" />
            </div>

            <div className="flex flex-col items-start gap-2 sm:gap-4 w-full">
              <Label className="[font-family:'Poppins',Helvetica] font-normal text-sm sm:text-base tracking-[0] leading-5 whitespace-nowrap">
                <span className="text-white">Email</span>
                <span className="text-danger-600">*</span>
              </Label>
              <Input className="w-full h-12 sm:h-14 bg-slate-50 rounded-lg border border-solid border-hairline" />
            </div>

            <Button className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3 sm:py-4 bg-primary-600 rounded-xl sm:rounded-2xl hover:bg-primary-600/90">
              <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm sm:text-base text-center tracking-[0] leading-3 whitespace-nowrap">
                Subscribe
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 w-full">
        <div className="inline-flex flex-col items-start gap-4 sm:gap-6 lg:gap-8">
          <div className="inline-flex items-center justify-center gap-2.5">
            <div className="[font-family:'Poppins',Helvetica] font-extralight text-white text-2xl sm:text-3xl lg:text-[40px] tracking-[0] leading-6 whitespace-nowrap">
              Quick links
            </div>
          </div>

          <div className="inline-flex flex-col items-start gap-3 sm:gap-4 lg:gap-6">
            {quickLinks.map((link, index) => (
              <div
                key={index}
                className="[font-family:'Poppins',Helvetica] font-normal text-white text-base sm:text-lg lg:text-2xl tracking-[0] leading-5 whitespace-nowrap cursor-pointer hover:text-primary-700 transition-colors"
              >
                {link}
              </div>
            ))}
          </div>
        </div>

        <div className="inline-flex flex-col items-start gap-4 sm:gap-6 lg:gap-8">
          <div className="[font-family:'Poppins',Helvetica] font-extralight text-white text-2xl sm:text-3xl lg:text-[40px] tracking-[0] leading-6 whitespace-nowrap">
            Counselling
          </div>

          <div className="inline-flex flex-col items-start gap-3 sm:gap-4 lg:gap-6">
            {counsellingLinks.map((link, index) => (
              <div
                key={index}
                className="[font-family:'Poppins',Helvetica] font-normal text-white text-base sm:text-lg lg:text-2xl tracking-[0] leading-5 whitespace-nowrap cursor-pointer hover:text-primary-700 transition-colors"
              >
                {link}
              </div>
            ))}
          </div>
        </div>

        <div className="inline-flex flex-col items-start gap-4 sm:gap-6 lg:gap-8">
          <div className="[font-family:'Poppins',Helvetica] font-extralight text-white text-2xl sm:text-3xl lg:text-[40px] tracking-[0] leading-6 whitespace-nowrap">
            Service
          </div>

          <div className="inline-flex flex-col items-start gap-3 sm:gap-4 lg:gap-6">
            {serviceLinks.map((link, index) => (
              <div
                key={index}
                className="[font-family:'Poppins',Helvetica] font-normal text-white text-base sm:text-lg lg:text-2xl tracking-[0] leading-5 whitespace-nowrap cursor-pointer hover:text-primary-700 transition-colors"
              >
                {link}
              </div>
            ))}
          </div>
        </div>

        <div className="inline-flex flex-col items-start gap-4 sm:gap-6 lg:gap-8">
          <div className="[font-family:'Poppins',Helvetica] font-extralight text-white text-2xl sm:text-3xl lg:text-[40px] tracking-[0] leading-6 whitespace-nowrap">
            Contact
          </div>

          <div className="inline-flex flex-col items-start gap-3 sm:gap-4 lg:gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="[font-family:'Poppins',Helvetica] font-normal text-white text-base sm:text-lg lg:text-2xl tracking-[0] leading-5 break-words"
              >
                {info}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 lg:gap-[100px]">
          <div className="inline-flex items-center justify-center gap-2.5">
            <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-xs sm:text-sm lg:text-base leading-6 whitespace-nowrap tracking-[0]">
              Terms &amp; Conditions
            </div>
          </div>

          <div className="inline-flex items-center justify-center gap-2.5">
            <div className="[font-family:'Inter',Helvetica] font-normal text-white text-xs sm:text-sm lg:text-base leading-6 whitespace-nowrap tracking-[0]">
              Privacy Polices
            </div>
          </div>

          <div className="inline-flex items-center justify-center gap-2.5">
            <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-xs sm:text-sm lg:text-base leading-6 whitespace-nowrap tracking-[0]">
              2023, All Rights Reserved
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2.5">
          <div className="[font-family:'Inter',Helvetica] font-normal text-xs sm:text-sm lg:text-base tracking-[0] leading-6 whitespace-nowrap">
            <span className="text-white">Designed By </span>
            <span className="font-medium text-primary-700">Thebrandopedia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
