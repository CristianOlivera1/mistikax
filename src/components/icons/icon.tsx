"use client";

import {
  Icon as IconifyIcon,
  addCollection,
  type IconProps as IconifyProps,
} from "@iconify/react/offline";
import { iconData } from "./icon-data";

addCollection(iconData);

export function Icon(props: IconifyProps) {
  return <IconifyIcon {...props} />;
}
