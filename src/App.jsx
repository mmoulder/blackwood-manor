import { useState, useEffect, useRef } from "react";
import { syncTeamProgress } from "./useGameSync";
import Leaderboard from "./Leaderboard";

// ============================================================
// GAME DATA — COMPLEX VERSION
// Two intertwined crimes: murder + will forgery
// Killer: Victoria Ashworth (poison) aided by Fenwick (forged will)
// Red herrings: Harwick looks guilty (stolen medals, fake alibi)
// ============================================================

const SUSPECTS = [
  {
    name: "Victoria Ashworth",
    role: "Niece & Estate Accountant",
    avatar: "V",
    unlockAfterClue: 0,
    system: `You are Victoria Ashworth, Lord Blackwood's niece and estate accountant at Blackwood Manor in 1924 England. You are GUILTY of murder — you poisoned Lord Blackwood's brandy with arsenic to prevent him exposing your embezzlement of £64,000. You also conspired with Fenwick to forge a new will naming you sole heir. Stay completely in character. Speak in clipped, elegant 1920s British English. Be cold and deflective. Never confess. If pressed about the ledger, claim it was "administrative error." If asked about your alibi, say you were in your room reading Tennyson. If asked about the gloves, claim they belong to Mrs. Doyle. If asked about the red shawl, change the subject. Respond in 3-5 sentences only.`,
  },
  {
    name: "Mr. Silas Fenwick",
    role: "Family Solicitor",
    avatar: "F",
    unlockAfterClue: 2,
    system: `You are Silas Fenwick, the Blackwood family solicitor in 1924 England. You are GUILTY as an accomplice — you forged a new will naming Victoria sole heir in exchange for £8,000. You did NOT administer the poison; that was Victoria alone. You are terrified of being caught. Speak nervously, over-precisely, in 1920s British legal language. Deny any knowledge of the murder. If asked about the will, insist the new will is entirely legitimate and properly witnessed. If asked who witnessed it, name "a Mr. Aldous Crane" — who does not exist. Become very flustered if asked about Crane's address or credentials. Respond in 3-5 sentences only.`,
  },
  {
    name: "Colonel Harwick",
    role: "Family Friend & War Veteran",
    avatar: "H",
    unlockAfterClue: 0,
    system: `You are Colonel Reginald Harwick, an old war companion of Lord Blackwood in 1924 England. You are INNOCENT of murder but GUILTY of theft — you stole Lord Blackwood's Victoria Cross and campaign medals to pay gambling debts, and you lied about your card-game alibi to hide this. You are blusterous, proud, and evasive about the medals specifically. Loudly protest your innocence of murder (truthfully). If asked about your alibi, insist you played cards with Fenwick (a lie). If asked about the medals cabinet, become angry and change subject. You genuinely have no idea who killed Blackwood. Respond in 3-5 sentences only.`,
  },
  {
    name: "Mrs. Agnes Doyle",
    role: "Head Housekeeper",
    avatar: "D",
    unlockAfterClue: 3,
    system: `You are Mrs. Agnes Doyle, head housekeeper at Blackwood Manor in 1924 England. You are INNOCENT. You saw Victoria Ashworth near the study at 9:30pm wearing her red shawl and white gloves but have not told police out of misplaced loyalty to the family. You also discovered the ledger discrepancies three months ago and told Lord Blackwood privately — you feel guilty this may have triggered the murder. Speak protectively of the family. If asked what you saw, be vague initially. If pressed three times specifically about that evening, reluctantly admit you saw someone in a red shawl near the study. If asked about the ledger, admit you brought it to Lord Blackwood's attention. Respond in 3-5 sentences only.`,
  },
  {
    name: "Dr. Reginald Pembrook",
    role: "Family Physician",
    avatar: "P",
    unlockAfterClue: 4,
    system: `You are Dr. Reginald Pembrook, the Blackwood family physician in 1924 England. You are INNOCENT. You performed the post-mortem and confirmed arsenic poisoning. You also noticed something disturbing: Lord Blackwood had recently updated his will — and the new one, which you witnessed signing, was signed on a Tuesday. But Lord Blackwood told you he planned to update his will "next Thursday." This contradiction troubles you greatly. Speak in precise medical and professional language. If asked about the cause of death, give clinical details. If asked about the will, share your Tuesday versus Thursday concern directly. Respond in 3-5 sentences only.`,
  },
  {
    name: "Thomas Briggs",
    role: "Head Gardener",
    avatar: "T",
    unlockAfterClue: 5,
    system: `You are Thomas Briggs, head gardener at Blackwood Manor in 1924 England. You are INNOCENT. You saw a figure in a red shawl climb through the study window at approximately 9:30pm on the night of the murder. You also found a crumpled receipt near the rose beds the following morning — it was from Whitmore and Sons Chemist for arsenious oxide. You kept the receipt because you did not know what to do with it. If asked what you saw, describe the figure precisely: slight build, female, red shawl, moved quickly, came from the direction of the orangery. If asked about the receipt, describe it and offer to produce it. Respond in 3-5 sentences only.`,
  },
];

const CLUE_CHAIN = [
  {
    id: 1, icon: "🥃", location: "The Study — Lord Blackwood's Writing Desk",
    evidence: "The brandy decanter on Lord Blackwood's desk is missing nearly a third of its contents, yet only one glass was poured according to the butler. The glass itself bears two sets of fingerprints: one large (Lord Blackwood's) and one small, suggesting the glass was handled by someone else before being placed on the desk. A faint crystalline residue coats the inside of the decanter stopper.",
    puzzle: {
      type: "riddle", title: "OPENING EXAMINATION",
      question: "The crystalline residue in the decanter is the murder weapon. It is a heavy metal compound used widely in 1920s England as a pesticide, sold legally at chemists under the name 'rat poison.' It is odourless and tasteless in small quantities dissolved in alcohol.\n\nIt was the weapon of choice for Victorian poisoners and appears in dozens of criminal cases of the era.\n\nName the specific compound. One word, seven letters.",
      hint: "Chemical symbol As. Number 33 on the periodic table. Famous Victorian poisoners used it. Ends in '-ic'.",
      answer: "arsenic", acceptedAnswers: ["arsenic"],
      redHerring: null,
    },
  },
  {
    id: 2, icon: "📜", location: "The Fireplace — Partially Burned Documents",
    evidence: "Three fragments of paper were retrieved from the fireplace grate before the fire was fully extinguished. Fragment A reads: '...I have engaged a solicitor of my own to examine the...' Fragment B reads: '...you have until the 14th to make restitution or I shall have no choice but to contact Scotland...' Fragment C reads: '...the accounts will not bear scrutiny much longer...' The 14th was two days after the murder.",
    puzzle: {
      type: "sequence", title: "DOCUMENT RECONSTRUCTION",
      question: "The three fragments must be assembled in correct chronological order to reveal the full threat. Each fragment was written at a different stage of the confrontation.\n\nFragment A: Lord Blackwood engages independent legal scrutiny\nFragment B: Lord Blackwood issues a final ultimatum with a deadline\nFragment C: Lord Blackwood discovers the accounts are suspicious\n\nArrange them in the correct logical sequence. Enter three letters, e.g. BAC",
      hint: "Think about what Blackwood would do first: discover the problem, then investigate, then warn.",
      answer: "cab", acceptedAnswers: ["cab", "c a b", "c,a,b", "c-a-b"],
      redHerring: null,
    },
  },
  {
    id: 3, icon: "📒", location: "The Estate Office — Financial Ledger",
    evidence: "The Blackwood estate ledger for the past 14 months shows systematic irregularities. The withdrawals below have been identified as fraudulent — each signed with a forged version of Lord Blackwood's signature. A forensic accountant has flagged these amounts:\n\nJan: £3,200  Feb: £2,400  Mar: £2,800  Apr: £3,600\nMay: £4,100  Jun: £3,300  Jul: £3,900  Aug: £4,800\nSep: £5,400  Oct: £4,200  Nov: £6,200  Dec: £8,100\nJan(II): £6,300  Feb(II): £5,700",
    puzzle: {
      type: "math", title: "FORENSIC ACCOUNTING",
      question: "Scotland Yard's financial crimes unit needs three figures to file charges:\n\n1. What is the TOTAL amount embezzled across all 14 entries?\n2. What is the AVERAGE monthly withdrawal? (round to nearest whole pound)\n3. In which month did withdrawals FIRST exceed £5,000?\n\nEnter your answer as three values separated by commas:\ne.g. 50000, 3000, September",
      hint: "Add all 14 figures for the total. Divide by 14 for average. Scan month by month: first to exceed £5,000 is the answer to question 3.",
      answer: "64000,4571,september", acceptedAnswers: ["64000,4571,september","64000, 4571, september","£64000,£4571,september","64,000,4,571,september","64000,4571,sep","64000 4571 september"],
      redHerring: null,
    },
  },
  {
    id: 4, icon: "🧤", location: "Behind the Study Bookcase — Hidden Panel",
    evidence: "A concealed panel behind the third shelf of the study bookcase was discovered by Inspector Graves. Inside: a pair of white evening gloves (size small, ladies'), a folded receipt, and a torn page from what appears to be a personal diary. The gloves carry traces of arsenious oxide at the fingertips. The diary page reads: 'He suspects. The ledger will be his evidence against me. I must act before the 14th. S.F. has agreed to the arrangement — the new document will be ready by Thursday. All that remains is the other matter.'",
    puzzle: {
      type: "deduction", title: "THE DIARY PAGE",
      question: "The diary page contains three critical revelations. Identify all three:\n\n1. The initials 'S.F.' refer to which suspect? (Full name)\n2. 'The new document' almost certainly refers to what legal instrument?\n3. 'The other matter' is a euphemism for what action the writer is planning?\n\nEnter your three answers separated by commas:\ne.g. John Smith, lease agreement, robbery",
      hint: "S.F. = initials of the family solicitor. A new document in an estate legal context = a will. The other matter follows discussion of preventing exposure — what must be done to silence Blackwood permanently?",
      answer: "silas fenwick, will, murder",
      acceptedAnswers: ["silas fenwick,will,murder","fenwick,will,murder","mr fenwick,will,murder","silas fenwick, will, murder","fenwick, will, murder","silas fenwick,new will,murder","fenwick,new will,murder"],
      keywordGroups: [
        ["fenwick"],
        ["will","testament"],
        ["murder","kill","poison","death","assassinat","slay","slaying","homicide"],
      ],
      redHerring: null,
    },
  },
  {
    id: 5, icon: "⚖️", location: "Fenwick & Associates — Lord Blackwood's Will",
    evidence: "Two wills exist. WILL A (March 1921): Lord Blackwood's estate divided equally between niece Victoria Ashworth, the Blackwood Charitable Foundation, and the village church. WILL B (October 1924, three weeks before the murder): the entire estate valued at £380,000 bequeathed solely to Victoria Ashworth. Will B was witnessed by 'Mr. Aldous Crane' and countersigned by Fenwick. Scotland Yard cannot locate any record of an Aldous Crane in England or Wales.",
    puzzle: {
      type: "logic", title: "THE FORGED WILL",
      question: "You must determine which facts constitute direct evidence that Will B is forged. Evaluate these five facts:\n\n① Victoria stands to gain £380,000 under Will B versus roughly £127,000 under Will A.\n② Dr. Pembrook says Blackwood told him he planned to update his will 'next Thursday' — but Will B is dated a Tuesday.\n③ The signature on Will B has 23% more ink pressure than Blackwood's authenticated signatures.\n④ The ink on Will B is a modern synthetic compound not available until 1923, yet the will uses a 1920 pen nib pattern.\n⑤ 'Aldous Crane' cannot be traced in any census, electoral roll, or professional register.\n\nWhich THREE facts constitute direct forensic or testimonial evidence of forgery, as opposed to circumstantial motive? Enter as three numbers separated by commas.",
      hint: "Ask which facts directly prove the document is physically fake or fraudulently witnessed. Fact 1 is motive only. Fact 3 is suspicious but could reflect illness or different writing posture.",
      answer: "2,4,5", acceptedAnswers: ["2,4,5","2, 4, 5","two,four,five","facts 2,4,5","②④⑤","② ④ ⑤"],
      redHerring: "Fact 1 establishes motive but does not prove the document is forged. Fact 3 is suspicious but not conclusive on its own.",
    },
  },
  {
    id: 6, icon: "🃏", location: "The Billiards Room — Colonel Harwick's Evidence",
    evidence: "On the billiards table: a half-played hand of whist, a whisky tumbler, and Harwick's pocket watch (stopped at 11:47pm). Beneath the card table: a pawn ticket from Craddock's of Salisbury, dated the night of the murder, for 'three military decorations incl. Victoria Cross — value £85.' Lord Blackwood's medals cabinet in the study is empty. Harwick's alibi: played cards with Fenwick from 8pm to midnight. Fenwick denies this entirely.",
    puzzle: {
      type: "logic_grid", title: "THE ALIBI MATRIX",
      question: "Four people make statements about their whereabouts between 9pm and 10:30pm — the window of the murder.\n\n• Harwick: 'I was in the billiards room with Fenwick the whole evening.'\n• Fenwick: 'I was alone in the library reviewing documents. Harwick is lying.'\n• Mrs. Doyle: 'I was in the kitchen until 10pm. I saw Fenwick in the library at 9:45pm.'\n• Victoria: 'I was in my room reading all evening. I saw no one.'\n\nMrs. Doyle's testimony is corroborated by the kitchen maid, who was with her in the kitchen the entire evening.\n\nAnswer three questions:\n① Who is PROVABLY lying?\n② Who has NO alibi at all?\n③ Whose alibi is corroborated by an INDEPENDENT witness — that is, someone other than the four people listed above?\n\nEnter three surnames separated by commas.",
      hint: "If Mrs. Doyle saw Fenwick in the library at 9:45pm, Harwick's claim of being with Fenwick is false. Victoria has no witness at all. Only Mrs. Doyle has corroboration from outside the four suspects (the kitchen maid).",
      answer: "harwick,victoria,doyle", acceptedAnswers: ["harwick,victoria,doyle","harwick, victoria, doyle","harwick victoria doyle","colonel harwick,victoria,mrs doyle"],
      redHerring: "Harwick's lie concerns the medal theft, not the murder. He is guilty of theft but innocent of killing.",
    },
  },
  {
    id: 7, icon: "🔐", location: "Whitmore & Sons Chemist — Purchase Records",
    evidence: "Records from Whitmore & Sons Chemist confirm: on October 29th, four days before the murder, two separate purchases of arsenious oxide were made. Purchase 1: 2oz signed 'V. Ashworth.' Purchase 2: 1oz signed with an illegible initial. The chemist recalls the second buyer was a 'nervous, thin gentleman in a dark coat' who paid in cash and seemed agitated. A coded entry appears in Whitmore's private suspicion log next to the second purchase.",
    puzzle: {
      type: "cipher", title: "THE CODED PURCHASE LOG",
      question: "Whitmore encoded the second buyer's surname using a simple letter-shift cipher. Each letter is shifted forward by 5 positions in the alphabet (A becomes F, B becomes G, etc.).\n\nEncoded surname: KJSBNHP\n\nDecode it. What is the surname of the second buyer?",
      hint: "Shift each letter BACK by 5 positions: K→F, J→E, S→N, B→W (wraps), N→I, H→C, P→K. The answer is the nervous solicitor's surname.",
      answer: "fenwick", acceptedAnswers: ["fenwick","mr fenwick","silas fenwick"],
      redHerring: null,
    },
  },
  {
    id: 8, icon: "👁️", location: "The East Garden — Gardener's Full Statement",
    evidence: "Thomas Briggs's full statement, taken under oath: 'I was pruning the Duchess of Edinburgh roses along the east wall at approximately half nine in the evening — the church clock had just struck the half hour. I saw a figure approach from the direction of the orangery, moving quickly. The figure was of slight build, female I believe, wearing a long crimson shawl. She went directly to the study window — the lower pane was already unlatched — and climbed through. She was inside for perhaps thirty to forty minutes. When she left, she went back the way she came. She was carrying something small in her right hand. I did not come forward sooner because Miss Ashworth has always been kind to me.'",
    puzzle: {
      type: "timeline", title: "RECONSTRUCTING THE TIMELINE",
      question: "Using all evidence gathered, place these six events in correct chronological order for the night of November 2nd, 1924:\n\n[A] Lord Blackwood drinks the poisoned brandy\n[B] Victoria climbs back out through the study window\n[C] Victoria unlatchs the study window from inside earlier that day\n[D] Victoria enters through the unlatched window at 9:30pm\n[E] Lord Blackwood is found dead by the butler at 11pm\n[F] Victoria pours arsenic into the brandy decanter\n\nEnter the correct order as six letters with no spaces:",
      hint: "The window must be prepared before she enters from outside. She enters, then poisons the decanter, Blackwood drinks it, she departs, he dies later when alone.",
      answer: "cdfabe", acceptedAnswers: ["cdfabe","c,d,f,a,b,e","c d f a b e"],
      redHerring: null,
    },
  },
  {
    id: 9, icon: "🗝️", location: "Victoria's Room — The False-Bottom Dresser",
    evidence: "A concealed compartment in Victoria's dressing table contains: (1) a folded note in Victoria's handwriting reading 'S.F. — destroy after Thursday. The arrangement stands. V.A.' (2) a bank draft for £8,000 made out to 'S. Fenwick' dated October 28th (3) a pawn ticket from Pemberton & Hodge of London, dated October 12th, for 'one emerald brooch — value £45' (4) a half-used box labelled 'Arsenious Oxide — Whitmore and Sons' with approximately 1oz removed (5) Victoria's red shawl which under ultraviolet light shows soil traces consistent with the Blackwood Manor east garden rose beds.",
    puzzle: {
      type: "multi_deduction", title: "THE CONSPIRACY EVIDENCE",
      question: "Scotland Yard requires each piece of evidence to be matched to the specific legal element it proves. Beware: ONE item, though hidden, proves nothing material to the case against Victoria.\n\nITEMS:\n① The handwritten note to S.F.\n② The £8,000 bank draft\n③ The pawn ticket for the emerald brooch\n④ The arsenious oxide box\n⑤ The red shawl with east-garden soil\n\nELEMENTS:\n[W] Documentary proof of mutual criminal intent between two parties\n[X] Physical trace evidence placing the suspect at the crime scene\n[Y] Possession of the means to commit the act, prior to the act itself\n[Z] Financial consideration provided to a co-conspirator\n\nMatch each item to the element it proves — or mark it with a dash (—) if it proves nothing material. Enter as five pairs, e.g. 1W,2X,3—,4Y,5Z",
      hint: "Read each element carefully — they are written in legal language, not plain English. The note speaks of an 'arrangement.' The shawl carries soil from the scene of the act. One item, though concealed, concerns a private financial matter unrelated to the conspiracy.",
      answer: "1W,2Z,3—,4Y,5X",
      acceptedAnswers: [
        "1w,2z,3—,4y,5x","1W,2Z,3—,4Y,5X","1w, 2z, 3—, 4y, 5x",
        "1w,2z,3-,4y,5x","1W,2Z,3-,4Y,5X","1w, 2z, 3-, 4y, 5x",
        "1w,2z,3none,4y,5x","1w,2z,3n,4y,5x",
        "①w,②z,③—,④y,⑤x","①w,②z,③-,④y,⑤x",
      ],
      redHerring: "The pawn ticket shows Victoria was quietly raising cash, but the brooch was pawned in London a fortnight before the murder and has no documented link to Fenwick, the weapon, or the scene. It establishes nothing material to the conspiracy.",
    },
  },
  {
    id: 10, icon: "⚰️", location: "Scotland Yard — Inspector's Final Briefing",
    evidence: "All evidence is now assembled. Inspector Graves summarises: Lord Blackwood discovered the embezzlement via the estate ledger. He confronted Victoria by letter and engaged his own solicitor. Victoria conspired with Fenwick to forge a new will and eliminate Blackwood before he could act. She purchased arsenic, prepared the window, entered at 9:30pm, poisoned the brandy, and left. Fenwick provided the forged will in exchange for £8,000. Harwick, guilty of medal theft, had no part in the murder. Mrs. Doyle's delayed testimony and Briggs's eyewitness account confirm the full timeline.",
    puzzle: {
      type: "final_logic", title: "THE FINAL DEDUCTION",
      question: "Inspector Graves poses one final logic test before charges are filed:\n\n'If Victoria acted alone in poisoning Blackwood, Fenwick would have had no motive to forge the will — he would gain nothing from a dead Blackwood unless Victoria inherited. Yet the will was forged three weeks before the murder. Therefore Fenwick knew of the murder plan in advance.'\n\nIs this argument:\n(A) Valid — the conclusion follows necessarily from the premises\n(B) Invalid — Fenwick could forge the will without knowing a murder was planned, believing only that Victoria wanted to update the will\n(C) Partially valid — the conclusion is probable but not logically certain\n\nAnswer with the letter AND a one-sentence explanation of your reasoning.",
      hint: "Consider: could Fenwick believe he was simply helping Victoria update a will legitimately, not knowing she intended to murder Blackwood first? If yes, the argument is not airtight.",
      answer: "c", 
      acceptedAnswers: ["c","(c)","c ","partially valid","c:","c—"],
      keywordGroups: [["c","partial"]],
      redHerring: "B is also defensible — this is genuinely ambiguous. The model answer is C because the argument has logical force but is not watertight.",
    },
  },
];

const SOLUTION = {
  killer: "Victoria Ashworth",
  accomplice: "Mr. Silas Fenwick",
  weapon: "Arsenic",
  time: "9:30pm",
  motive_keywords: ["embezzl","steal","stole","stolen","theft","thief","thiev","fraud","pilfer","skim","forgery","forged"],
  full: `Victoria Ashworth embezzled £64,000 from the Blackwood estate over 14 months. When Lord Blackwood discovered the fraud and threatened to contact Scotland Yard, Victoria conspired with family solicitor Silas Fenwick to forge a new will naming her sole heir — paying him £8,000. On November 2nd, 1924, she purchased arsenic from Whitmore and Sons, unlatched the study window in advance, and entered the study at 9:30pm via the east garden wearing her red shawl and white gloves. She dissolved arsenic in the brandy decanter and departed. Lord Blackwood drank the brandy and was found dead at 11pm. Colonel Harwick, though guilty of stealing the Victoria Cross to pay gambling debts, played no part in the murder — his suspicious behaviour was a deliberate red herring.`,
};

const TEAMS = ["Team Raven","Team Falcon","Team Serpent","Team Wolf"];
const TEAM_COLORS = {"Team Raven":"#c084fc","Team Falcon":"#60a5fa","Team Serpent":"#34d399","Team Wolf":"#fb923c"};

async function askSuspect(suspectName, question, chatHistory) {
  const s = SUSPECTS.find(x => x.name === suspectName);
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: s.system,
      messages: [...chatHistory, { role: "user", content: question }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "I have nothing further to say.";
}

function Puzzle({ clue, onSolve, index, total }) {
  const [ans, setAns] = useState("");
  const [status, setStatus] = useState("idle");
  const [hint, setHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => { setAns(""); setStatus("idle"); setHint(false); setAttempts(0); }, [clue.id]);

  const check = () => {
    const norm = s => s.toLowerCase().replace(/\s+/g,"").replace(/[£,\.]/g,"");
    const clean = norm(ans.trim());
    let isCorrect;
    if (clue.puzzle.keywordGroups) {
      isCorrect = clue.puzzle.keywordGroups.every(group =>
        group.some(term => clean.includes(norm(term)))
      );
    } else {
      const accepted = clue.puzzle.acceptedAnswers.map(norm);
      isCorrect = accepted.includes(clean);
    }
    if (isCorrect) {
      setStatus("correct");
      setTimeout(onSolve, 1400);
    } else {
      setStatus("wrong");
      setAttempts(a => a+1);
      setTimeout(() => setStatus("idle"), 1600);
    }
  };

  const typeColors = { riddle:"#b08030", sequence:"#60a5fa", math:"#34d399", deduction:"#c084fc", logic:"#fb923c", logic_grid:"#f472b6", cipher:"#a78bfa", timeline:"#38bdf8", multi_deduction:"#fb923c", final_logic:"#cc2222" };
  const col = typeColors[clue.puzzle.type] || "#9070cc";

  return (
    <div className="pz-wrap">
      <div className="pz-prog">
        {Array.from({length:total}).map((_,i) => (
          <div key={i} className={`pip ${i<index?"done":i===index?"active":"locked"}`}/>
        ))}
        <span className="pz-step">CLUE {index+1} / {total}</span>
      </div>
      <div className="loc-tag">{clue.icon} {clue.location}</div>
      <div className="ev-box">
        <div className="ev-lbl">EVIDENCE</div>
        <p className="ev-txt">{clue.evidence}</p>
      </div>
      <div className="pz-box" style={{"--pc":col}}>
        <div className="pz-tag" style={{color:col}}>{clue.puzzle.title}</div>
        <p className="pz-q">{clue.puzzle.question}</p>
        {hint && clue.puzzle.redHerring && (
          <div className="rh-box">
            <span className="rh-lbl">⚠ RED HERRING NOTE</span>
            <span className="rh-txt">{clue.puzzle.redHerring}</span>
          </div>
        )}
        {hint && (
          <div className="hint-box">
            <span className="hint-lbl">💡 HINT</span>
            <span className="hint-txt">{clue.puzzle.hint}</span>
          </div>
        )}
        <div className="pz-row">
          <input className={`pz-input ${status}`} value={ans} onChange={e=>setAns(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Enter your answer..." disabled={status==="correct"}/>
          <button className="pz-btn" onClick={check} disabled={!ans.trim()||status==="correct"}>{status==="correct"?"✓":"SUBMIT"}</button>
        </div>
        <div className="pz-foot">
          {attempts>=1&&status!=="correct"&&<button className="hint-tog" onClick={()=>setHint(true)}>{hint?"Hint shown":`Show hint (${attempts} attempt${attempts>1?"s":""})`}</button>}
          {status==="wrong"&&<span className="msg-w">✗ Incorrect — re-examine the evidence</span>}
          {status==="correct"&&<span className="msg-ok">✓ Correct — next clue unlocked</span>}
        </div>
      </div>
    </div>
  );
}

function SolvedReview({ clue, index, solved, total, onNext, onAccuse }) {
  return (
    <div className="sr-wrap">
      <div className="sr-tag">✓ SOLVED</div>
      <div className="loc-tag">{clue.icon} {clue.location}</div>
      <div className="ev-box">
        <div className="ev-lbl">EVIDENCE</div>
        <p className="ev-txt">{clue.evidence}</p>
      </div>
      {solved < total && index+1 < total && <button className="next-btn" onClick={onNext}>{index+1<solved?"View Next Clue →":"Return to Active Puzzle →"}</button>}
      {solved >= total && (
        <div className="all-done">
          <p>🎉 All 10 clues solved. You have the evidence to name both criminals.</p>
          <button className="file-big" onClick={onAccuse}>FILE YOUR ACCUSATION →</button>
        </div>
      )}
    </div>
  );
}

function GameScreen({ player, onAccuse }) {
  const [tab, setTab] = useState("clues");
  const [idx, setIdx] = useState(0);
  const [solved, setSolved] = useState(0);
  const [suspect, setSuspect] = useState(null);
  const [chats, setChats] = useState({});
  const [q, setQ] = useState("");
  const [asking, setAsking] = useState(false);
  const [notes, setNotes] = useState("");
  const [flash, setFlash] = useState(null);
  const chatEnd = useRef(null);

  const active = CLUE_CHAIN[idx];

  const onSolve = () => {
    const newSolved = solved + 1;
    setSolved(newSolved);
    setFlash(`🔓 CLUE ${idx + 1} SOLVED`);
    setTimeout(() => setFlash(null), 2500);
    if (idx + 1 < CLUE_CHAIN.length) setIdx(idx + 1);
    syncTeamProgress(player.team, newSolved);
  };

  const getChat = n => chats[n]||[];

  const handleAsk = async () => {
    if (!q.trim()||asking) return;
    const question = q.trim(); setQ(""); setAsking(true);
    const hist = getChat(suspect);
    const upd = [...hist,{role:"user",content:question}];
    setChats(p=>({...p,[suspect]:upd}));
    try {
      const reply = await askSuspect(suspect,question,hist);
      setChats(p=>({...p,[suspect]:[...upd,{role:"assistant",content:reply}]}));
    } catch {
      setChats(p=>({...p,[suspect]:[...upd,{role:"assistant",content:"I find myself unable to continue at present."}]}));
    }
    setAsking(false);
    setTimeout(()=>chatEnd.current?.scrollIntoView({behavior:"smooth"}),100);
  };

  const unlocked = SUSPECTS.filter(s=>s.unlockAfterClue<=solved);

  return (
    <>
      <div className="screen game">
        {flash&&<div className="flash">{flash}</div>}
        <header className="hdr">
          <div className="hl"><span className="htitle">🕵 Blackwood Manor</span><span className="hpill red">OPEN CASE</span></div>
          <div className="hm"><span className="hpill" style={{"--tc":TEAM_COLORS[player.team]}}>{player.name} · {player.team}</span></div>
          <div className="hr"><span className="hcount">{solved}/{CLUE_CHAIN.length} solved</span><button className="haccuse" onClick={onAccuse}>FILE ACCUSATION →</button></div>
        </header>
        <nav className="tabs">
          {[{k:"clues",l:"🔍 Evidence Chain"},{k:"suspects",l:`👤 Suspects (${unlocked.length}/${SUSPECTS.length})`},{k:"notes",l:"📝 Notes"}].map(t=>(
            <button key={t.k} className={`tab ${tab===t.k?"on":""}`} onClick={()=>{setTab(t.k);setSuspect(null);}}>{t.l}</button>
          ))}
        </nav>
        <div className="tbody">
          {tab === "clues" && (
            <div className="clues-grid">
              <aside className="clue-sb">
                <div className="sb-hd">EVIDENCE LOG</div>
                {CLUE_CHAIN.map((c, i) => {
                  const isDone = i < solved, isAct = i === idx, isLocked = i >= solved;
                  return (
                    <button
                      key={c.id}
                      disabled={isLocked}
                      className={`sb-item ${isDone ? "sdone" : isAct ? "sact" : "slk"}`}
                      onClick={() => !isLocked && setIdx(i)}
                    >
                      <span className="sb-ic">{isLocked ? "🔒" : c.icon}</span>
                      <div>
                        <div className="sb-num">CLUE #{c.id}{isDone ? " ✓" : ""}</div>
                        <div className="sb-sub">{isLocked ? "Locked" : c.puzzle.title}</div>
                      </div>
                    </button>
                  );
                })}
              </aside>
              <main className="clue-main">
                {idx < solved ? (
                  <SolvedReview
                    clue={active}
                    index={idx}
                    solved={solved}
                    total={CLUE_CHAIN.length}
                    onNext={() => setIdx(i => Math.min(i + 1, CLUE_CHAIN.length - 1))}
                    onAccuse={onAccuse}
                  />
                ) : (
                  <Puzzle
                    clue={active}
                    onSolve={onSolve}
                    index={idx}
                    total={CLUE_CHAIN.length}
                  />
                )}
              </main>
            </div>
          )}

          {tab === "suspects" && !suspect && (
            <div className="sus-wrap">
              <p className="panel-intro">
                Interrogate witnesses and suspects. Some are locked until more evidence is uncovered.
              </p>
              {SUSPECTS.map(s => {
                const ok = s.unlockAfterClue <= solved;
                return (
                  <div
                    key={s.name}
                    className={`sus-row ${ok ? "" : "sus-lk"}`}
                    onClick={() => ok && setSuspect(s.name)}
                  >
                    <div className={`sav ${ok ? "" : "dim"}`}>{ok ? s.avatar : "?"}</div>
                    <div className="si">
                      <div className="sn">{ok ? s.name : "??? — Identity Locked"}</div>
                      <div className="sr2">{ok ? s.role : `Unlocks after clue ${s.unlockAfterClue}`}</div>
                      {ok && (
                        <div className="sq">
                          {getChat(s.name).filter(m => m.role === "user").length} questions asked
                        </div>
                      )}
                    </div>
                    {ok && <div className="sarr">›</div>}
                    {!ok && <div>🔒</div>}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "suspects" && suspect && (
            <div className="interro">
              <button className="back-lnk" onClick={() => setSuspect(null)}>
                ← All suspects
              </button>
              <div className="int-hdr">
                <div className="sav lg">{SUSPECTS.find(s => s.name === suspect)?.avatar}</div>
                <div>
                  <div className="sn lg">{suspect}</div>
                  <div className="sr2">
                    {SUSPECTS.find(s => s.name === suspect)?.role} · Under interrogation
                  </div>
                </div>
              </div>
              <div className="chat-area">
                {getChat(suspect).length === 0 && (
                  <div className="chat-mt">
                    The suspect regards you with a measured expression. Begin your questioning...
                  </div>
                )}
                {getChat(suspect).map((m, i) => (
                  <div key={i} className={`bbl ${m.role}`}>
                    <div className="bwho">
                      {m.role === "user" ? `🕵 ${player.name}` : `💬 ${suspect}`}
                    </div>
                    <div className="btxt">{m.content}</div>
                  </div>
                ))}
                {asking && (
                  <div className="bbl assistant">
                    <div className="bwho">💬 {suspect}</div>
                    <div className="btxt dots-a">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={chatEnd} />
              </div>
              <div className="qbar">
                <input
                  className="qin"
                  placeholder={`Ask ${suspect.split(" ")[0]} something...`}
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAsk()}
                  disabled={asking}
                />
                <button
                  className="qsend"
                  onClick={handleAsk}
                  disabled={asking || !q.trim()}
                >
                  {asking ? "…" : "ASK"}
                </button>
              </div>
            </div>
          )}

          {tab === "notes" && (
            <div className="notes-wrap">
              <p className="panel-intro">
                Record your team's deductions. Copy and share with teammates over your video call.
              </p>
              <textarea
                className="notes-ta"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={"Clues solved:\n\nSuspect notes:\n- Victoria:\n- Fenwick:\n- Harwick:\n- Mrs. Doyle:\n- Dr. Pembrook:\n- Briggs:\n\nKey deductions:\n\nFinal accusation plan:"}
              />
              <div className="notes-ft">
                <span>{notes.length} chars</span>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(notes)}>
                  📋 Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Leaderboard />
    </>
  );
}

function AccuseScreen({ player, onBack }) {
  const [killer, setKiller] = useState("");
  const [accomplice, setAccomplice] = useState("");
  const [weapon, setWeapon] = useState("");
  const [time, setTime] = useState("");
  const [motive, setMotive] = useState("");
  const [result, setResult] = useState(null);

  const submit = () => {
    const correct = killer === SOLUTION.killer &&
      accomplice === SOLUTION.accomplice &&
      weapon === SOLUTION.weapon &&
      time === SOLUTION.time &&
      SOLUTION.motive_keywords.some(k => motive.toLowerCase().includes(k));
    setResult({ correct, killer });
    syncTeamProgress(player.team, 10, { correct, killer, timestamp: Date.now() });
  };

  if (result) return (
    <div className="screen verdict">
      <div className={`vstamp ${result.correct?"vok":"vfail"}`}>{result.correct?"CASE CLOSED — GUILTY VERDICT":"ACCUSATION REJECTED"}</div>
      {result.correct?(
        <div className="vbody">
          <h2 className="vtitle">⚖️ Justice for Lord Blackwood</h2>
          <p className="vsub">{player.name} of {player.team} solved the case.</p>
          <div className="vsols">
            {[["PRIMARY KILLER",SOLUTION.killer],["ACCOMPLICE",SOLUTION.accomplice],["WEAPON",SOLUTION.weapon+" (dissolved in brandy)"],["ENTERED STUDY",SOLUTION.time],["LOCATION","The Study, via east garden window"]].map(([k,v])=>(
              <div key={k} className="vsol"><span className="vk">{k}</span><span className="vv">{v}</span></div>
            ))}
          </div>
          <div className="vepi"><div className="vepi-lbl">THE FULL ACCOUNT</div><p>{SOLUTION.full}</p></div>
        </div>
      ):(
        <div className="vbody">
          <h2 className="vtitle">❌ Wrong Accusation</h2>
          <p>Your accusation cannot be supported by the evidence as filed. All five elements must be correct: primary killer, accomplice, weapon, time of entry, and motive. Return and re-examine the clues.</p>
          <button className="vback" onClick={onBack}>← Continue Investigation</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="screen accuse-scr">
      <button className="back-lnk" onClick={onBack}>← Back to investigation</button>
      <h2 className="acc-title">FILE YOUR FORMAL ACCUSATION</h2>
      <p className="acc-sub">This case involves two criminals. Correctly identify both, the weapon, the time of entry, and the motive. All five must be correct to close the case.</p>
      <div className="acc-form">
        {[
          {label:"THE PRIMARY KILLER IS...", opts:SUSPECTS.map(s=>s.name), val:killer, set:setKiller},
          {label:"THE ACCOMPLICE IS...", opts:SUSPECTS.map(s=>s.name), val:accomplice, set:setAccomplice},
          {label:"THE MURDER WEAPON WAS...", opts:["Arsenic","Cyanide","Strychnine","Belladonna","Morphine"], val:weapon, set:setWeapon},
          {label:"THE KILLER ENTERED THE STUDY AT...", opts:["9:00pm","9:30pm","10:00pm","10:30pm","11:00pm"], val:time, set:setTime},
        ].map(({label,opts,val,set})=>(
          <div key={label} className="acc-field">
            <label className="field-lbl">{label}</label>
            <div className="acc-opts">{opts.map(o=><button key={o} className={`acc-opt ${val===o?"sel":""}`} onClick={()=>set(o)}>{o}</button>)}</div>
          </div>
        ))}
        <div className="acc-field">
          <label className="field-lbl">THE MOTIVE (be specific)</label>
          <textarea className="motive-ta" placeholder="What drove Victoria to commit murder? What role did Fenwick play and why?" value={motive} onChange={e=>setMotive(e.target.value)}/>
        </div>
        <button className="file-btn" disabled={!killer||!accomplice||!weapon||!time||!motive.trim()} onClick={submit}>⚖️ SUBMIT FORMAL ACCUSATION</button>
      </div>
    </div>
  );
}

function Lobby({ onStart }) {
  const [name, setName] = useState("");
  const [team, setTeam] = useState(null);
  return (
    <div className="screen lobby">
      <div className="lbg"/><div className="lrain"/>
      <div className="linner">
        <div className="ltcol">
          <div className="ley">A COMPLEX MURDER MYSTERY</div>
          <h1 className="lh1">Death<br/>at<br/>Blackwood<br/>Manor</h1>
          <div className="lred">☠ VICTIM: LORD EDMUND BLACKWOOD · NOV 2, 1924</div>
          <div className="lfeats">
            {["10 puzzle-gated evidence clues","6 suspects — some locked initially","Two criminals to identify","Cipher, logic, math & deduction challenges","Red herrings and false alibis","Final accusation requires 5 correct answers"].map(f=><div key={f} className="lf">{f}</div>)}
          </div>
        </div>
        <div className="lfcol">
          <div className="lform">
            <div className="lrow"><label className="field-lbl">DETECTIVE NAME</label><input className="linput" placeholder="Your name..." value={name} onChange={e=>setName(e.target.value)}/></div>
            <div className="lrow">
              <label className="field-lbl">SELECT TEAM</label>
              <div className="ltgrid">
                {TEAMS.map(t=>(
                  <button key={t} className={`ltbtn ${team===t?"on":""}`} style={{"--tc":TEAM_COLORS[t]}} onClick={()=>setTeam(t)}>
                    <span className="tdot"/>{t}
                  </button>
                ))}
              </div>
            </div>
            <button className="lenter" disabled={!name.trim()||!team} onClick={()=>onStart({name:name.trim(),team})}>ENTER THE MANOR →</button>
            <p className="lnote">Recommended: 60–90 minutes. Share your screen on Zoom and work through puzzles together as a team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("lobby");
  const [player, setPlayer] = useState(null);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;}
        body{background:#07060a;color:#d8d0e8;font-family:'IBM Plex Mono',monospace;font-size:13px;}
        .screen{min-height:100vh;}
        .lobby{display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:#07060a;min-height:100vh;padding:40px 20px;}
        .lbg{position:absolute;inset:0;background:radial-gradient(ellipse 90% 70% at 25% 30%,#0e0818 0%,#07060a 65%);}
        .lrain{position:absolute;inset:0;opacity:.05;background:repeating-linear-gradient(91deg,transparent 0,transparent 2px,#aa99ff 2px,#aa99ff 3px);animation:rn .7s linear infinite;}
        @keyframes rn{to{background-position:0 35px;}}
        .linner{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:60px;max-width:1000px;width:100%;align-items:start;padding:20px 0;}
        .ley{font-size:9px;letter-spacing:5px;color:#8a7aaa;margin-bottom:18px;}
        .lh1{font-family:'Cormorant Garamond',serif;font-size:clamp(50px,7vw,88px);font-weight:700;line-height:.88;color:#e8e0f8;letter-spacing:-1px;text-shadow:0 0 60px rgba(160,120,255,.2);margin-bottom:22px;font-style:italic;}
        .lred{display:inline-flex;align-items:center;gap:8px;background:#2a0a2a;color:#ff99ff;font-size:9px;letter-spacing:2px;padding:7px 14px;border-left:3px solid #aa22aa;margin-bottom:18px;}
        .lfeats{display:flex;flex-direction:column;gap:6px;}
        .lf{font-size:11px;color:#9a8aba;padding-left:12px;border-left:1px solid #2a1a4a;}
        .lfcol{padding-top:20px;}
        .lform{background:rgba(14,10,24,.95);border:1px solid #1e1433;padding:32px;display:flex;flex-direction:column;gap:24px;}
        .lrow{display:flex;flex-direction:column;gap:9px;}
        .field-lbl{font-size:9px;letter-spacing:3px;color:#9a8aba;}
        .linput{background:#0d0a18;border:1px solid #1e1433;color:#d8d0e8;font-family:'IBM Plex Mono',monospace;font-size:14px;padding:12px 14px;outline:none;transition:border-color .2s;}
        .linput:focus{border-color:#8860cc;}
        .linput::placeholder{color:#5a4a7a;}
        .ltgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .ltbtn{background:transparent;border:1px solid #1e1433;color:#8a7aaa;font-family:'IBM Plex Mono',monospace;font-size:12px;padding:10px 8px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .15s;}
        .ltbtn:hover{border-color:var(--tc);color:var(--tc);}
        .ltbtn.on{border-color:var(--tc);color:var(--tc);background:color-mix(in srgb,var(--tc) 10%,transparent);}
        .tdot{width:7px;height:7px;border-radius:50%;background:var(--tc);flex-shrink:0;}
        .lenter{background:#3a0f5a;border:none;color:#d8b8ff;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:13px;letter-spacing:2px;padding:16px;cursor:pointer;transition:background .2s;}
        .lenter:hover:not(:disabled){background:#5a1a8a;}
        .lenter:disabled{opacity:.35;cursor:not-allowed;}
        .lnote{font-size:10px;color:#7a6a9a;line-height:1.6;text-align:center;}
        .game{display:flex;flex-direction:column;height:100vh;background:#09080e;}
        .flash{position:fixed;top:0;left:0;right:0;z-index:999;background:#34d399;color:#061a10;font-size:11px;letter-spacing:3px;padding:10px;text-align:center;font-weight:700;animation:fIn .3s ease,fOut .4s ease 1.8s forwards;}
        @keyframes fIn{from{transform:translateY(-100%);}to{transform:translateY(0);}}
        @keyframes fOut{to{transform:translateY(-100%);opacity:0;}}
        .hdr{display:flex;align-items:center;justify-content:space-between;background:#0d0b14;border-bottom:1px solid #1a1428;padding:12px 20px;gap:12px;flex-shrink:0;}
        .hl{display:flex;align-items:center;gap:12px;}
        .htitle{font-family:'Cormorant Garamond',serif;font-size:20px;color:#b890ec;font-style:italic;}
        .hpill{font-size:11px;letter-spacing:2px;border:1px solid;padding:4px 12px;}
        .hpill.red{border-color:#5a1a5a;color:#ff99ff;background:#2a0a2a;}
        .hpill:not(.red){border-color:var(--tc);color:var(--tc);}
        .hr{display:flex;align-items:center;gap:12px;}
        .hcount{font-size:13px;color:#a89aca;}
        .haccuse{background:#3a0f5a;border:none;color:#d8b8ff;font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:1px;padding:10px 18px;cursor:pointer;white-space:nowrap;}
        .haccuse:hover{background:#5a1a8a;}
        .tabs{display:flex;background:#0d0b14;border-bottom:1px solid #1a1428;flex-shrink:0;}
        .tab{background:none;border:none;border-bottom:2px solid transparent;color:#c8b8e8;font-family:'IBM Plex Mono',monospace;font-size:14px;letter-spacing:1px;padding:14px 20px;cursor:pointer;transition:all .15s;}
        .tab:hover{color:#c8b0fc;}
        .tab.on{color:#d8c0ff;border-bottom-color:#b890ec;font-weight:500;}
        .tbody{flex:1;overflow-y:auto;}
        .clues-grid{display:grid;grid-template-columns:230px 1fr;height:100%;}
        .clue-sb{border-right:1px solid #1a1428;background:#09080e;overflow-y:auto;padding:14px 0;}
        .sb-hd{font-size:11px;letter-spacing:3px;color:#c8b8e8;padding:0 14px 12px;font-weight:600;}
        .sb-item{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;background:none;border:none;cursor:pointer;width:100%;text-align:left;transition:background .1s;border-left:2px solid transparent;}
        .sb-item.sdone{color:#a8caa8;border-left-color:#34d399;}
        .sb-item.sact{background:#140f22;color:#b890ec;border-left-color:#9070cc;}
        .sb-item.slk{color:#1a1428;cursor:not-allowed;}
        .sb-item:not(.slk):hover{background:#140f22;}
        .sb-ic{font-size:18px;flex-shrink:0;margin-top:1px;}
        .sb-num{font-size:15px;letter-spacing:.5px;font-weight:500;}
        .sb-sub{font-size:12px;color:#c8b8e8;margin-top:3px;}
        .clue-main{padding:40px 28px 28px 28px;overflow-y:auto;}
        .pz-wrap,.sr-wrap{max-width:720px;}
        .pz-prog{display:flex;align-items:center;gap:5px;margin-bottom:22px;flex-wrap:wrap;}
        .pip{width:22px;height:3px;border-radius:2px;transition:background .3s;}
        .pip.done{background:#34d399;}
        .pip.active{background:#9070cc;animation:pp 1.5s ease infinite;}
        .pip.locked{background:#1a1428;}
        @keyframes pp{0%,100%{opacity:1;}50%{opacity:.35;}}
        .pz-step{font-size:9px;letter-spacing:3px;color:#9a8aba;margin-left:8px;}
        .loc-tag{font-size:12px;letter-spacing:2px;color:#c8b8e8;margin-bottom:14px;}
        .ev-box{border:1px solid #1a1428;border-left:3px solid #9070cc;padding:16px 20px;margin-bottom:20px;background:rgba(14,10,24,.5);}
        .ev-lbl{font-size:10px;letter-spacing:3px;color:#b8a8d8;margin-bottom:9px;}
        .ev-txt{font-size:16px;line-height:1.9;color:#f0e8ff;white-space:pre-line;}
        .pz-box{border:1px solid #2a1a3a;background:rgba(20,12,32,.5);padding:24px;border-top:3px solid var(--pc,#9070cc);}
        .pz-tag{font-size:11px;letter-spacing:3px;margin-bottom:14px;font-weight:700;}
        .pz-q{font-size:15px;line-height:1.9;color:#e8e0f8;white-space:pre-line;margin-bottom:18px;}
        .rh-box{background:rgba(180,50,50,.08);border:1px solid #5a2a2a;padding:11px 15px;margin-bottom:12px;display:flex;gap:10px;}
        .rh-lbl{font-size:10px;letter-spacing:2px;color:#dd5555;flex-shrink:0;}
        .rh-txt{font-size:14px;color:#da9898;line-height:1.6;}
        .hint-box{background:rgba(144,112,204,.08);border:1px solid #3a2a5a;padding:11px 15px;margin-bottom:12px;display:flex;gap:10px;}
        .hint-lbl{font-size:10px;letter-spacing:2px;color:#a080dc;flex-shrink:0;}
        .hint-txt{font-size:14px;color:#c8b8e8;line-height:1.6;}
        .pz-row{display:flex;gap:8px;}
        .pz-input{flex:1;background:#0d0a18;border:1px solid #1e1433;color:#e8e0f8;font-family:'IBM Plex Mono',monospace;font-size:16px;padding:14px 16px;outline:none;transition:border-color .2s;}
        .pz-input:focus{border-color:#9070cc;}
        .pz-input.wrong{border-color:#cc2244;animation:shake .3s ease;}
        .pz-input.correct{border-color:#34d399;}
        .pz-input::placeholder{color:#5a4a7a;}
        @keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-5px);}75%{transform:translateX(5px);}}
        .pz-btn{background:#1e1433;border:1px solid #3a2a5a;color:#b890ec;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:14px;letter-spacing:2px;padding:14px 22px;cursor:pointer;min-width:100px;}
        .pz-btn:hover:not(:disabled){background:#2e1a4a;}
        .pz-btn:disabled{opacity:.4;cursor:not-allowed;}
        .pz-foot{display:flex;align-items:center;gap:14px;margin-top:11px;min-height:22px;}
        .hint-tog{background:none;border:none;color:#a89aca;font-family:'IBM Plex Mono',monospace;font-size:13px;cursor:pointer;text-decoration:underline;padding:0;}
        .hint-tog:hover{color:#9070cc;}
        .msg-w{font-size:13px;color:#dd3355;letter-spacing:1px;}
        .msg-ok{font-size:13px;color:#44e3a9;letter-spacing:1px;}
        .sr-tag{display:inline-block;font-size:9px;letter-spacing:3px;color:#34d399;border:1px solid #34d399;padding:4px 12px;margin-bottom:16px;}
        .next-btn{background:#1e1433;border:1px solid #3a2a5a;color:#b890ec;font-family:'IBM Plex Mono',monospace;font-size:14px;letter-spacing:1px;padding:12px 20px;cursor:pointer;margin-top:14px;}
        .next-btn:hover{background:#2e1a4a;}
        .all-done{border:1px solid #34d399;background:rgba(52,211,153,.05);padding:18px;margin-top:20px;}
        .all-done p{font-size:15px;color:#44e3a9;margin-bottom:13px;line-height:1.7;}
        .file-big{background:#3a0f5a;border:none;color:#e8c8ff;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:15px;letter-spacing:2px;padding:15px 24px;cursor:pointer;}
        .file-big:hover{background:#5a1a8a;}
        .sus-wrap,.notes-wrap{padding:40px 24px 24px 24px;max-width:680px;}
        .panel-intro{font-size:14px;color:#b8a8d8;line-height:1.7;margin-bottom:16px;}
        .sus-row{display:flex;align-items:center;gap:14px;border:1px solid #1a1428;padding:14px;cursor:pointer;transition:all .15s;margin-bottom:8px;}
        .sus-row:not(.sus-lk):hover{border-color:#9070cc;background:#140f22;}
        .sus-lk{opacity:.4;cursor:not-allowed;}
        .sav{width:42px;height:42px;border-radius:50%;background:#1a1428;border:1px solid #2a1a4a;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:20px;color:#9070cc;flex-shrink:0;font-style:italic;}
        .sav.lg{width:50px;height:50px;font-size:24px;}
        .sav.dim{color:#2a1a4a;}
        .sn{font-family:'Cormorant Garamond',serif;font-size:19px;color:#e8e0f8;font-style:italic;}
        .sn.lg{font-size:24px;}
        .sr2{font-size:13px;color:#b8a8d8;margin-top:2px;}
        .sq{font-size:12px;color:#9a8aba;margin-top:3px;}
        .sarr{color:#7a6a9a;font-size:22px;margin-left:auto;}
        .interro{display:flex;flex-direction:column;height:calc(100vh - 120px);padding:40px 22px 22px 22px;}
        .back-lnk{background:none;border:none;color:#a89aca;font-family:'IBM Plex Mono',monospace;font-size:13px;cursor:pointer;margin-bottom:14px;text-align:left;padding:0;}
        .back-lnk:hover{color:#9070cc;}
        .int-hdr{display:flex;align-items:center;gap:14px;padding-bottom:14px;border-bottom:1px solid #1a1428;margin-bottom:14px;flex-shrink:0;}
        .chat-area{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding-right:4px;}
        .chat-mt{font-size:14px;color:#a89aca;font-style:italic;text-align:center;padding:36px 20px;}
        .bbl{max-width:80%;}
        .bbl.user{align-self:flex-end;}
        .bbl.assistant{align-self:flex-start;}
        .bwho{font-size:10px;letter-spacing:2px;color:#b8a8d8;margin-bottom:5px;}
        .bbl.user .bwho{text-align:right;color:#c8b8e8;}
        .btxt{font-size:15px;line-height:1.7;padding:13px 17px;border:1px solid;}
        .bbl.user .btxt{background:#140f22;border-color:#2a1a4a;color:#e8e0f8;}
        .bbl.assistant .btxt{background:rgba(80,20,80,.12);border-color:#3a1a5a;color:#e8d8ff;}
        .dots-a{display:flex;gap:5px;align-items:center;height:22px;}
        .dots-a span{width:5px;height:5px;background:#9070cc;border-radius:50%;animation:db 1s infinite;}
        .dots-a span:nth-child(2){animation-delay:.2s;}
        .dots-a span:nth-child(3){animation-delay:.4s;}
        @keyframes db{0%,100%{transform:translateY(0);opacity:.4;}50%{transform:translateY(-4px);opacity:1;}}
        .qbar{display:flex;gap:8px;margin-top:12px;flex-shrink:0;}
        .qin{flex:1;background:#0d0a18;border:1px solid #1e1433;color:#e8e0f8;font-family:'IBM Plex Mono',monospace;font-size:15px;padding:13px 15px;outline:none;}
        .qin:focus{border-color:#9070cc;}
        .qin::placeholder{color:#5a4a7a;}
        .qsend{background:#1e1433;border:1px solid #3a2a5a;color:#b890ec;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:14px;letter-spacing:2px;padding:13px 20px;cursor:pointer;}
        .qsend:hover:not(:disabled){background:#2e1a4a;}
        .qsend:disabled{opacity:.4;cursor:not-allowed;}
        .notes-ta{width:100%;min-height:400px;background:#0d0a18;border:1px solid #1a1428;color:#e8e0f8;font-family:'IBM Plex Mono',monospace;font-size:15px;line-height:1.8;padding:16px;outline:none;resize:vertical;}
        .notes-ta:focus{border-color:#1e1433;}
        .notes-ft{display:flex;justify-content:space-between;align-items:center;margin-top:8px;}
        .notes-ft span{font-size:12px;color:#9a8aba;}
        .copy-btn{background:none;border:1px solid #1e1433;color:#a89aca;font-family:'IBM Plex Mono',monospace;font-size:13px;padding:7px 12px;cursor:pointer;}
        .copy-btn:hover{color:#9070cc;border-color:#9070cc;}
        .accuse-scr{padding:36px 32px;max-width:680px;margin:0 auto;}
        .acc-title{font-family:'Cormorant Garamond',serif;font-size:34px;color:#b890ec;margin:18px 0 8px;font-style:italic;}
        .acc-sub{font-size:14px;color:#b8a8d8;margin-bottom:26px;line-height:1.7;}
        .acc-form{display:flex;flex-direction:column;gap:24px;}
        .acc-field{display:flex;flex-direction:column;gap:9px;}
        .acc-opts{display:flex;flex-wrap:wrap;gap:8px;}
        .acc-opt{background:transparent;border:1px solid #1e1433;color:#c8b8e8;font-family:'IBM Plex Mono',monospace;font-size:14px;padding:11px 16px;cursor:pointer;transition:all .15s;}
        .acc-opt:hover{border-color:#9070cc;color:#9070cc;}
        .acc-opt.sel{background:rgba(80,20,80,.2);border-color:#7a50aa;color:#d8b8ff;}
        .motive-ta{background:#0d0a18;border:1px solid #1a1428;color:#e8e0f8;font-family:'IBM Plex Mono',monospace;font-size:15px;line-height:1.7;padding:14px 16px;min-height:100px;outline:none;resize:vertical;width:100%;}
        .motive-ta:focus{border-color:#1e1433;}
        .file-btn{background:#3a0f5a;border:none;color:#e8c8ff;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:16px;letter-spacing:2px;padding:20px;cursor:pointer;}
        .file-btn:hover:not(:disabled){background:#5a1a8a;}
        .file-btn:disabled{opacity:.35;cursor:not-allowed;}
        .verdict{padding:40px 32px;max-width:680px;margin:0 auto;}
        .vstamp{display:inline-block;font-size:12px;letter-spacing:4px;padding:10px 20px;margin-bottom:26px;font-weight:700;}
        .vstamp.vok{border:2px solid #34d399;color:#34d399;background:rgba(52,211,153,.07);}
        .vstamp.vfail{border:2px solid #cc2244;color:#cc2244;background:rgba(204,34,68,.07);}
        .vtitle{font-family:'Cormorant Garamond',serif;font-size:36px;color:#b890ec;margin-bottom:10px;font-style:italic;}
        .vsub{font-size:15px;color:#c8b8e8;margin-bottom:24px;}
        .vsols{border:1px solid #1a1428;margin-bottom:24px;}
        .vsol{display:flex;padding:12px 16px;border-bottom:1px solid #1a1428;}
        .vsol:last-child{border-bottom:none;}
        .vk{font-size:11px;letter-spacing:2px;color:#b8a8d8;width:140px;flex-shrink:0;padding-top:1px;}
        .vv{font-size:16px;color:#e8e0f8;}
        .vepi{border-left:3px solid #9070cc;padding:16px 20px;background:rgba(14,10,24,.5);}
        .vepi-lbl{font-size:10px;letter-spacing:3px;color:#b8a8d8;margin-bottom:10px;}
        .vepi p{font-size:15px;line-height:1.8;color:#c8b8e8;font-style:italic;}
        .vback{background:#1e1433;border:1px solid #3a2a5a;color:#b890ec;font-family:'IBM Plex Mono',monospace;font-size:15px;padding:14px 24px;cursor:pointer;margin-top:18px;display:block;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:#07060a;}
        ::-webkit-scrollbar-thumb{background:#1e1433;border-radius:2px;}
        @media(max-width:680px){
          .linner{grid-template-columns:1fr;gap:28px;}
          .clues-grid{grid-template-columns:1fr;}
          .clue-sb{display:none;}
          .tabs .tab{padding:11px 10px;font-size:12px;}
          .hm{display:none;}
        }
      `}</style>
      {screen==="lobby"&&<Lobby onStart={p=>{setPlayer(p);setScreen("game");}}/>}
      {screen==="game"&&<GameScreen player={player} onAccuse={()=>setScreen("accuse")}/>}
      {screen==="accuse"&&<AccuseScreen player={player} onBack={()=>setScreen("game")}/>}
      <a href="/admin" style={{position:"fixed",bottom:10,left:10,fontSize:9,color:"#3d3528",textDecoration:"none",letterSpacing:1,opacity:0.3,transition:"opacity 0.2s"}} onMouseEnter={e=>e.target.style.opacity=0.7} onMouseLeave={e=>e.target.style.opacity=0.3}>ADMIN</a>
    </>
  );
}
