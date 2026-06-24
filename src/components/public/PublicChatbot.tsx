"use client";

import { useState, type FormEvent } from "react";
import {
ArrowUpRight,
Bot,
MessageCircle,
Send,
Sparkles,
Volume2,
X,
} from "lucide-react";

type ChatMessage = {
id: string;
sender: "assistant" | "visitor";
text: string;
link?: {
label: string;
href: string;
external?: boolean;
};
};

type BrowserWindow = Window &
typeof globalThis & {
webkitAudioContext?: typeof AudioContext;
};

const quickQuestions = [
"Horaires des cultes",
"Où se trouve l’église ?",
"Regarder en direct",
"Comment nous rejoindre ?",
"Découvrir l’École",
"Dons et offrandes",
];

const initialMessages: ChatMessage[] = [
{
id: "welcome",
sender: "assistant",
text: "Bonjour et bienvenue à CEF Parole de Vie. Je peux vous orienter sur les cultes, l’adresse, les programmes et les démarches pour rejoindre l’église.",
},
];

function createMessageId() {
return `${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function normalizeText(value: string) {
return value
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.toLowerCase()
.trim();
}

function getAnswer(question: string) {
const text = normalizeText(question);

if (
text.includes("direct") ||
text.includes("youtube") ||
text.includes("live") ||
text.includes("regarder")
) {
return {
text: "Vous pouvez suivre les cultes et enseignements de CEF La Parole de Vie sur notre chaîne YouTube officielle.",
link: {
label: "Ouvrir la chaîne YouTube",
href: "https://www.youtube.com/@CEFLAPAROLEDEVIE",
external: true,
},
};
}

if (
text.includes("horaire") ||
text.includes("culte") ||
text.includes("dimanche")
) {
return {
text: "Le culte du dimanche se tient de 08h00 à 11h30. Les études bibliques ont lieu le mercredi de 18h00 à 19h30 et le temps de prière le vendredi de 18h00 à 19h00.",
};
}

if (
text.includes("adresse") ||
text.includes("trouve") ||
text.includes("localisation") ||
text.includes("limete")
) {
return {
text: "CEF Parole de Vie est située à Limete, à Kinshasa, en République Démocratique du Congo.",
};
}

if (
text.includes("rejoindre") ||
text.includes("nouveau") ||
text.includes("integrer") ||
text.includes("inscription")
) {
return {
text: "Vous pouvez remplir le formulaire d’intégration afin que l’équipe de l’église puisse vous accueillir et vous accompagner.",
link: {
label: "Nous rejoindre",
href: "/rejoindre",
},
};
}

if (
text.includes("ecole") ||
text.includes("enfant") ||
text.includes("inscrire mon enfant")
) {
return {
text: "L’École Chrétienne Parole du Salut accompagne les élèves dans leur formation académique et spirituelle.",
link: {
label: "Découvrir l’École",
href: "/ecole",
},
};
}

if (
text.includes("don") ||
text.includes("offrande") ||
text.includes("contribution")
) {
return {
text: "Vous pouvez consulter les informations relatives aux dons et offrandes sur la page dédiée.",
link: {
label: "Dons et offrandes",
href: "/dons",
},
};
}

if (text.includes("vision") || text.includes("eglise")) {
return {
text: "CEF Parole de Vie est une communauté de foi, d’adoration et de transformation. Découvrez notre vision, nos valeurs et notre histoire.",
link: {
label: "Découvrir l’église",
href: "/vision",
},
};
}

if (text.includes("priere")) {
return {
text: "Le temps de prière communautaire a lieu le vendredi de 18h00 à 19h00. Le formulaire confidentiel de demande de prière sera bientôt disponible sur cette plateforme.",
};
}

if (text.includes("rendez") || text.includes("temoignage")) {
return {
text: "Les formulaires de rendez-vous pastoral et de témoignage seront ajoutés prochainement afin de permettre un suivi confidentiel par l’équipe de l’église.",
};
}

return {
text: "Je peux vous renseigner sur les cultes, l’adresse, la chaîne YouTube, l’intégration, l’école ou les dons. Sélectionnez une question ci-dessous ou reformulez votre demande.",
};
}

function playClickTone(type: "open" | "reply") {
if (typeof window === "undefined") return;

const browserWindow = window as BrowserWindow;
const AudioContextClass =
browserWindow.AudioContext || browserWindow.webkitAudioContext;

if (!AudioContextClass) return;

const audioContext = new AudioContextClass();
const oscillator = audioContext.createOscillator();
const gain = audioContext.createGain();
const now = audioContext.currentTime;

oscillator.type = "sine";
oscillator.frequency.setValueAtTime(type === "open" ? 640 : 500, now);

if (type === "reply") {
oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.13);
}

gain.gain.setValueAtTime(0.0001, now);
gain.gain.exponentialRampToValueAtTime(0.07, now + 0.015);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

oscillator.connect(gain);
gain.connect(audioContext.destination);

oscillator.start(now);
oscillator.stop(now + 0.2);

window.setTimeout(() => {
void audioContext.close();
}, 300);
}

export default function PublicChatbot() {
const [isOpen, setIsOpen] = useState(false);
const [draft, setDraft] = useState("");
const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

function openOrCloseChat() {
if (!isOpen) {
playClickTone("open");
}

setIsOpen((current) => !current);

}

function addQuestion(question: string) {
const cleanedQuestion = question.trim();

if (!cleanedQuestion) return;

const answer = getAnswer(cleanedQuestion);

setMessages((current) => [
  ...current,
  {
    id: createMessageId(),
    sender: "visitor",
    text: cleanedQuestion,
  },
  {
    id: createMessageId(),
    sender: "assistant",
    text: answer.text,
    link: answer.link,
  },
]);

setDraft("");
playClickTone("reply");

}

function submitQuestion(event: FormEvent<HTMLFormElement>) {
event.preventDefault();
addQuestion(draft);
}

return ( <div className="fixed bottom-5 right-5 z-[120] font-sans">
{isOpen && ( <section className="absolute bottom-16 right-0 w-[calc(100vw-2.5rem)] overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white shadow-2xl shadow-blue-950/25 sm:w-[390px]"> <div className="flex items-center justify-between bg-gradient-to-r from-[#061d45] to-[#0a56a4] px-5 py-4 text-white"> <div className="flex items-center gap-3"> <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15"> <Bot size={22} /> </div>

          <div>
            <p className="font-black">Assistant PDV</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-blue-100">
              <Volume2 size={13} />
              Assistant d’orientation
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openOrCloseChat}
          className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Fermer le chatbot"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-h-[350px] space-y-4 overflow-y-auto bg-[#f7faff] p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "visitor"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.sender === "visitor"
                  ? "rounded-br-md bg-[#0a56a4] text-white"
                  : "rounded-bl-md border border-blue-100 bg-white text-slate-700"
              }`}
            >
              {message.text}

              {message.link && (
                <a
                  href={message.link.href}
                  target={message.link.external ? "_blank" : undefined}
                  rel={message.link.external ? "noreferrer" : undefined}
                  className="mt-3 inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-extrabold text-[#0a56a4] transition hover:bg-blue-100"
                >
                  {message.link.label}
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-blue-50 bg-white p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => addQuestion(question)}
              className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-[#0a56a4] transition hover:bg-blue-100"
            >
              {question}
            </button>
          ))}
        </div>

        <form onSubmit={submitQuestion} className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Écrivez votre question..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a56a4] text-white transition hover:bg-[#082f68] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Envoyer la question"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  )}

  <button
    type="button"
    onClick={openOrCloseChat}
    className="group inline-flex items-center gap-3 rounded-full bg-[#0a56a4] px-4 py-3 text-white shadow-xl shadow-blue-950/30 transition hover:-translate-y-1 hover:bg-[#082f68]"
    aria-label="Ouvrir l’assistant PDV"
  >
    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
      <MessageCircle size={22} />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0a56a4] bg-emerald-400" />
    </span>

    <span className="hidden text-left sm:block">
      <span className="block text-sm font-black">Assistant PDV</span>
      <span className="flex items-center gap-1 text-xs text-blue-100">
        <Sparkles size={12} />
        Une question ?
      </span>
    </span>
  </button>
</div>

);
}
