"use client";

import { ButtonHTMLAttributes } from "react";
import Magnetic from "@/components/motion/Magnetic";
import { buttonClass, ButtonVariant } from "./button-styles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  magnetic?: boolean;
}

export default function Button({
  variant = "secondary",
  magnetic = true,
  className = "",
  ...props
}: ButtonProps) {
  const button = <button className={buttonClass(variant, className)} {...props} />;

  if (!magnetic || props.disabled) return button;
  return <Magnetic className="inline-block">{button}</Magnetic>;
}
