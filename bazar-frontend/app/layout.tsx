"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@heroui/navbar";
import Link from "next/link";
import Image from "next/image";
import { HeroUIProvider } from "@heroui/react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});




export const BazarLogo = () => {
  return (
    <Image 
      src="/bazarlogo.svg" 
      alt="Bazar Logo" 
      width={70} 
      height={70}
      priority
    />  
  );
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} 
      >
        <HeroUIProvider>
          <Navbar>
            <NavbarBrand>
              <BazarLogo />
              <p className="font-bold text-inherit">BAZAR</p>
            </NavbarBrand>
            <NavbarContent className="hidden sm:flex gap-4" justify="center">
              <NavbarItem>
                <Link color="foreground" href="#">
                  Home
                </Link>
              </NavbarItem>
              <NavbarItem isActive>
                <Link aria-current="page" href="#">
                  Saved
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link color="foreground" href="#">
                  Profile
                </Link>
              </NavbarItem>
            </NavbarContent>
            <NavbarContent justify="end">
              <NavbarItem className="hidden lg:flex">
                <Link href="#">Login</Link>
              </NavbarItem>
              <NavbarItem>
                {/* <Button as={Link} color="primary" href="#" variant="flat">
                  Sign Up
                </Button> */}
              </NavbarItem>
            </NavbarContent>
          </Navbar>
          {children}
          <footer className="p-4 text-center">
            Footer
          </footer>
        </HeroUIProvider>
      </body>
    </html>
  );
}
