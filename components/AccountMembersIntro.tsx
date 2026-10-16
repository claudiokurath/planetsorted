import Image from 'next/image'

const memberExperiences = [
  {
    icon: 'hourglass',
    title: 'Know what needs to be done',
    description: 'But cannot find a way to start — no matter how simple the task looks from the outside.',
  },
  {
    icon: 'mask',
    title: 'Feel exhausted from masking',
    description: 'From compensating, performing, and trying to keep up with a world that was not built for them.',
  },
  {
    icon: 'tools',
    title: 'Need practical support',
    description: 'Rather than more judgement. Simple tools that work on low-energy days — not systems that demand perfection.',
  },
  {
    icon: 'heart',
    title: 'Want to understand themselves',
    description: 'Without being reduced to a diagnosis. Building a life that works for them, not one that just looks organised from the outside.',
  },
] as const

const memberAffirmations = [
  {
    title: 'Not lazy or careless',
    description: 'They are not failing at life. They are carrying more than most people can see — and doing it with fewer of the tools they actually need.',
  },
  {
    title: 'Not broken or dramatic',
    description: 'There is nothing wrong with them. They have different needs, different strengths, and different ways of processing the world.',
  },
  {
    title: 'Not problems to be fixed',
    description: 'They are not productivity projects to be optimised. They are people — full stop.',
  },
] as const

function MemberIcon({ kind }: { kind: typeof memberExperiences[number]['icon'] }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'hourglass' && <path d="M7 3h18M7 29h18M8 3c0 6 2 9 8 13-6 4-8 7-8 13M24 3c0 6-2 9-8 13 6 4 8 7 8 13" />}
      {kind === 'mask' && <><path d="M3 14c0-5 5-7 13-7s13 2 13 7c0 4-3 8-7 8-3 0-3-3-6-3s-3 3-6 3c-4 0-7-4-7-8Z" /><circle cx="10" cy="14" r="2.5" /><circle cx="22" cy="14" r="2.5" /></>}
      {kind === 'tools' && <><path d="m5 3 7 7-3 3-7-7 3-3Zm7 10 15 15m-2-8 4 4-5 5-4-4M27 3l-5 5 2 2 5-5c1 5-2 9-7 8L8 28a3 3 0 0 1-4-4l15-14c-1-5 3-8 8-7Z" /><path d="m6 25 1 1" /></>}
      {kind === 'heart' && <path d="M16 28 4 16C-3 8 8-1 16 8c8-9 19 0 12 8L16 28Z" />}
    </svg>
  )
}

/** Native, responsive recreation of the supplied four-page member introduction. */
export function AccountMembersIntro() {
  return (
    <div className="sorted-members-intro">
      <div className="sorted-members-art">
        <Image
          src="/images/account-members-space.jpg"
          alt="A brain in a glass case on a red machine beside a red chair, against a yellow wall."
          width={1280}
          height={853}
          loading="eager"
          sizes="(max-width: 1312px) calc(100vw - 32px), 1280px"
          unoptimized
        />
      </div>

      <section className="sorted-members-section sorted-members-who" aria-labelledby="members-who-title">
        <h2 id="members-who-title">Who our members are</h2>
        <div className="sorted-members-copy">
          <p>SOR7ED members are people who are doing their best in systems that were not always designed with their brains in mind.</p>
          <p>They may be navigating ADHD, autism, AuDHD, dyslexia, rejection sensitivity, burnout, executive dysfunction, or simply the overwhelming weight of everyday life admin.</p>
        </div>
      </section>

      <section className="sorted-members-section" aria-labelledby="members-include-title">
        <h2 id="members-include-title">Our members include people who</h2>
        <div className="sorted-members-experiences">
          {memberExperiences.map(({ icon, title, description }) => (
            <article key={title} className="sorted-members-experience">
              <MemberIcon kind={icon} />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sorted-members-section" aria-labelledby="members-not-title">
        <h2 id="members-not-title">Members are not</h2>
        <p className="sorted-members-note">It matters that we say this clearly.</p>
        <div className="sorted-members-affirmations">
          {memberAffirmations.map(({ title, description }) => (
            <article key={title} className="sorted-members-affirmation">
              <h3><span aria-hidden="true" className="sorted-members-cross">❌</span> {title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
