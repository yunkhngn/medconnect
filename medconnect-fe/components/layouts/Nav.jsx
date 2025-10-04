import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Input} from "@heroui/react";
import navigate from "@/config/navigate";
import { useRouter } from "next/router";
import Image from "next/image";

export const SearchIcon = ({size = 24, strokeWidth = 1.5, width, height, ...props}) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={height || size}
      role="presentation"
      viewBox="0 0 24 24"
      width={width || size}
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};


const Nav = () => {
  const router = useRouter();

  const handleNavigation = (link) => {
    router.push(link);
  };
  return (
     <Navbar shouldHideOnScroll>
      <NavbarBrand>
        <Image
          src="assets/logo.svg"
          alt="MedConnect Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        <p className="font-bold text-inherit">MedConnect</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navigate.route.map((item, index) => (
          <NavbarItem key={index}>
            <Link href={item.link}>{item.text}</Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
       {navigate.button.map((item, index) => (
          <NavbarItem key={index}>
                <Button 
                  color={item.color} 
                  variant={item.variant}
                  onPress={() => handleNavigation(item.link)}
                >
                {item.text}
                </Button>
          </NavbarItem>
        ))}
      </NavbarContent>
    </Navbar>
  )
}

export default Nav