import type { Metadata } from "next";
import { DriverPortal } from "@/components/DriverPortal";

export const metadata: Metadata = {
  title: "Driver phone",
};

export default function DriverPage() {
  return <DriverPortal />;
}
