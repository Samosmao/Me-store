import "./globals.css";

export const metadata = {
  title: "Download Center",
  description: "Get the apps you need.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
