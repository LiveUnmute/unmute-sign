# 02 — The Pitch Narrative

**Prepared:** 20 October 2026
**Read alongside:** `01_STRATEGY_AND_EVIDENCE.md`

The narrative is the argument. The deck is its evidence. If you can say this out loud without slides, the deck will be easy to build and hard to argue with.

Three lengths below: 30 seconds, 3 minutes, 8 minutes. Same story each time, cut differently.

---

## The one-line version

> **Unmute covers the minutes before a sign language interpreter arrives.**

If a listener remembers nothing else, they should remember that sentence. It contains the customer (a hospital), the constraint (interpreters are scarce and scheduled), the moment (the interval before one appears), and the scope (a bounded window, not all of Deaf life).

---

## 30 seconds — for a chance encounter

> American hospitals are legally required to give Deaf patients a qualified sign language interpreter. There are about ten thousand of them, for roughly half a million Deaf people who use ASL. So the interpreter is often not there — and care happens anyway, in handwritten notes, in gestures, in guesses.
>
> Unmute covers that gap. We're not replacing interpreters; we're covering the minutes before one arrives. We start with the two hundred clinical phrases that carry the most risk, and we build the clinical ASL dataset that makes it possible — the one thing here nobody can scrape.
>
> We have the data pipeline and a precisely defined problem. What we don't have yet is a working model and a number. That's what we're building next.

**Why it works:** it opens with a contradiction the listener did not know existed, resolves it into a product in one sentence, and ends by naming its own gap — which is disarming, and which is the only way a pre-product founder earns trust in thirty seconds.

---

## 3 minutes — the standard pitch

### Beat 1 — The contradiction (0:00–0:40)

> In the United States, a Deaf patient walking into a hospital is legally entitled to a qualified sign language interpreter. Not a tablet with a chat window. Not a nurse who knows the alphabet. A qualified interpreter, because the law understands that a misheard symptom is a safety event.
>
> There are about half a million Deaf people in America who use American Sign Language as their primary language. There are about ten thousand certified interpreters. Fifty to one — before you account for the fact that interpreters sleep, and that they are not distributed evenly across a country.
>
> So the law is clear, the supply is thin, and the patient still arrives.

### Beat 2 — What actually happens (0:40–1:20)

> Here's the part that doesn't make it into the compliance report. Care happens anyway.
>
> A triage nurse has four minutes and a queue. She writes on a form. Someone calls the patient's cousin. The patient points at their chest, holds up three fingers, and everyone in the room agrees to believe that three means what they think it means.
>
> That interval — between the patient arriving and a qualified interpreter being in the room — is not a gap in the system. It is where a great deal of care is actually delivered. And it is the only part of this problem that nobody has built for.

### Beat 3 — Why AI hasn't fixed it (1:20–2:00)

> The obvious objection is that AI already translates sign language. It doesn't, not for this.
>
> Every general sign model you've seen is trained on the same kind of footage: broadcast, lectures, vlogs. It knows *family*, *school*, *weather*, *airport*. Ask it for *hypertension*, or *NPO after midnight*, or a fingerspelled drug name, or *ten milligrams* — and it will produce something fluent and wrong.
>
> In a hospital, fluent and wrong is worse than nothing. A notepad is slow. A confident mistranslation is a medication error.

### Beat 4 — The narrow build (2:00–2:40)

> So we go narrow on purpose. Version one handles roughly two hundred signs and phrases — the ones that carry most of the routine clinical risk. Pain: where, how bad, since when. Allergies and current medication. Consent affirmation, and a check that the patient actually understood. Dosage and timing at discharge.
>
> Bounded vocabulary. High stakes. Repeated thousands of times a day, in every hospital in the country. We measure accuracy on clinical ASL the model has never seen, and we publish the number — including the cases where it fails.

### Beat 5 — Why this becomes defensible (2:40–3:10)

> That measurement is also the moat. Clinical ASL doesn't exist as a dataset. You can't scrape it. No foundation model has it, because nobody has ever paid Deaf patients and interpreters to sit down and record *these* conversations, annotated by people who actually sign.
>
> We're building that corpus. Every pilot makes it bigger. In two years it's the thing a competitor can't buy at any price — and it's the reason a hospital switches to us rather than to whoever copies the interface.

### Beat 6 — The business and the ask (3:10–3:40)

> We sell a subscription. A ward pays around two hundred dollars a month for ten practitioners; departments and hospital systems pay more. That's less than a single video-interpreted encounter, and it covers the encounters that never got one.
>
> Where we are: the problem is defined, the data pipeline exists, and I've spent a year inside it. What doesn't exist yet is a trained model and a pilot. That's what this round buys — eighteen months, three milestones, and a number we're willing to publish.

---

## 8 minutes — the full version

Use this for a partner meeting or a competition final. It is the 3-minute version with the evidence, the technical argument, and the team section made explicit.

### 0. Open on the structural fact, not a story

Do not open with a death. Open with the arithmetic.

> Fifty to one. That's the ratio of Deaf ASL users in America to certified sign language interpreters. The law requires a qualified interpreter in every clinical encounter where communication matters. The supply makes that impossible on demand. Everything I'm about to describe follows from that single number.

*Why: a ratio is checkable in ten seconds and cannot be dismissed as sentiment. A death story invites "that's tragic, but is it representative?" and you have no answer.*

### 1. Establish the size without inflating it

> About half a million Deaf adults in the US use ASL as their primary language. Around a million deaf and hard-of-hearing adults use some form of sign language. I'm giving you the smaller, defensible number on purpose — because the whole pitch depends on me being precise about what I know.
>
> These are not marginal patients. Deaf adults are *more* likely to have been admitted to hospital in the last twelve months than hearing adults, and carry higher rates of chronic illness. High-frequency, high-need, and systematically under-served.

*Trap: do not say "70 million Deaf people worldwide lack healthcare." It is unsourced, it conflates population with access, and one informed listener will end your credibility with it.*

### 2. Name the legal floor — this is your category definition

> The ADA is explicit. Hospitals must provide effective communication. Staff with limited sign language may interpret *only briefly, in an emergency, until a qualified interpreter arrives*. That sentence is the entire product thesis. It is the law admitting that there is an interval, and that during that interval, untrained people will try.
>
> Nobody has built the tool for that interval. Everyone has built for the appointment — the scheduled consultation with the interpreter booked. The interval is where the harm is.

### 3. Describe the interval concretely

> Triage. Assessment. Consent. Discharge instructions.
>
> Peer-reviewed work published this year found interpreter access in emergency care to be "uncertain, delayed or absent at key points — including assessment and consent." A separate review records waits of up to eight hours where requests were declined. A US patient safety authority documents a triage delayed awaiting an interpreter, and a Deaf patient restrained for a scan, unable to understand what was happening, tearing their own skin trying to get free.
>
> That is the interval. It is not a scheduling inconvenience. It is where consent becomes fiction.

### 4. The technical argument — why this is hard, and why that's good

> If this were easy it would be solved, so let me be precise about why it isn't.
>
> Sign language recognition has improved a lot on benchmark data and barely at all on the thing that matters here. Three reasons.
>
> **Vocabulary.** Clinical ASL is full of terms that appear in no general dataset — anatomy, pathology, medication names, which are fingerspelled, and numbers, which are load-bearing. *Fifteen milligrams* and *fifty milligrams* differ by one handshape.
>
> **Grammar.** ASL is not English in gestures. It has its own syntax, spatial reference, and non-manual markers — eyebrow position and mouth shape carry grammatical meaning. Anything that transcribes word-for-word produces signed English, which Deaf users reject, correctly.
>
> **Consequence.** Everywhere else, a 90% accurate model is a demo. Here, the 10% is somebody's dosage. That changes what you build, what you measure, and what you're allowed to ship.

*Why this beat matters: it converts "AI sign language" — which every investor has seen a hundred times — into a specific, defensible engineering problem. It also pre-empts "why hasn't Google done this?"*

### 5. The product, scoped honestly

> Version one is sign-to-text and sign-to-speech. Not the other direction. Ask me why in a moment.
>
> It covers three flows: **triage intake**, **consent and understanding check**, and **discharge instruction**. In each, the vocabulary is finite, the stakes are high, and the same exchange happens a thousand times a day.
>
> On the clinician's side, we don't synthesise a signing avatar. We use recorded human signing for a fixed clinical phrase set — better, cheaper, and trusted in a way an avatar is not. A generative avatar that produces signed English is a liability, not a feature.

*Be ready for: "why not the other direction?" Answer: text-to-sign needs a generative avatar with correct non-manual grammar; that is a different, harder research problem, and shipping a bad one would damage the trust the recognition side depends on. Sequence it.*

### 6. The moat — say it as a build plan, not a boast

> Every competitor in this space is built on public data. So are we, at the start — How2Sign and similar corpora. But public data has no clinical vocabulary and no Deaf patients in a clinical context, because nobody has collected it.
>
> The moat is a corpus that cannot be scraped: consented recordings of Deaf ASL users and qualified interpreters, producing clinical vocabulary in clinical context, annotated to a protocol written with an ASL linguist, with regional variation recorded rather than averaged away.
>
> That corpus does three things. It makes the model measurably better than anything trained on public data. It produces a published accuracy benchmark that becomes the thing procurement asks for. And it takes time — which is the only moat a pre-seed company can actually build.
>
> Around it: the workflow embeds in triage, so switching costs rise; and the institution has already done security review and signed a BAA, which is its own kind of lock-in.

*Be honest: this is a thesis, not an achievement. Say "we are building this," not "we have this."*

### 7. The business

> Subscription, per team. A ward — up to ten practitioners — around two hundred dollars a month. A department, up to fifty, around six hundred. Above that, enterprise, with the security review and the BAA and the procurement cycle.
>
> The comparison the buyer makes is not against our competitors. It's against a video-interpreted encounter, which costs more for twenty minutes than we charge for a month. But I want to be precise: we don't replace those encounters. We cover the ones that never had one. The value is compliance evidence, avoided delay, and a documented communication attempt where previously there was none.

*Say the honest version of the price. If you have not tested it, say "this is what we're testing."*

### 8. Where you actually are

> I'm going to be blunt about status, because the rest of this only works if you believe me.
>
> What exists: the problem definition, the ASL data pipeline, a year of work inside this problem, and a founder who has been in this specific gap long enough to know where it hurts.
>
> What does not exist: a trained model, a published accuracy number, a pilot, a signed design partner, and revenue.
>
> The round buys those four things.

### 9. The team — including what's missing

> It's me today. That's the honest answer, and it's the biggest risk in this pitch.
>
> I'm hearing, and I'm building a product for a community I'm not part of. I don't think that's disqualifying, but I do think it's disqualifying if it stays that way. So the plan is structural, not rhetorical: a Deaf co-founder with real decision authority, a clinical advisor who has worked an emergency department, an ASL linguistics advisor for the annotation protocol, and a paid Deaf design panel that reviews every build and can say no.
>
> I'd rather be judged on whether I can recruit those people than on whether I can talk about them.

*This is the strongest possible answer to the weakest part of the pitch. Do not soften it, do not hide it, and absolutely do not imply any of these people are already involved.*

### 10. The ask

> Eighteen months, three milestones. A published accuracy number on held-out clinical ASL. Three design partners running it in a live department. One paying contract and a corpus of a size we can defend.
>
> If we hit those, the next round is a growth conversation. If we don't hit the first one, you'll know before I do, because we'll have published the number.

---

## The five questions you will be asked, and the honest answers

**1. "Why you? You're not Deaf and you're not a clinician."**
> Correct, and it's the main risk. My answer isn't a claim about empathy, it's a hiring plan — a Deaf co-founder with authority, a clinical advisor, and a paid design panel. Judge me on whether I close those, not on whether I say I will.

**2. "Google or a foundation model will do this."**
> They'll do general sign translation, and they already are. They won't build a consented clinical ASL corpus, because it's expensive, unglamorous, and requires hospital relationships. That's precisely the part they're structurally bad at, and it's the part the product depends on.

**3. "Hospitals already have video remote interpreting."**
> They do, and it's better than nothing. It's also scheduled, requires equipment, and fails when the connection does. We're not competing with VRI for the scheduled appointment. We're covering triage at 2am when nobody has booked anything.

**4. "What's your accuracy?"**
> Unknown, and I'm not going to invent one. The first milestone is a number on held-out clinical data. Publishing it — including the failure cases — is the point.

**5. "How do you sell to US hospitals from Nigeria?"**
> Slowly at first, and through three design partners rather than a sales team. The engineering cost base is a genuine advantage — the same money buys several times the research time — and the product is remote-deployable by design. But I'd be lying if I said geography wasn't the second-hardest thing about this after the data.

---

## Three things to never say

1. **"We replace interpreters."** It is untrue, legally reckless in the US, and it converts your best allies into opponents.
2. **"70 million Deaf people lack healthcare."** Unsourced, and it conflates two different numbers.
3. **"Supports NSL, ASL and more."** Under this pivot, ASL is the claim. NSL is not a current capability and listing it invites a question you cannot survive.

---

## The tone

The pitch should sound like someone who has been close to a specific problem for a long time and has stopped needing to oversell it. Confidence in this space reads as precision — exact numbers, named sources, stated limits — not as scale adjectives.

Every time you are tempted to say *revolutionary*, *seamless*, or *world-class*, replace the word with a number.
