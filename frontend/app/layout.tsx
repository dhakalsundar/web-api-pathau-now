import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import { SocketEventInitializer } from "./components/SocketEventInitializer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "PathauNow",
  description: "Parcel & Courier Tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SocketProvider>
          <AuthProvider>
            <NotificationProvider>
              <ToastProvider>
                <SocketEventInitializer />
                {children}
                <Toaster position="bottom-right" containerClassName="text-sm font-semibold" />
              </ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
