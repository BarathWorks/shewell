"use client";
import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";
import { format } from "date-fns";
interface IdoctorReviews {
  doctorReview: {
    rating: number;
    // approved: boolean;
    review: string;
    createdAt: Date;
    bookAppointment: {
      user: {
        name: string;
      };
    };
  }[];
}
const DoctorReview = ({ doctorReview }: IdoctorReviews) => {
  console.log("doctor-Review", doctorReview);
  const totalAvgRating = doctorReview.reduce((accumulator, item) => {
    return accumulator + item.rating;
  }, 0);

  const length = doctorReview.length;

  const fiveRating = doctorReview.filter((r) => r.rating === 5).length;
  const fiveRatingPer = (fiveRating / length) * 100;
  // console.log("fiveRatingPerc", fiveRatingPer);

  const fourRating = doctorReview.filter((r) => r.rating === 4).length;
  const fourRatingPer = (fourRating / length) * 100;
  // console.log("fourRatingPer", fourRatingPer);

  const threeRating = doctorReview.filter((r) => r.rating === 3).length;
  const threeRatingPer = (threeRating / length) * 100;
  // console.log("threeRatingPer", threeRatingPer);

  const twoRating = doctorReview.filter((r) => r.rating === 2).length;
  const twoRatingPer = (twoRating / length) * 100;
  // console.log("twoeRatingPer", twoRatingPer);

  const oneRating = doctorReview.filter((r) => r.rating === 1).length;
  const oneRatingPer = (oneRating / length) * 100;
  // console.log("oneRating
  const StarDrawing = (
    <path d="M15.1533 1.24496C14.6395 0.359428 13.3607 0.359425 12.8468 1.24496L9.2281 7.48137C8.97427 7.91882 8.53553 8.21734 8.03545 8.29287L1.2537 9.31717C0.114654 9.48921 -0.284892 10.9274 0.602182 11.6623L5.6543 15.8479C6.12196 16.2354 6.34185 16.8465 6.22825 17.4431L4.90669 24.3833C4.69778 25.4804 5.8495 26.3328 6.8377 25.8125L13.2236 22.4501C13.7096 22.1941 14.2905 22.1941 14.7766 22.4501L21.1625 25.8125C22.1507 26.3328 23.3024 25.4804 23.0935 24.3833L21.7719 17.4431C21.6583 16.8465 21.8782 16.2354 22.3459 15.8479L27.398 11.6623C28.285 10.9274 27.8855 9.48921 26.7465 9.31717L19.9647 8.29287C19.4646 8.21734 19.0259 7.91882 18.7721 7.48137L15.1533 1.24496Z" />
  );
  const customStyles = {
    itemShapes: StarDrawing,
    activeFillColor: "#00898F",
  };

  return (
    <>
      {doctorReview.length > 0 ? (
        <div>
          <div className="flex w-full flex-col gap-2 px-[18px] lg:gap-3 xl:px-6">
            <div className="flex items-center gap-[5px]">
              <h4 className="3xl:text-3xl font-poppins text-sm font-medium md:text-lg lg:text-xl xl:text-2xl ">
                5
              </h4>
              <div>
                <svg
                  className="max-lg:h-4 max-lg:w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                >
                  <path
                    d="M9.21413 1.74764C9.7578 0.0743921 12.125 0.0743899 12.6687 1.74764L13.9014 5.54145C14.1445 6.28975 14.8418 6.79639 15.6286 6.79639H19.6177C21.377 6.79639 22.1085 9.04773 20.6852 10.0819L17.458 12.4266C16.8214 12.889 16.5551 13.7088 16.7982 14.4571L18.0309 18.2509C18.5746 19.9241 16.6595 21.3156 15.2361 20.2814L12.0089 17.9367C11.3724 17.4743 10.5104 17.4743 9.87389 17.9367L6.64669 20.2814C5.22334 21.3156 3.30823 19.9241 3.8519 18.2509L5.08458 14.4571C5.32772 13.7088 5.06137 12.889 4.42482 12.4266L1.19762 10.0819C-0.225732 9.04773 0.505773 6.79639 2.26513 6.79639H6.25418C7.04099 6.79639 7.73831 6.28975 7.98145 5.54145L9.21413 1.74764Z"
                    fill="#2AA952"
                  />
                </svg>
              </div>
              {/* <progress id="file" className="rounded-full" value={fiveRatingPer} max="100"></progress> */}
              <div
                className="rounded bg-primary py-1"
                style={{ width: `${fiveRatingPer}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-[5px]">
              <h4 className="3xl:text-3xl font-poppins text-sm font-medium md:text-lg lg:text-xl xl:text-2xl ">
                4
              </h4>
              <div>
                <svg
                  className="max-lg:h-4 max-lg:w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                >
                  <path
                    d="M9.21413 1.74764C9.7578 0.0743921 12.125 0.0743899 12.6687 1.74764L13.9014 5.54145C14.1445 6.28975 14.8418 6.79639 15.6286 6.79639H19.6177C21.377 6.79639 22.1085 9.04773 20.6852 10.0819L17.458 12.4266C16.8214 12.889 16.5551 13.7088 16.7982 14.4571L18.0309 18.2509C18.5746 19.9241 16.6595 21.3156 15.2361 20.2814L12.0089 17.9367C11.3724 17.4743 10.5104 17.4743 9.87389 17.9367L6.64669 20.2814C5.22334 21.3156 3.30823 19.9241 3.8519 18.2509L5.08458 14.4571C5.32772 13.7088 5.06137 12.889 4.42482 12.4266L1.19762 10.0819C-0.225732 9.04773 0.505773 6.79639 2.26513 6.79639H6.25418C7.04099 6.79639 7.73831 6.28975 7.98145 5.54145L9.21413 1.74764Z"
                    fill="#2AA952"
                  />
                </svg>
              </div>
              <div
                className="rounded bg-primary py-1"
                style={{ width: `${fourRatingPer}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-[5px]">
              <h4 className="3xl:text-3xl font-poppins text-sm font-medium md:text-lg lg:text-xl xl:text-2xl ">
                3
              </h4>
              <div>
                <svg
                  className="max-lg:h-4 max-lg:w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                >
                  <path
                    d="M9.21413 1.74764C9.7578 0.0743921 12.125 0.0743899 12.6687 1.74764L13.9014 5.54145C14.1445 6.28975 14.8418 6.79639 15.6286 6.79639H19.6177C21.377 6.79639 22.1085 9.04773 20.6852 10.0819L17.458 12.4266C16.8214 12.889 16.5551 13.7088 16.7982 14.4571L18.0309 18.2509C18.5746 19.9241 16.6595 21.3156 15.2361 20.2814L12.0089 17.9367C11.3724 17.4743 10.5104 17.4743 9.87389 17.9367L6.64669 20.2814C5.22334 21.3156 3.30823 19.9241 3.8519 18.2509L5.08458 14.4571C5.32772 13.7088 5.06137 12.889 4.42482 12.4266L1.19762 10.0819C-0.225732 9.04773 0.505773 6.79639 2.26513 6.79639H6.25418C7.04099 6.79639 7.73831 6.28975 7.98145 5.54145L9.21413 1.74764Z"
                    fill="#2AA952"
                  />
                </svg>
              </div>
              <div
                className="rounded bg-primary py-1"
                style={{ width: `${threeRatingPer}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-[5px]">
              <h4 className="3xl:text-3xl font-poppins text-sm font-medium md:text-lg lg:text-xl xl:text-2xl ">
                2
              </h4>
              <div>
                <svg
                  className="max-lg:h-4 max-lg:w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                >
                  <path
                    d="M9.21413 1.74764C9.7578 0.0743921 12.125 0.0743899 12.6687 1.74764L13.9014 5.54145C14.1445 6.28975 14.8418 6.79639 15.6286 6.79639H19.6177C21.377 6.79639 22.1085 9.04773 20.6852 10.0819L17.458 12.4266C16.8214 12.889 16.5551 13.7088 16.7982 14.4571L18.0309 18.2509C18.5746 19.9241 16.6595 21.3156 15.2361 20.2814L12.0089 17.9367C11.3724 17.4743 10.5104 17.4743 9.87389 17.9367L6.64669 20.2814C5.22334 21.3156 3.30823 19.9241 3.8519 18.2509L5.08458 14.4571C5.32772 13.7088 5.06137 12.889 4.42482 12.4266L1.19762 10.0819C-0.225732 9.04773 0.505773 6.79639 2.26513 6.79639H6.25418C7.04099 6.79639 7.73831 6.28975 7.98145 5.54145L9.21413 1.74764Z"
                    fill="#2AA952"
                  />
                </svg>
              </div>
              <div
                className="rounded bg-primary py-1"
                style={{ width: `${twoRatingPer}%` }}
              ></div>
            </div>

            <div className="flex items-center gap-[5px]">
              <h4 className="3xl:text-3xl font-poppins text-sm font-medium md:text-lg lg:text-xl xl:text-2xl ">
                1
              </h4>
              <div>
                <svg
                  className="max-lg:h-4 max-lg:w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                >
                  <path
                    d="M9.21413 1.74764C9.7578 0.0743921 12.125 0.0743899 12.6687 1.74764L13.9014 5.54145C14.1445 6.28975 14.8418 6.79639 15.6286 6.79639H19.6177C21.377 6.79639 22.1085 9.04773 20.6852 10.0819L17.458 12.4266C16.8214 12.889 16.5551 13.7088 16.7982 14.4571L18.0309 18.2509C18.5746 19.9241 16.6595 21.3156 15.2361 20.2814L12.0089 17.9367C11.3724 17.4743 10.5104 17.4743 9.87389 17.9367L6.64669 20.2814C5.22334 21.3156 3.30823 19.9241 3.8519 18.2509L5.08458 14.4571C5.32772 13.7088 5.06137 12.889 4.42482 12.4266L1.19762 10.0819C-0.225732 9.04773 0.505773 6.79639 2.26513 6.79639H6.25418C7.04099 6.79639 7.73831 6.28975 7.98145 5.54145L9.21413 1.74764Z"
                    fill="#2AA952"
                  />
                </svg>
              </div>
              <div
                className="rounded bg-primary py-1"
                style={{ width: `${oneRatingPer}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-[52px] grid grid-cols-1 gap-2">
            {doctorReview &&
              doctorReview.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col gap-[18px] rounded-2xl border border-hairline bg-slate-50 p-[18px] xl:p-6"
                  >
                    <div className="flex items-center gap-4 ">
                      <div className="flex items-center gap-4 border-r border-primary pr-2">
                        <Rating
                          readOnly={true}
                          style={{ maxWidth: 95 }}
                          value={Number(item.rating)}
                          itemStyles={customStyles}
                        />
                        <span className=" font-inter text-base font-medium">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    <div className="font-poppins text-lg font-medium">
                      {/* Samantha Dicruoz */}
                      {item.bookAppointment.user.name}
                      {true ? (
                        <svg
                          className="ml-2 inline"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"
                            fill="#008F4E"
                            stroke="#008F4E"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M9 12L11 14L15 10"
                            stroke="white"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="font-inter text-sm font-normal text-inactive xl:text-base">
                      {item.review}
                    </div>
                    <div className="font-inter text-sm font-normal text-muted">
                      {" "}
                      Posted on{" "}
                      {format(new Date(item.createdAt), "MMMM dd , yyyy")}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        <div className="mt-10 pl-10">There are no reviews for the doctor</div>
      )}
    </>
  );
};
export default DoctorReview;
