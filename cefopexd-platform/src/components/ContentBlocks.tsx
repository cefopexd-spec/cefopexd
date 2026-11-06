import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, Mail, Phone, Quote } from "lucide-react";
import type { Block } from "@/lib/site-content";
import type { SiteConfig } from "@/lib/site/types";
import { nonOptimise } from "@/lib/site/images";
import { CarteDirecteur } from "@/components/accueil/Accueil";

export type ContexteBlocs = { contact: SiteConfig["contact"]; directeur: SiteConfig["directeur"]; logo: string };

const CLASSES_BOUTON: Record<string, string> = {
  primaire: "btn-hero-primary",
  rouge: "btn-hero-red",
  contour: "btn-hero-ghost",
  jaune: "header-cta",
};

/* Lien YouTube / Vimeo → adresse intégrable */
function videoIntegrable(url: string) {
  const yt = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/.exec(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(\d+)/.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/* =============================================
   RENDU DES BLOCS DE CONTENU DES PAGES
   ============================================= */
export default function ContentBlocks({ blocks, ctx }: { blocks: Block[]; ctx: ContexteBlocs }) {
  return (
    <div className="content-stack">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} ctx={ctx} />
      ))}
    </div>
  );
}

function BlockView({ block, ctx }: { block: Block; ctx: ContexteBlocs }) {
  switch (block.type) {
    case "text":
      return (
        <div className="prose">
          {block.title && <h2 className="block-title">{block.title}</h2>}
          {(block.paragraphs ?? []).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      );

    case "list":
      return (
        <div>
          {block.title && <h2 className="block-title">{block.title}</h2>}
          <ul className="check-list">
            {(block.items ?? []).map((item, i) => (
              <li key={i}><CheckCircle size={18} />{item}</li>
            ))}
          </ul>
        </div>
      );

    case "facts":
      return (
        <div className="facts">
          {(block.items ?? []).map((f, i) => (
            <div key={i} className="fact">
              <span>{f.label}</span>
              <strong>{f.value}</strong>
            </div>
          ))}
        </div>
      );

    case "steps":
      return (
        <div>
          {block.title && <h2 className="block-title">{block.title}</h2>}
          <ol className="steps">
            {(block.items ?? []).map((s, i) => (
              <li key={i}>
                <span className="step-num">{i + 1}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      );

    case "cards":
      return (
        <div>
          {block.title && <h2 className="block-title">{block.title}</h2>}
          <div className="info-cards">
            {(block.items ?? []).map((c, i) => {
              const inner = (
                <>
                  {c.image && (
                    <div className="info-card-img">
                      <Image src={c.image} unoptimized={nonOptimise(c.image)} alt={c.title} fill sizes="(max-width: 700px) 100vw, 380px" style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div className="info-card-body">
                    <h3 style={{ color: c.color || "var(--text)" }}>{c.title}</h3>
                    <p>{c.desc}</p>
                    {c.href && <span className="info-card-more">En savoir plus <ArrowRight size={14} /></span>}
                  </div>
                </>
              );
              return c.href
                ? <Link key={i} href={c.href} className="info-card is-link">{inner}</Link>
                : <div key={i} className="info-card">{inner}</div>;
            })}
          </div>
        </div>
      );

    case "faq":
      return (
        <div>
          {block.title && <h2 className="block-title">{block.title}</h2>}
          <div className="faq">
            {(block.items ?? []).map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      );

    case "gallery":
      return (
        <div>
          {block.title && <h2 className="block-title">{block.title}</h2>}
          <div className="gallery">
            {(block.images ?? []).filter((img) => img.src).map((img, i) => (
              <figure key={i}>
                <Image src={img.src} unoptimized={nonOptimise(img.src)} alt={img.alt ?? ""} fill sizes="(max-width: 700px) 100vw, 400px" style={{ objectFit: "cover" }} />
              </figure>
            ))}
          </div>
        </div>
      );

    case "image":
      return block.src ? (
        <figure className="bloc-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src} alt={block.alt ?? ""} loading="lazy" />
          {block.legende && <figcaption>{block.legende}</figcaption>}
        </figure>
      ) : null;

    case "video": {
      const src = videoIntegrable(block.url ?? "");
      return src ? (
        <div>
          {block.titre && <h2 className="block-title">{block.titre}</h2>}
          <div className="bloc-video">
            <iframe src={src} title={block.titre || "Vidéo"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </div>
      ) : null;
    }

    case "boutons":
      return (
        <div className="bloc-boutons">
          {(block.items ?? []).filter((b) => b.label).map((b, i) => (
            <Link key={i} href={b.href || "/"} className={CLASSES_BOUTON[b.style ?? "primaire"] ?? "btn-hero-primary"}>
              {b.label} <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      );

    case "pending": {
      const tel = ctx.contact.telephones[0];
      return (
        <div className="pending">
          <Clock size={22} />
          <div>
            <strong>Contenu en préparation</strong>
            <p>{block.text}</p>
            <div className="pending-contacts">
              {tel && <a href={`tel:${tel.replace(/\s/g, "")}`}><Phone size={15} /> {tel}</a>}
              {ctx.contact.email && <a href={`mailto:${ctx.contact.email}`}><Mail size={15} /> {ctx.contact.email}</a>}
            </div>
          </div>
        </div>
      );
    }

    case "director":
      return (
        <div className="director-page">
          <CarteDirecteur directeur={ctx.directeur} logo={ctx.logo} />
          <div className="director-letter">
            <Quote size={32} aria-hidden="true" />
            {ctx.directeur.message.map((p, i) => <p key={i}>{p}</p>)}
            <div className="director-signature">
              <strong>{ctx.directeur.nom}</strong>
              <span>{ctx.directeur.fonction}</span>
            </div>
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="page-cta">
          <div>
            <h2>{block.title}</h2>
            <p>{block.text}</p>
          </div>
          <div className="page-cta-actions">
            {block.primary?.label && (
              <Link href={block.primary.href || "/"} className="btn-hero-primary">
                {block.primary.label} <ArrowRight size={17} />
              </Link>
            )}
            {block.secondary?.label && (
              <Link href={block.secondary.href || "/"} className="btn-hero-ghost">{block.secondary.label}</Link>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export const contexteBlocs = (site: SiteConfig): ContexteBlocs => ({ contact: site.contact, directeur: site.directeur, logo: site.identite.logo });
