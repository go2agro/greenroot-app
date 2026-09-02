import Image from 'next/image'
import { appConfig } from '@/lib/appConfig'
import { pageCopyConfig } from '@/lib/config'

export default function AuthLeftPanel() {
  const auth = pageCopyConfig.auth

  return (
    <div className="hidden lg:block relative lg:w-[40%] h-full bg-gradient-to-br from-gray-600 to-gray-800">
      <div className="relative w-full h-full">
        <Image 
          src="/images/login-bg.jpg" 
          alt="Agriculture background" 
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
      
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <Image 
          src={appConfig.app_logo}
          alt={appConfig.app_name}
          width={40} 
          height={40}
        />
        <span className="text-2xl font-bold text-white">{appConfig.app_name}</span>
      </div>

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
