import Image from 'next/image'

export function RotatingHero() {
  return (
    <div className="relative flex h-[300px] w-full flex-col items-center justify-center gap-5 overflow-hidden border border-white/10 bg-black p-8 text-center lg:h-[500px]">
      <Image
        src="/images/tangle-gold.png"
        alt=""
        width={380}
        height={380}
        className="h-24 w-24 opacity-90 lg:h-32 lg:w-32"
      />
      <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#C6A052]">worry less, live more.</p>
      <h2 className="text-2xl font-normal uppercase tracking-[0.04em] text-white lg:text-4xl">
        Templates, not inspiration.
      </h2>
    </div>
  )
}
