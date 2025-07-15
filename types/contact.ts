export interface ScannedContact {
  name?: string;
  jobTitle?: string;
  company?: string;
  phoneNumbers: string[];
  emails: string[];
  website?: string;
  address?: string;
}

export const initialScannedContact: ScannedContact = {
  phoneNumbers: [],
  emails: [],
};
