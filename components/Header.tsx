'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import './header-footer.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <>
      {/* Spacer so page content doesn't hide under header */}
      <div className="header-spacer" />

      <header className={`header ${isScrolled ? 'scrolled' : ''}`} id="header">
        <div className="header-pill">
          {/* Logo */}
          <Link href="/" className="pill-logo">
            <Image
              src="https://teotia-and-co.s3.us-east-1.amazonaws.com/logo.avif"
              alt="TEOTIA & CO. Logo"
              className="logo"
              width={120}
              height={41}
            />
          </Link>

          {/* Nav Links */}
          <nav className="pill-nav" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`pill-link ${pathname === link.href ? 'pill-link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="pill-actions">
            <button className="btn-consult">
              Book Consultation
              <span className="btn-consult-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7h8M7 3l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <button
              className="hamburger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <button
          className="mobile-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          &times;
        </button>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active-mobile-link' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <button className="btn-consult" style={{ width: '100%', marginTop: '12px' }}>
          Book Consultation
          <span className="btn-consult-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7h8M7 3l4 4-4 4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </>
  );
}
