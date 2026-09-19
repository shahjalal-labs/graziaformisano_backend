import nodemailer from "nodemailer";
import config from "../config";
import fs from "fs";
import path from "path";
import { logoPath, LOGO_CID } from "./EmailBody";

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
  attachments?: nodemailer.SendMailOptions["attachments"]
) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  const mailAttachments: nodemailer.SendMailOptions["attachments"] = [
    ...(attachments || []),
  ];

  // If HTML references the CID and logo file exists, automatically attach it inline
  if (html.includes(`cid:${LOGO_CID}`) && fs.existsSync(logoPath)) {
    mailAttachments.push({
      filename: path.basename(logoPath),
      path: logoPath,
      cid: LOGO_CID,
    });
  }

  // Email options
  const mailOptions: nodemailer.SendMailOptions = {
    from: `"Biz Meet" <${config.emailSender.email}>`,
    to,
    subject,
    html,
    text,
    attachments: mailAttachments,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
