import Image from 'next/image'
import Link from 'next/link'

export default function StudentMobileLogo() {
  return (
    <Link
      href="/student/dashboard"
      className="flex items-center lg:hidden flex-shrink-0"
    >
      <Image
        src="/greenroot-logo.svg"
        alt="GreenRoot"
        width={28}
        height={28}
        priority
      />
    </Link>
  )
}
