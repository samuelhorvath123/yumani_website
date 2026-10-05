import { Check } from 'lucide-react';
import TeamCarousel from './team-carousel';
import { teamMembers } from '@/lib/team';
import './about-section.css';

export default function AboutSection() {
  return <section className="belief-section" id="about" aria-labelledby="belief-title">
    <div className="about-stage">
      <picture className="about-art">
        <source type="image/avif" srcSet="/images/yumani-about-640.avif 640w, /images/yumani-about-960.avif 960w, /images/yumani-about-1536.avif 1536w" sizes="(max-width: 700px) 100vw, 75vw"/>
        <source type="image/webp" srcSet="/images/yumani-about-640.webp 640w, /images/yumani-about-960.webp 960w, /images/yumani-about-1536.webp 1536w" sizes="(max-width: 700px) 100vw, 75vw"/>
        <img src="/images/yumani-about-960.jpg" srcSet="/images/yumani-about-640.jpg 640w, /images/yumani-about-960.jpg 960w, /images/yumani-about-1536.jpg 1536w" sizes="(max-width: 700px) 100vw, 75vw" width="1536" height="1024" alt="" loading="lazy" decoding="async"/>
      </picture>
      <div className="about-overview wrap">
        <div className="about-intro" data-reveal="">
          <h2 id="belief-title">The future should<br/>feel more <span>human.</span></h2>
          <p className="about-lead">Better technology starts with caring about the people using it.</p>
        </div>
        <div className="about-story belief-copy" data-reveal="">
          <p>We’re a small team, founded in Bratislava in 2025, and we like it that way: the people you talk to are the people who build your software, and the same people look after it once it’s live.</p>
          <p>We don’t have a long list of references yet. What we offer instead is a way of working you can check for yourself: honest estimates, working software you can try early, and nothing hidden in the fine print.</p>
          <div className="quality-promise"><Check size={17} aria-hidden="true"/><span>Plenty of possibilities. No shortcuts on quality.</span></div>
        </div>
      </div>
    </div>
    <TeamCarousel preview={teamMembers.length === 0}>
      {teamMembers.length ? teamMembers.map(member => <li className="team-card" key={member.name}>
        <div className="team-plate">
          <picture className="team-portrait"><img src={member.portrait} alt={member.name} width="840" height="1050" loading="lazy" decoding="async" draggable={false} style={{ objectPosition: member.portraitPosition }}/></picture>
        </div>
        <div className="team-caption"><h4>{member.name}</h4><p>{member.role}</p></div>
      </li>) : [1, 2, 3, 4].map(slot => <li className="team-card team-card-preview" key={slot}>
        <div className="team-plate">
          <div className="team-portrait"><span className="team-slot-art" aria-hidden="true"/><span className="team-slot-number" aria-hidden="true">0{slot}</span><span className="team-slot-label">Portrait space</span></div>
        </div>
        <div className="team-caption"><h4>Team profile</h4><p>Name and role to be added</p></div>
      </li>)}
    </TeamCarousel>
    <div className="belief-principles wrap"><span data-reveal="">People before processes</span><span data-reveal="">Reliable before clever</span><span data-reveal="">Honest from the first estimate</span></div>
  </section>;
}
