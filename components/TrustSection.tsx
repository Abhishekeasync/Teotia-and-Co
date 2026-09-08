'use client';

import Image from 'next/image';
import { RevealText, Stagger, StaggerItem } from '@/components/Reveal';

const cards = [
  {
    title: 'Client-Centric Approach',
    bullets: [
      "Understanding each client's unique requirements",
      'Delivering tailored solutions that create long-term value.',
    ],
    icon: '/assets/images/static.wixstatic.com/fb4679_bfd7e9f5379042f1b9bdbe57ee7504c0-063527ce46.svg',
    width: 59,
    height: 57,
  },
  {
    title: 'Technical Excellence',
    bullets: [
      'Leveraging deep professional expertise and industry knowledge',
      'Accurate, practical, and compliant advice',
    ],
    icon: '/assets/images/static.wixstatic.com/fb4679_21b8b39d9bab4c24abb9223f82b1466f-7eef7ba366.svg',
    width: 68,
    height: 68,
  },
  {
    title: 'Proactive Risk Management',
    bullets: [
      'Identifying potential challenges early',
      'Implementing effective strategies for regulatory compliance and business continuity.',
    ],
    icon: '/assets/images/static.wixstatic.com/fb4679_14fee24df05b43439f902b67dd58a426-76ccfa920d.svg',
    width: 68,
    height: 68,
  },
  {
    title: 'Sustainable Growth Focus',
    bullets: [
      'Supporting businesses with strategic guidance, innovation, and efficient solutions',
      'Long-term success and growth',
    ],
    icon: '/assets/images/static.wixstatic.com/fb4679_c98be4ef1e154770b674da71b79e6054-9989048e1e.svg',
    width: 68,
    height: 68,
  },
];

export default function TrustSection() {
  return (
    <section className="section section-gray">
      <div className="trust">
        <RevealText as="h2">Why Businesses Trust Us With Their Finances</RevealText>
        <RevealText as="p" className="trust-sub" delay={0.08}>
          Reliable, accurate, and expert accounting solutions that make your business run smoothly.
        </RevealText>
        <Stagger className="trust-grid">
          {cards.map((card) => (
            <StaggerItem className="trust-card" key={card.title}>
              <div className="trust-icon">
                <Image src={card.icon} alt={card.title} width={card.width} height={card.height} />
              </div>
              <h3>{card.title}</h3>
              <ul className="trust-bullets">
                {card.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
