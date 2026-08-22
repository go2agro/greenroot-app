import Image from 'next/image'
import appConfig from '@/config/appConfig.json'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Image
            src={appConfig.app_logo}
            alt={appConfig.app_name}
            width={120}
            height={40}
            className="mx-auto mb-6"
          />
          <div className="w-20 h-20 bg-[#8DC63F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-[#8DC63F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          We&apos;ll be back soon!
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          We&apos;re currently performing scheduled maintenance to improve your experience.
          Please check back in a little while.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <p className="text-sm text-gray-500 mb-2">Need immediate assistance?</p>
          <a
            href={`mailto:${appConfig.contact_email}`}
            className="text-[#8DC63F] font-medium hover:underline"
          >
            {appConfig.contact_email}
          </a>
          {appConfig.contact_phone && (
            <>
              <span className="text-gray-300 mx-2">|</span>
              <a
                href={`tel:${appConfig.contact_phone.replace(/\s/g, '')}`}
                className="text-[#8DC63F] font-medium hover:underline"
              >
                {appConfig.contact_phone}
              </a>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400">
          {appConfig.footer_text}
        </p>
      </div>
    </div>
  )
}
