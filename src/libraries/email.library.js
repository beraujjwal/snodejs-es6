'use strict';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { sendMail } from '../helpers/mailer.js';

export const sentOTPMail = function (email, token) {
  try {
    const mailOptions = {
      to: email,
      subject: 'User registration',
      template: 'sentOTPMail',
      context: {
        token: token,
      },
      attachments: [
        {
          filename: 'logo.jpg',
          path: path.resolve(
            __dirname,
            '../resources/templates/images/logo.jpg'
          ),
        },
      ],
    };

    sendMail(mailOptions);
  } catch (ex) {
    console.log(ex);
  }
};

export const registrationVerificationEmail = function (
  email,
  { name, companyName, confirmationLink }
) {
  try {
    const mailOptions = {
      to: email,
      subject: 'Tenant Registration Confirmation',
      template: 'registrationVerificationEmail',
      context: {
        name: name,
        companyName: companyName,
        confirmationLink: confirmationLink,
      },
      attachments: [
        {
          filename: 'logo.jpg',
          path: path.resolve(
            __dirname,
            '../resources/templates/images/logo.jpg'
          ),
        },
      ],
    };

    sendMail(mailOptions);
  } catch (ex) {
    console.log(ex);
  }
};
