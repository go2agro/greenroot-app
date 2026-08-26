import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { getContactInfo } from '@/lib/contact'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.85c0-2.37 1.4-3.69 3.56-3.69 1.03 0 2.11.19 2.11.19v2.32h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.9h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm8.75 1.75a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.258 5.686 5.906-5.686zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.150-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

const socialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  x: XIcon,
  linkedin: LinkedInIcon,
} as const

export default async function Contact() {
  const contact = await getContactInfo()

  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Navbar activeLink="contact" />

      <main className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-16">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-[2.75rem] text-[#1A1A1A] leading-tight tracking-tight">
              {contact.pageTitle}
            </h1>
            <p className="md:max-w-md md:text-right text-sm md:text-[15px] text-gray-600 leading-relaxed">
              {contact.pageSubtitle}
            </p>
          </header>

          <div className="grid lg:grid-cols-12 gap-5 lg:gap-6">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative w-full h-[280px] sm:h-[360px] lg:h-full lg:min-h-[520px] overflow-hidden rounded-2xl bg-[#E8EDDF]">
                <iframe
                  title={`${contact.officeName} location`}
                  src={contact.mapEmbedUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="rounded-2xl bg-white border border-gray-200 px-6 py-6 sm:px-7 sm:py-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8DC63F] mb-3">
                  Visit
                </p>
                <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  {contact.officeName}
                </h2>
                <address className="not-italic text-sm text-gray-600 leading-relaxed mb-4">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={contact.mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#1A1A1A] border border-gray-200 rounded-lg px-4 py-2.5 hover:border-[#8DC63F] hover:text-[#8DC63F] transition-colors"
                  >
                    Get directions
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={contact.whatsapp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#25D366] rounded-lg px-4 py-2.5 hover:bg-[#1EBE57] transition-colors"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    {contact.whatsapp.label}
                  </a>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="rounded-2xl bg-white border border-gray-200 px-6 py-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8DC63F] mb-4">
                    Call
                  </p>
                  <ul className="flex flex-col gap-4">
                    {contact.phones.map((phone) => (
                      <li key={phone.label} className="min-w-0">
                        <p className="text-xs text-gray-500 mb-1">{phone.label}</p>
                        <a
                          href={`tel:${phone.tel}`}
                          className="block text-[15px] font-semibold text-[#1A1A1A] hover:text-[#8DC63F] transition-colors tabular-nums"
                        >
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white border border-gray-200 px-6 py-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8DC63F] mb-4">
                    Email
                  </p>
                  <ul className="flex flex-col gap-4">
                    {contact.emails.map((item) => (
                      <li key={item.email} className="min-w-0">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <a
                          href={`mailto:${item.email}`}
                          className="block text-[15px] font-semibold text-[#1A1A1A] hover:text-[#8DC63F] transition-colors break-all"
                        >
                          {item.email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl bg-[#1A1A1A] px-6 py-6 sm:px-7 text-white">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3D32F] mb-4">
                      Hours
                    </p>
                    <ul className="flex flex-col gap-2.5">
                      {contact.officeHours.map((row) => (
                        <li
                          key={row.days}
                          className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
                        >
                          <span className="text-sm text-white/55">{row.days}</span>
                          <span className="text-sm font-medium text-white">
                            {row.hours}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A3D32F] mb-4">
                      Follow
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {contact.socials.map((social) => {
                        const Icon =
                          socialIcons[social.id as keyof typeof socialIcons]
                        return (
                          <Link
                            key={social.id}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-[#A3D32F] hover:text-[#1A1A1A] transition-colors"
                          >
                            {Icon ? (
                              <Icon className="w-[18px] h-[18px]" />
                            ) : (
                              <span className="text-xs font-semibold">
                                {social.label.slice(0, 1)}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                    <p className="mt-4 text-xs text-white/40 leading-relaxed">
                      {contact.responseNote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
