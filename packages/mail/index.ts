import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async (mail: nodemailer.SendMailOptions) => {
  try {
    const info = await transporter.sendMail(mail);
    return info;
  } catch (error) {
    console.error("error is", error);
  }
};
