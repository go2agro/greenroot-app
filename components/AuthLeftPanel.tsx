import Image from 'next/image'
import GreenRootWordmark from '@/components/GreenRootWordmark'
import { appConfig } from '@/lib/appConfig'
import { pageCopyConfig } from '@/lib/config'

export default function AuthLeftPanel({ showLogo = true }: { showLogo?: boolean }) {
  const auth = pageCopyConfig.auth

  return (
    <div className="hidden lg:block relative lg:w-[40%] h-full bg-gradient-to-br from-gray-600 to-gray-800">
      <div className="relative w-full h-full">
        <Image 
          src="https://go2agro.com/wp-content/uploads/2022/08/WhatsApp-Image-2022-08-16-at-2.15.42-PM.jpeg"
          alt="Indian and international students together on campus lawn during a GreenRoot programme abroad" 
          fill
          className="object-cover"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {showLogo && (
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <Image 
            src={appConfig.app_logo}
            alt={appConfig.app_name}
            width={40} 
            height={40}
          />
          <GreenRootWordmark className="text-2xl" />
        </div>
      )}

      <div className="absolute bottom-8 left-8 right-8 z-10">
        <h1 className="text-white font-bold text-3xl mb-4 leading-tight">
          {auth.panelHeading}
        </h1>
        <p className="text-white/90 text-base">
          {auth.panelSubheading}
        </p>
      </div>
    </div>
  )
}
