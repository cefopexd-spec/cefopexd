import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, Mail, Phone } from "lucide-react";
import { CONTACT, type Block } from "@/lib/site-content";

/* =============================================
   RENDU DES BLOCS DE CONTENU DES PAGES
   ============================================= */
export default function ContentBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="content-stack">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <div className="prose">
          {block.title && <h2 className="block-title">{block.title}</h2>}
          {block.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </div>
      );

    case "list":
      return (
        <div>
          <h2 className="block-title">{block.title}</h2>
          <ul className="check-list">
            {block.items.map((item) => (
              <li key={item}><CheckCircle size={18} />{item}</li>
            ))}
          </ul>
        </div>
      );

    case "facts":
      return (
        <div className="facts">
          {block.items.map((f) => (
            <div key={f.label} className="fact">
              <span>{f.label}</span>
              <strong>{f.value}</strong>
            </div>
          ))}
        </div>
      );

    case "steps":
      return (
        <div>
          <h2 className="block-title">{block.title}</h2>
          <ol className="steps">
            {block.items.map((s, i) => (
              <li key={s.title}>
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
            {block.items.map((c) => {
              const inner = (
                <>
                  {c.image && (
                    <div className="info-card-img">
                      <Image src={c.image} alt={c.title} fill sizes="(max-width: 700px) 100vw, 380px" style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div className="info-card-body">
                    <h3 style={{ color: c.color ?? "var(--text)" }}>{c.title}</h3>
                    <p>{c.desc}</p>
                    {c.href && <span className="info-card-more">En savoir plus <ArrowRight size={14} /></span>}
                  </div>
                </>
              );
              return c.href
                ? <Link key={c.title} href={c.href} className="info-card is-link">{inner}</Link>
                : <div key={c.title} className="info-card">{inner}</div>;
            })}
          </div>
        </div>
      );

    case "faq":
      return (
        <div>
          <h2 className="block-title">{block.title}</h2>
          <div className="faq">
            {block.items.map((f) => (
              <details key={f.q}>
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
            {block.images.map((img) => (
              <figure key={img.src}>
                <Image src={img.src} alt={img.alt} fill sizes="(max-width: 700px) 100vw, 400px" style={{ objectFit: "cover" }} />
              </figure>
            ))}
          </div>
        </div>
      );

    case "pending":
      return (
        <div className="pending">
          <Clock size={22} />
          <div>
            <strong>Contenu en préparation</strong>
            <p>{block.text}</p>
            <div className="pending-contacts">
              <a href={`tel:${CONTACT.telephones[0].replace(/\s/g, "")}`}><Phone size={15} /> {CONTACT.telephones[0]}</a>
              <a href={`mailto:${CONTACT.email}`}><Mail size={15} /> {CONTACT.email}</a>
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
            <Link href={block.primary.href} className="btn-hero-primary">
              {block.primary.label} <ArrowRight size={17} />
            </Link>
            {block.secondary && (
              <Link href={block.secondary.href} className="btn-hero-ghost">{block.secondary.label}</Link>
            )}
          </div>
        </div>
      );
  }
}
