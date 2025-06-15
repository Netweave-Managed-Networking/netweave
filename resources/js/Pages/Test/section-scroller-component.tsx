import { Button } from '@mui/material';
import { useEffect, useState } from 'react';

type SectionId = number;

const domIdFromSectionId = (sectionId: SectionId) => `section-${sectionId}`;
const sectionIdFromDomId = (domId: string): SectionId | null => {
  const match = domId.match(/^section-(\d+)$/);
  return match ? (parseInt(match[1], 10) as SectionId) : null;
};

export default function SectionScrollerComponent() {
  const [maxClearedSection, setMaxClearedSection] = useState<0 | SectionId>(0); // max cleared section
  const [currentSection, setCurrentSection] = useState<SectionId>(1);
  const [isCurrentSectionCleared, setCurrentSectionCleared] = useState(false);

  useEffect(() => setCurrentSectionCleared(maxClearedSection >= currentSection), [currentSection, maxClearedSection]);

  // keep current section in sync when scrolling
  useEffect(() => {
    const updateCurrentSection = () => {
      const newSection = readCurrentSectionFromDOM();
      if (newSection && newSection !== currentSection) {
        setCurrentSection(newSection);
      }
    };

    // Add scroll event listener
    const container = document.getElementById('container');
    if (container) container.addEventListener('scroll', updateCurrentSection);

    // initially set the current section
    updateCurrentSection();

    // remove event listener on cleanup
    return () => {
      if (container) container.removeEventListener('scroll', updateCurrentSection);
    };
  }, [currentSection]);

  function readCurrentSectionFromDOM(): SectionId | null {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= scrollPosition && rect.bottom >= scrollPosition) {
        return sectionIdFromDomId(section.id);
      }
    }
    return null;
  }

  function scrollToSection(sectionId: SectionId) {
    const section = document.getElementById(domIdFromSectionId(sectionId));
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function scrollToNextPrev(direction: 'next' | 'previous') {
    if (!currentSection) return;

    const sections = Array.from(document.querySelectorAll('section'));
    const currentIndex = sections.findIndex((section) => sectionIdFromDomId(section.id) === currentSection);

    let targetIndex;
    if (direction === 'next') {
      targetIndex = currentIndex + 1 < sections.length ? currentIndex + 1 : currentIndex; // stay on last section
    } else {
      targetIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : currentIndex; // stay on first section
    }

    const sectionId = sectionIdFromDomId(sections[targetIndex].id);
    if (sectionId) scrollToSection(sectionId);
  }

  function scrollToNext() {
    scrollToNextPrev('next');
  }

  function scrollToPrev() {
    scrollToNextPrev('previous');
  }

  return (
    <div id="container" className="h-screen snap-y snap-mandatory overflow-y-auto">
      <div className="absolute right-5 bottom-5">
        <Button className="button m-3" onClick={() => scrollToPrev()} disabled={currentSection === 1}>
          Previous
        </Button>
        <Button className="button m-3" onClick={() => scrollToNext()} disabled={currentSection === 3 || !isCurrentSectionCleared}>
          Next
        </Button>
      </div>
      <section id="section-1" className="h-screen snap-start overflow-y-auto bg-red-100 p-4">
        <h1>Section A</h1>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
          aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
          auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
        </p>
        <Button onClick={() => (setMaxClearedSection(1), setTimeout(() => scrollToNext()))}>Clear A!</Button>
      </section>
      {maxClearedSection >= 1 && (
        <section id="section-2" className="h-screen snap-start overflow-y-auto bg-green-100 p-4">
          <p style={{ height: '300px', width: '50%', margin: '0 auto' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, nisi eget convallis facilisis, nunc nisl aliquet nunc, eget
            aliquam nisl nunc eget nunc. Donec auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc. Donec
            auctor, nisl eget aliquam consectetur, nisl nunc aliquet nunc, eget aliquam nisl nunc eget nunc.
          </p>

          <Button onClick={() => (setMaxClearedSection(2), setTimeout(() => scrollToNext()))}>Clear B!</Button>
        </section>
      )}
      {maxClearedSection >= 2 && (
        <section id="section-3" className="h-screen snap-start overflow-y-auto bg-blue-100 p-4">
          <h1>Section C</h1>
          <Button onClick={() => (setMaxClearedSection(3), setTimeout(() => scrollToNext()))}>Clear C!</Button>
        </section>
      )}
    </div>
  );
}
