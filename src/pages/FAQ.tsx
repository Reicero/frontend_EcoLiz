import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { FAQItem } from '../types/page';
import { getFAQ } from '../services/wordpress';

function formatInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-cyan-700">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderAnswer(answer: string) {
  const blocks = answer.split(/\n{2,}/).filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block.split('\n').filter(Boolean);
    const gradeLines = lines.filter((line) =>
      /^(A\+|A|B)\s*:/.test(line.trim())
    );

    if (gradeLines.length > 0) {
      const introLines = lines.filter(
        (line) => !/^(A\+|A|B)\s*:/.test(line.trim())
      );

      return (
        <div key={blockIndex} className="space-y-4">
          {introLines.map((line, index) => (
            <p key={index} className="text-brand-900/75 leading-relaxed">
              {formatInline(line)}
            </p>
          ))}

          <div className="grid gap-3 sm:grid-cols-3">
            {gradeLines.map((line) => {
              const [label, ...descriptionParts] = line.split(':');
              const description = descriptionParts.join(':').trim();

              return (
                <div
                  key={label}
                  className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4"
                >
                  <p className="text-lg font-black text-cyan-700">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-brand-900/70">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <p key={blockIndex} className="text-brand-900/75 leading-relaxed">
        {formatInline(block)}
      </p>
    );
  });
}

export function FAQ() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    getFAQ().then(setItems);
  }, []);

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
            FAQ
          </p>

          <h1 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight">
            Questions fréquentes
          </h1>

          <p className="mt-5 text-brand-900/65 max-w-2xl mx-auto leading-relaxed">
            Retrouvez les réponses aux questions les plus fréquentes sur le
            reconditionnement, les grades, les garanties, le thermocollage et
            les services EcoLiz.
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-[0_14px_40px_rgba(8,47,73,0.08)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left transition hover:bg-cyan-50/50"
                  aria-expanded={isOpen}
                >
                  <div>
                    <span className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-700">
                      {item.category}
                    </span>

                    <h2 className="text-lg sm:text-xl font-bold text-brand-950">
                      {item.question}
                    </h2>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-950 text-xl font-light text-white">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-brand-100 px-6 py-6">
                    <div className="space-y-5">{renderAnswer(item.answer)}</div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl bg-gradient-to-r from-brand-950 to-sky-900 p-8 text-center text-white shadow-[0_18px_50px_rgba(8,47,73,0.22)]">
          <h2 className="text-2xl font-bold">
            Une autre question ?
          </h2>

          <p className="mt-3 text-sm leading-6 text-sky-100/80">
            Notre équipe peut vous accompagner pour un besoin spécifique, une
            commande, une reprise de parc ou une demande de devis.
          </p>

          <Link
            to="/contact"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-950 transition hover:scale-105"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </section>
  );
}
