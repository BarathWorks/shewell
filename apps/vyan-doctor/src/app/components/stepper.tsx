// import { useState } from 'react';
// import { Stepper, Step } from 'react-form-stepper';

// function UserDetails() {
//     return <h2>User details</h2>;
//   }
  
//   function Payment() {
//     return <h2>Payment information</h2>;
//   }
  
//   function Confirmation() {
//     return <h2>Booking is confirmed</h2>;
//   }

// function SignUpStepper(props:any) {
//  const [ activeStep, setActiveStep ] = useState(0);

//  const steps = [
//     { label: 'User details' },
//     { label: 'Payment' },
//     { label: 'Booking confirmation' },
//   ];

//   function getSectionComponent() {
//     switch(activeStep) {
//       case 0: return <UserDetails/>;
//       case 1: return <Payment/>;
//       case 2: return <Confirmation/>;
//       default: return null;
//     }
//   }

//   return (
//     <div >
//     <Stepper className='flex'
//     {...props}
//     connectorStateColors={true}
//       connectorStyleConfig={{
//         completedColor: "#008F4E",
//         activeColor: '#008F4E',
//         disabledColor: '#eee'
//       }}
//       styleConfig={{
//         activeBgColor: '#D2D2D2',
//         completedBgColor: '#008F4E',
//         inactiveBgColor: '#D2D2D2',
//         activeTextColor: '#000000',
//         completedTextColor: '#ffffff',
//         inactiveTextColor: '#444'
//       }}
//       steps={steps}
//       activeStep={activeStep}/>
//     <div style={{padding: '20px'}}>
//       { getSectionComponent()  }
//       { (activeStep !== 0 && activeStep !== steps.length - 1)
//           && <button onClick={ () => setActiveStep(activeStep - 1) }>Previous</button>
//       }
//       { activeStep !== steps.length - 1
//         && <button onClick={ () => setActiveStep(activeStep + 1) }>Next</button>
//       }
//     </div>
//   </div>
//   );
// }

// export default SignUpStepper;

// "use client";

// import React, { useState } from "react";
// import classNames from "classnames";
// import RegisterForm from "../auth/register/personal-information/register-form";
// import QualificationForm from "../auth/register/qualifications/qualification-form";
// import ModesForm from "../auth/register/modes/modes-form";
// import UploadForm from "../auth/register/uploads/upload-form";

// const StepperComponent = () => {
//   const [activeStep, setActiveStep] = useState(0);

  

//   const handleNext = () => {
//     setActiveStep((prevStep) => prevStep + 1);
//   };

//   const handleBack = () => {
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   return (
//     <div className="w-full max-w-4xl">
//       <div className="flex items-center justify-between mb-8">
//         {steps.map((step, index) => (
//           <div
//             key={step.label}
//             className={classNames("flex items-center", {
//               "text-primary font-medium": activeStep >= index,
//               "text-gray-400": activeStep < index,
//             })}
//           >
//             <div
//               className={classNames("w-8 h-8 rounded-full flex items-center justify-center mr-2", {
//                 "bg-primary text-white": activeStep >= index,
//                 "bg-gray-200 text-gray-400": activeStep < index,
//               })}
//             >
//               {index + 1}
//             </div>
//             <span>{step.label}</span>
//             {activeStep > index && (
//               <div className="w-12 h-1 bg-primary ml-4 rounded-full"></div>
//             )}
//           </div>
//         ))}
//       </div>

//       <div className="border-t border-hairline pt-8">
//         {steps[activeStep].component}

//         <div className="flex justify-end mt-8">
//           <button
//             className={classNames("px-4 py-2 rounded-md transition-colors", {
//               "bg-primary text-white hover:bg-primary-dark": activeStep < steps.length - 1,
//               "bg-gray-200 text-gray-400 cursor-not-allowed": activeStep === steps.length - 1,
//             })}
//             onClick={handleNext}
//             disabled={activeStep === steps.length - 1}
//           >
//             Next
//           </button>
//           {activeStep > 0 && (
//             <button
//               className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-800 ml-4"
//               onClick={handleBack}
//             >
//               Back
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StepperComponent;