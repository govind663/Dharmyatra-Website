import { useEffect } from "react";
import { SITE_URL } from "../lib/utils";

export type SEOProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  schema?: object | object[];
};

export function useSEO({ title, description, path = "/", image = "/images/hero-varanasi.jpg", schema }: SEOProps) {
  useEffect(() => {
    document.title = title;
    const set = (sel: string, attr: string, val: string, createTag = "meta") => {
      let el = document.head.querySelector(sel) as HTMLMetaElement | null;
      if (!el) { el = document.createElement(createTag) as HTMLMetaElement; document.head.appendChild(el); }
      el.setAttribute(attr, val);
      return el;
    };
    const setProp = (prop: string, content: string) => {
      let el = document.head.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const setName = (name: string, content: string) => {
      let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setName("description", description);
    const canonical = SITE_URL + path;
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) { link = document.createElement("link"); link.setAttribute("rel", "canonical"); document.head.appendChild(link); }
    link.setAttribute("href", canonical);
    setProp("og:title", title); setProp("og:description", description);
    setProp("og:url", canonical); setProp("og:image", SITE_URL + image);
    setProp("og:type", "website");
    set("meta[name='twitter:card']", "content", "summary_large_image");
    setName("twitter:title", title); setName("twitter:description", description);
    const old = document.getElementById("dd-schema");
    if (old) old.remove();
    if (schema) {
      const s = document.createElement("script");
      s.id = "dd-schema"; s.type = "application/ld+json";
      s.textContent = JSON.stringify(schema);
      document.head.appendChild(s);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [title, description, path, image]);
}

export function orgSchema() {
  return {
    "@context": "https://schema.org", "@type": "Organization",
    name: "DivyaDhara", url: SITE_URL,
    description: "India's premium digital spiritual ecosystem — temples, pandits, pujas, ashrams, courses, Panchang, events and yatras.",
    sameAs: [],
  };
}
