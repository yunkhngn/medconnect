import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Input} from "@heroui/react";
import navigate from "@/config/navigate";
import { useRouter } from "next/router";
import Image from "next/image";

const Nav = () => {
  const router = useRouter();

  const handleNavigation = (link) => {
    router.push(link);
  };
  return (
     <Navbar shouldHideOnScroll>
      <NavbarBrand>
        <Link href="/">
          <Image
            src="assets/logo.svg"
            alt="MedConnect Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <p className="font-bold text-inherit">MedConnect</p>
        </Link>
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