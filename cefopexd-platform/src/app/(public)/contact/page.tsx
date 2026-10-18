import type { Metadata } from "next";
import { Mail, MapPin, MessageSquareText, Navigation, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SocialIcons, { WhatsappIcon } from "@/components/SocialIcons";
import SupabaseForm, { Field, SelectField, TextAreaField } from "@/components/forms/SupabaseForm";
import { CONTACT } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question ? Contactez l'équipe du CeFoPExD par téléphone, e-mail, WhatsApp ou via le formulaire.",
};

const SUJETS = ["Informations sur une filière", "Inscription", "Formation sur mesure (entreprise)", "Partenariat", "Autre demande"];

/* =============================================
   CONTACT — message enregistré dans la table `contacts`
   ============================================= */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Nous contacter"
        intro="Une question sur nos formations, l'inscription ou un partenariat ? Notre équipe est à votre écoute."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="section">
        <div className="container">
          {/* Raccourcis de contact */}
          <div className="contact-quick">
            <a href={`tel:${CONTACT.telephones[0].replace(/\s/g, "")}`} className="contact-quick-item">
              <span className="contact-ico" style={{ background: "rgba(248,35,3,0.1)", color: "var(--accent-text)" }}><Phone size={20} /></span>
              <div><small>Appelez-nous</small><strong>{CONTACT.telephones[0]}</strong></div>
            </a>
            <a href={`mailto:${CONTACT.email}`} className="contact-quick-item">
              <span className="contact-ico" style={{ background: "rgba(10,31,232,0.08)", color: "var(--primary)" }}><Mail size={20} /></span>
              <div><small>Écrivez-nous</small><strong>{CONTACT.email}</strong></div>
            </a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="contact-quick-item">
              <span className="contact-ico" style={{ background: "rgba(37,211,102,0.12)", color: "#128C4A" }}><WhatsappIcon size={20} /></span>
              <div><small>Discutez avec nous</small><strong>WhatsApp</strong></div>
            </a>
            <a href={CONTACT.itineraire} target="_blank" rel="noopener noreferrer" className="contact-quick-item">
              <span className="contact-ico" style={{ background: "rgba(34,192,3,0.12)", color: "var(--green-text)" }}><MapPin size={20} /></span>
              <div><small>Venez nous voir</small><strong>{CONTACT.localisation}</strong></div>
            </a>
          </div>

          <div className="form-layout">
            <div style={{ minWidth: 0 }}>
              {/* Message d'accueil encadré */}
              <div className="contact-message">
                <MessageSquareText size={22} />
                <div>
                  <strong>Bienvenue au CeFoPExD</strong>
                  <p>
                    Que vous soyez futur apprenant, parent, entreprise ou partenaire, nous serons heureux de vous répondre.
                    Laissez-nous un message ci-dessous : il est transmis directement à notre équipe, qui vous répond dans les meilleurs délais.
                    Pour une réponse rapide, appelez-nous ou écrivez-nous sur WhatsApp.
                  </p>
                </div>
              </div>

              <SupabaseForm
                table="contacts"
                submitLabel="Envoyer le message"
                successTitle="Votre message a bien été envoyé !"
                successText="Notre équipe l'a bien reçu et vous répondra dans les meilleurs délais, par e-mail ou par téléphone."
              >
                <h2 className="form-section-title">Votre message</h2>
                <div className="form-grid">
                  <Field label="Nom complet" name="nom" required autoComplete="name" />
                  <Field label="E-mail" name="email" type="email" required autoComplete="email" />
                  <Field label="Téléphone" name="telephone" type="tel" placeholder="+228 …" autoComplete="tel" />
                  <SelectField label="Sujet" name="sujet" options={SUJETS} defaultLabel="— Choisir un sujet —" />
                  <TextAreaField label="Message" name="message" required placeholder="Écrivez votre message ici…" />
                </div>
              </SupabaseForm>
            </div>

            <aside className="form-aside contact-list">
              <h2 className="block-title">Coordonnées</h2>
              <div className="contact-item">
                <span className="contact-ico" style={{ background: "rgba(34,192,3,0.12)", color: "var(--green-text)" }}><MapPin size={18} /></span>
                <div><strong>Adresse</strong><p>{CONTACT.localisation}<br />{CONTACT.adresse}</p></div>
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
                <span className="contact-ico" style={{ background: "rgba(10,31,232,0.08)", color: "var(--primary)" }}><Mail size={18} /></span>
                <div><strong>E-mail</strong><p><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p></div>
              </div>
              <div>
                <strong className="contact-social-title">Suivez-nous</strong>
                <SocialIcons variant="light" size={16} />
              </div>
            </aside>
          </div>

          {/* Localisation */}
          <div className="contact-map">
            <div className="contact-map-head">
              <div>
                <span className="section-label" style={{ marginBottom: "4px" }}>Localisation</span>
                <h2 className="block-title" style={{ marginBottom: 0 }}>Où nous trouver</h2>
              </div>
              <a href={CONTACT.itineraire} target="_blank" rel="noopener noreferrer" className="btn-hero-primary btn-sm">
                <Navigation size={15} /> Itinéraire
              </a>
            </div>
            <iframe src={CONTACT.carte} title="Carte : localisation du CeFoPExD" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
    </>
  );
}
