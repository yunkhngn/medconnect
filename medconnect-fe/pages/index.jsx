import {Default} from "../components/layouts/";
import {DoctorList} from "../components/ui/";
import Image from "next/image";
export default function HomePage() {
  return (
    <Default>
        <Image
          src="/assets/homepage/cover.jpg"
          alt="Sample 16:9"
          width={1920}
          height={1080}
          style={{ borderRadius: "12px", marginTop: "2em" }}
        />
        <DoctorList />
    </Default>
  );
}