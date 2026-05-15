export interface DonationRepresentation {
  id?: number;
  donationName?: string;
  donationDesc?: string;
  donationDate?: string;
  amount?: number;
  player?: { id?: number; fName?: string; lName?: string; };
}
