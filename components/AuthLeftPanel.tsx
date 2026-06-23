import Image from 'next/image'

export default function AuthLeftPanel() {
  return (
    <div className="hidden lg:block relative lg:w-[40%] h-full bg-gradient-to-br from-green-600 to-green-800">
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
      
      {/* Logo */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <Image 
          src="/greenroot-logo.svg" 
          alt="GreenRoot" 
          width={40} 
          height={40}
        />
        <span className="text-2xl font-bold text-white">GreenRoot</span>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-8 left-8 right-8 z-10">
        <h1 className="text-white font-bold text-3xl mb-4 leading-tight">
          Empowering the next generation of Agri-Leaders.
        </h1>
        <p className="text-white/90 text-base">
          Get international paid internships and revolutionise the future of agriculture.
        </p>
      </div>
    </div>
  )
}
