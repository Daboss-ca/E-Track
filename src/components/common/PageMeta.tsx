import { useEffect, type ReactNode } from "react";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  useEffect(() => {
    document.title = title;

    let descriptionMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.name = "description";
      document.head.appendChild(descriptionMeta);
    }

    descriptionMeta.content = description;
  }, [title, description]);

  return null;
};

export const AppWrapper = ({ children }: { children: ReactNode }) => children;

export default PageMeta;