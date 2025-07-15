import { ScannedContact, initialScannedContact } from '../types/contact';

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;

const INDIAN_PHONE_REGEX =
  /(?:(?:\+|0{0,2})91[\s-]?)?([6-9]\d{9}|(?:[2-8]\d{2}[\s-]?\d{6}))/g;

const WEBSITE_REGEX =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})/g;

const JOB_TITLE_KEYWORDS = [
  'CEO',
  'CTO',
  'CFO',
  'COO',
  'Director',
  'Manager',
  'Engineer',
  'Developer',
  'Architect',
  'Lead',
  'Specialist',
  'Consultant',
  'Analyst',
  'Head of',
  'Founder',
  'President',
  'VP',
  'Executive',
  'Admin',
  'Assistant',
];
const COMPANY_KEYWORDS = [
  'Pvt Ltd',
  'Pvt. Ltd.',
  'Private Limited',
  'Ltd.',
  'Corp.',
  'Inc.',
  'LLC',
  'Sons',
  'Co.',
  'Group',
  'Industries',
  'Solutions',
  'Services',
  'Technologies',
  'Tech',
  'Systems',
  'Ventures',
  'Labs',
  'Consulting',
];
const ADDRESS_KEYWORDS = [
  'Road',
  'Street',
  'Lane',
  'Marg',
  'Nagar',
  'Colony',
  'Apartment',
  'Bldg',
  'Building',
  'Flat',
  'House',
  'Village',
  'City',
  'Dist',
  'District',
  'Pin',
  'Pincode',
  'Post Office',
  'PO Box',
  'Block',
  'Phase',
  'Sector',
  'Area',
  'Cross',
  'Circle',
];
const INDIAN_STATES_AND_UT_KEYWORDS = [
  'AP',
  'AR',
  'AS',
  'BR',
  'CG',
  'GA',
  'GJ',
  'HR',
  'HP',
  'JH',
  'KA',
  'KL',
  'MP',
  'MH',
  'MN',
  'ML',
  'MZ',
  'NL',
  'OD',
  'PB',
  'RJ',
  'SK',
  'TN',
  'TS',
  'TR',
  'UP',
  'UK',
  'WB',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Puducherry',
  'Lakshadweep',
  'Andaman and Nicobar Islands',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Jammu and Kashmir',
  'Ladakh',
];
const PINCODE_REGEX = /\b[1-9][0-9]{5}\b/;

export const parseOcrText = (ocrText: string): ScannedContact => {
  const contact: ScannedContact = { ...initialScannedContact };
  const lines = ocrText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean); // Clean lines

  const remainingLines: string[] = [];

  lines.forEach(line => {
    let matched = false;

    // 1. Emails
    const emailsFound = line.match(EMAIL_REGEX);
    if (emailsFound) {
      contact.emails.push(...emailsFound);
      matched = true;
    }

    // 2. Phone Numbers
    const phoneNumbersFound = line.match(INDIAN_PHONE_REGEX);
    if (phoneNumbersFound) {
      const cleanedNumbers = phoneNumbersFound.map(num =>
        num.replace(/[\s()-]/g, ''),
      );
      contact.phoneNumbers.push(...cleanedNumbers);
      matched = true;
    }

    // 3. Websites
    const websitesFound = line.match(WEBSITE_REGEX);
    if (websitesFound && !contact.website) {
      // Take the first one found
      contact.website = websitesFound[0];
      matched = true;
    }

    // If a line was not matched by specific regex, add it to remaining lines for heuristic parsing
    if (!matched) {
      remainingLines.push(line);
    }
  });

  let potentialName = '';
  let potentialJobTitle = '';
  let potentialCompany = '';
  let potentialAddress = '';

  for (const line of remainingLines) {
    const lowerCaseLine = line.toLowerCase();

    if (
      !contact.jobTitle &&
      JOB_TITLE_KEYWORDS.some(keyword =>
        lowerCaseLine.includes(keyword.toLowerCase()),
      )
    ) {
      if (line.length < 50) {
        potentialJobTitle = line;
        continue;
      }
    }

    // Check for Company keywords
    if (
      !contact.company &&
      COMPANY_KEYWORDS.some(keyword =>
        lowerCaseLine.includes(keyword.toLowerCase()),
      )
    ) {
      potentialCompany = line;
      continue;
    }

    // Check for Address keywords or Pincode
    if (
      !contact.address &&
      (ADDRESS_KEYWORDS.some(keyword =>
        lowerCaseLine.includes(keyword.toLowerCase()),
      ) ||
        line.match(PINCODE_REGEX) ||
        INDIAN_STATES_AND_UT_KEYWORDS.some(keyword =>
          lowerCaseLine.includes(keyword.toLowerCase()),
        ))
    ) {
      potentialAddress += (potentialAddress ? '\n' : '') + line;
      continue;
    }

    if (
      !contact.name &&
      line.length < 40 &&
      line.split(' ').length <= 4 &&
      line[0] === line[0].toUpperCase() &&
      !/[0-9]/.test(line)
    ) {
      potentialName = line;
    }
  }

  if (potentialName) contact.name = potentialName;
  if (potentialJobTitle) contact.jobTitle = potentialJobTitle;
  if (potentialCompany) contact.company = potentialCompany;
  if (potentialAddress) contact.address = potentialAddress;

  // Final cleanup and deduplication for arrays
  contact.emails = Array.from(
    new Set(contact.emails.map(e => e.toLowerCase())),
  );
  contact.phoneNumbers = Array.from(new Set(contact.phoneNumbers));

  return contact;
};
