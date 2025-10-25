import { type JSX, type ReactNode } from "react";

type CardProps = {
  className?: string;
  title: string;
  children: ReactNode;
  href: string;
};

export function Card({ className, title, children, href }: CardProps): JSX.Element {
  const trackingHref = href.includes('?')
    ? `${href}&utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo`
    : `${href}?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo`;

  return (
    <a
      className={className}
      href={trackingHref}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2>
        {title} <span>-&gt;</span>
      </h2>
      <p>{children}</p>
    </a>
  );
}
