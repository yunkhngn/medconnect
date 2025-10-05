import {Default} from "../components/layouts/";
import {DoctorList} from "../components/ui/";
import Image from "next/image";
import Test from "../components/ui/test"
export default function HomePage() {
  return (
    <Default>
        <Image
          src="/assets/homepage/cover.jpg"
          alt="Sample 16:9"
          width={1920}
          height={1080}
          className="w-full h-auto"
        />
        <Test/>
        <DoctorList />
    </Default>
  );
}