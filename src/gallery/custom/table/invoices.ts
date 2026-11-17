export interface Invoice {
  invoice: string;
  paymentStatus: "Paid" | "Pending" | "Unpaid";
  totalAmount: number;
  paymentMethod: string;
}

export const invoices: Invoice[] = [
  { invoice: "INV001", paymentStatus: "Paid", totalAmount: 250, paymentMethod: "Credit Card" },
  { invoice: "INV002", paymentStatus: "Pending", totalAmount: 150, paymentMethod: "PayPal" },
  { invoice: "INV003", paymentStatus: "Unpaid", totalAmount: 350, paymentMethod: "Bank Transfer" },
  { invoice: "INV004", paymentStatus: "Paid", totalAmount: 450, paymentMethod: "Credit Card" },
  { invoice: "INV005", paymentStatus: "Paid", totalAmount: 550, paymentMethod: "PayPal" },
  { invoice: "INV006", paymentStatus: "Pending", totalAmount: 200, paymentMethod: "Bank Transfer" },
  { invoice: "INV007", paymentStatus: "Unpaid", totalAmount: 300, paymentMethod: "Credit Card" },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const money = (amount: number) => currency.format(amount);
