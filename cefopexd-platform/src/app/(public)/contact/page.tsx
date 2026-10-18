import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SupabaseForm, { Field, TextAreaField } from "@/components/forms/SupabaseForm";
import { CONTACT } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question ? Contactez l'équipe du CeFoPExD par téléphone, e-mail, WhatsApp ou via le formulaire.",
};

/* =============================================
   CONTACT — message enregistré dans la table `contacts`
   ============================================= */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Nous contacter"
        intro="Une question ? Notre équipe est à votre écoute."
        crumbs={[{ label: "Contact" }]}
      />
      <section className="section">
        <div className="container form-layout">
          <SupabaseForm
            table="contacts"
            submitLabel="Envoyer le message"
            successTitle="Message envoyé !"
            successText="Merci pour votre message. Notre équipe vous répond dans les meilleurs délais."
          >
            <div className="form-grid">
              <Field label="Nom complet" name="nom" required autoComplete="name" />
              <Field label="E-mail" name="email" type="email" required autoComplete="email" />
              <Field label="Téléphone" name="telephone" type="tel" placeholder="+228 …" autoComplete="tel" />
              <Field label="Sujet" name="sujet" />
              <TextAreaField label="Message" name="message" required />
            </div>
          </SupabaseForm>

          <aside className="form-aside contact-list">
            <h2 className="block-title">Coordonnées</h2>
            <div className="contact-item">
              <span className="contact-ico" style={{ background: "rgba(34,192,3,0.12)", color: "var(--secondary-text)" }}><MapPin size={18} /></span>
              <div><strong>Adresse</strong><p>{CONTACT.adresse}</p></div>
            </div>
            <div className="contact-item">
              <span className="contact-ico" style={{ background: "rgba(248,35,3,0.1)", color: "var(--accent-text)" }}><Phone size={18} /></span>
              <div>
                <strong>Téléphones</strong>
                {CONTACT.telephones.map((t) => (
                  <p key={t}><a href={`tel:${t.replace(/\s/g, "")}`}>{t}</a></p>
                ))}
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-ico" style={{ background: "rgba(10,31,232,0.1)", color: "var(--primary)" }}><Mail size={18} /></span>
              <div><strong>E-mail</strong><p><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p></div>
            </div>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
              <MessageCircle size={18} /> Écrire sur WhatsApp
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
