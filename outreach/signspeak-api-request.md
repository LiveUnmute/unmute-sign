# Email: Sign-Speak API access

**STATUS: NOT SENT** — awaiting your go-ahead

**To:** management@sign-speak.com
**Cc:** —
**Subject:** API access for a hospital communication product — clinical ASL, both directions

---

Hi Sign-Speak team,

I'm the founder of Unmute, a two-way sign-language communication tool for hospitals, ASL first. A Deaf patient signs and the clinician reads and hears it; the clinician replies and the patient sees it signed. We're pre-revenue, heading into pilot with clinical design partners.

We're building on licensed recognition rather than training our own model, and we would like to use Sign-Speak for both directions. The integration is already written behind a provider interface — `recognizeASL` and `produceASL` over REST — so we can be live quickly. There are a few things we need from you to finish it correctly.

**Access**

1. Which key type should we use for inference from a web deployment? We proxy through our own server so no key is exposed, but I want to confirm the PUBLIC vs PRIVATE semantics rather than guess.
2. Does one key cover both `recognizeASL` and `produceASL`, or is ASL Production a separate entitlement?
3. Is there a trial period we can evaluate inside, and what are its limits?

**Technical — the parts the public docs don't cover**

4. Batch retrieval: what is the exact path and parameter for fetching a batch result? We handle the `202` + `request_id` correctly but need the GET shape.
5. `payload`: bare base64 or a data URI? Which video containers and codecs do you accept — we capture webm (VP8/VP9) in Chrome and mp4 in Safari — and is there a maximum clip length?
6. Which model string should we use for clinical ASL? Is `SLR.2.sm` current, and is there a newer or domain-specific model?
7. `single_recognition_mode`: does it recognise continuous signing, or isolated signs? This decides whether our product is a conversation or a phrase reader, so it matters more than anything else on this list.
8. Do you impose a per-account or per-key rate limit we should design the interface around?
9. CORS: we call from `https://app.liveunmute.com` and `https://liveunmute.netlify.app`. Can those be allowed, or should we stay behind our proxy?

**Commercial and clinical**

10. How is `produceASL` billed? Recognition is per second of input, but text has no seconds. Is it output duration, characters, or drawn from the same minute quota?
11. Fine-tuning for clinical vocabulary — *milligrams*, *NPO*, *penicillin*, “on a scale of one to five”. What is the process, what data do you need, and what does it cost?
12. For a hospital pilot we will need a BAA, a no-training-on-our-patient-data clause, a stated retention period and a sub-processor list. Who should I speak to about those?
13. Could you share access to the sample-sentences Drive folder referenced in your docs? We want to test without a fluent signer in the room before we involve our Deaf design partner.

Happy to take 20 minutes if that is faster than typing. We are not shopping for the cheapest vendor — we need one we can put in front of a nurse and a Deaf patient and defend.

Thanks,
**Prince Nzubechukwu Michael**
Founder, Unmute
contact@liveunmute.com · app.liveunmute.com

---

## Before you send

- Name filled in: **Prince Nzubechukwu Michael**. Still unsent.
- **Send from `contact@liveunmute.com`** if you can. A real domain does more work than any sentence in the body.
- **Question 7 is the whole email.** If their answer is "isolated signs only", you need to know before you build a demo around it.
- **If they reply with a calendar link instead of answers**, that is fine — but ask them to answer 4, 5 and 7 in writing anyway. Those three are what the integration is currently guessing at.
- **Do not mention budget or the grant.** Pre-revenue is honest; pre-revenue *and* $10,000 reads as small, and their enterprise tier is priced for organisations.
- **Expect routing.** If you get pushed to sales, that is a signal about how they see API customers — worth noting for the vendor comparison in `PROVIDERS.md`.
