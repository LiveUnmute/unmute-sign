#!/usr/bin/env python3
"""
Source text for the two proposals.

The hospital document is the founder's text, preserved word for word. Do not
"tighten" it: sections 1 to 10 below are transcribed from the supplied draft and
every bullet, qualifier and disclaimer is deliberate.

The ASLIN document shares sections 1, 2, 3 and 10 with it, because those
describe the problem and the product rather than the audience. Sections 4 to 9
are written for ASLIN: an interpreter body has different questions about a tool
like this than a hospital does, and answering the hospital's questions for them
would waste their time.
"""

# Block vocabulary
#   ("h", num, title)        numbered section head
#   ("p", text)              paragraph
#   ("b", text)              bullet
#   ("n", number, text)      numbered item
#   ("s", title)             sub-heading (A, B, C …)
#   ("lead", text)           short standfirst paragraph

# ══════════════════════════════════════════════════════════════════════════
# HOSPITAL EDITION — the founder's text, verbatim
# ══════════════════════════════════════════════════════════════════════════

HOSPITAL_TITLE = ["PROPOSAL FOR HOSPITAL", "PARTNERSHIP AND", "PILOT EVALUATION"]

HOSPITAL_META = [
    ("Submitted by", "Unmute"),
    ("Programme", "Unmute Healthcare Communication Initiative"),
    ("Proposed partners", "Hospitals and Healthcare Institutions"),
    ("Purpose", "Institutional Collaboration, Product Evaluation, and Potential Pilot Partnership"),
]

HOSPITAL = [
    ("h", 1, "Executive Summary"),
    ("p", "Unmute is an AI-powered communication technology initiative focused on reducing "
          "communication barriers between Deaf individuals and hearing people."),
    ("p", "Our initial product focuses on healthcare, where communication barriers between "
          "Deaf patients and healthcare professionals can make routine interactions "
          "difficult, time-consuming, and stressful."),
    ("p", "Deaf patients may struggle to communicate symptoms, describe discomfort, "
          "understand medical instructions, or respond to questions during consultations. "
          "Healthcare professionals may also lack the sign-language skills or immediate "
          "access to qualified interpreters needed to facilitate these interactions."),
    ("p", "Unmute is developing a technology-assisted communication platform designed to "
          "support two-way communication between Deaf patients and hearing healthcare "
          "professionals through sign-language recognition and speech-to-sign technology."),
    ("p", "We are seeking partnerships with healthcare institutions to validate the problem, "
          "evaluate the proposed solution, gather clinical feedback, and establish a pathway "
          "towards controlled pilot deployments."),
    ("p", "We invite interested hospitals to express their interest through a Letter of "
          "Intent (LOI), indicating their willingness to explore collaboration with Unmute."),

    ("h", 2, "The Problem"),
    ("p", "Communication accessibility remains a significant challenge for Deaf patients "
          "accessing healthcare services."),
    ("p", "During routine hospital interactions, communication may depend on:"),
    ("b", "Written notes or text messages."),
    ("b", "Lip-reading, which may not always be reliable."),
    ("b", "Gestures and improvised communication."),
    ("b", "Relatives or accompanying persons acting as informal interpreters."),
    ("b", "The availability of professional sign-language interpreters."),
    ("p", "These alternatives may introduce delays, misunderstandings, privacy concerns, and "
          "additional pressure on both patients and healthcare professionals."),
    ("p", "The challenge is not simply the absence of communication. It is the difficulty of "
          "achieving clear, timely, and independent communication during healthcare "
          "interactions."),

    ("h", 3, "Our Proposed Solution"),
    ("p", "Unmute is developing an AI-assisted healthcare communication platform designed to "
          "facilitate communication between Deaf patients and hearing healthcare "
          "professionals."),
    ("p", "The initial MVP will focus on American Sign Language (ASL), with a controlled set "
          "of healthcare-related expressions."),
    ("p", "The intended capabilities include:"),
    ("s", "A. Healthcare professional to Deaf patient"),
    ("b", "Spoken English input through a device microphone."),
    ("b", "Conversion of speech into text."),
    ("b", "Mapping of supported English expressions to corresponding ASL representations."),
    ("b", "Display of the corresponding sign-language video or avatar."),
    ("s", "B. Deaf patient to healthcare professional"),
    ("b", "Camera-based capture of supported signing."),
    ("b", "Recognition of supported sign-language expressions."),
    ("b", "Conversion of recognised expressions into English text."),
    ("b", "Optional text-to-speech output."),
    ("s", "C. Communication support"),
    ("b", "Repetition and clarification options."),
    ("b", "Manual phrase selection where automatic recognition is unavailable."),
    ("b", "Clear indication when an expression is unsupported or cannot be confidently "
          "recognised."),
    ("p", "The initial product will be limited to supported expressions and will be evaluated "
          "with Deaf users and healthcare professionals before any broader deployment."),
    ("p", "Unmute is intended to support routine communication. It is not being presented as a "
          "replacement for qualified interpreters during emergencies, informed consent, "
          "complex clinical discussions, or other high-stakes interactions."),

    ("h", 4, "Objectives of the Proposed Partnership"),
    ("p", "We seek to collaborate with healthcare institutions to:"),
    ("n", 1, "Validate the communication challenges experienced by Deaf patients and "
             "healthcare professionals."),
    ("n", 2, "Obtain feedback from relevant clinical personnel on the proposed solution."),
    ("n", 3, "Evaluate the usability and practical relevance of the Unmute MVP."),
    ("n", 4, "Identify suitable routine healthcare interactions for initial testing."),
    ("n", 5, "Understand institutional requirements for accessibility technology adoption."),
    ("n", 6, "Establish a pathway towards a controlled pilot programme."),
    ("n", 7, "Explore the potential for continued institutional adoption following successful "
             "evaluation."),

    ("h", 5, "Proposed Areas of Collaboration"),
    ("p", "We invite interested hospitals to consider the following forms of participation."),
    ("s", "A. Institutional interest and engagement"),
    ("b", "Nominate a representative to serve as the hospital's point of contact."),
    ("b", "Participate in discussions about the communication challenges experienced by Deaf "
          "patients."),
    ("b", "Provide feedback on the proposed product and its relevance to the hospital's "
          "operations."),
    ("s", "B. Clinical and user feedback"),
    ("b", "Identify relevant doctors, nurses, or healthcare professionals who can review the "
          "proposed workflows."),
    ("b", "Provide feedback on the healthcare phrases and interactions prioritised for the "
          "MVP."),
    ("b", "Where appropriate, support supervised usability testing with consenting "
          "participants."),
    ("s", "C. MVP evaluation"),
    ("p", "Subject to product readiness and institutional approval, the hospital may "
          "participate in a controlled evaluation of the Unmute MVP."),
    ("p", "This may involve:"),
    ("b", "Demonstrations to relevant healthcare personnel."),
    ("b", "Testing selected routine communication scenarios."),
    ("b", "Feedback on usability, accuracy, response time, and practical limitations."),
    ("b", "Documentation of issues and recommendations for improvement."),
    ("s", "D. Potential pilot partnership"),
    ("p", "Following a successful initial evaluation, both parties may explore a more "
          "structured pilot programme."),
    ("p", "The scope, duration, participating department, number of users, evaluation "
          "criteria, and operational arrangements would be agreed upon separately."),

    ("h", 6, "What We Are Requesting from Participating Hospitals"),
    ("p", "At this stage, we are not requesting a financial commitment or an immediate "
          "purchase."),
    ("p", "We are seeking an initial expression of institutional interest through a "
          "non-binding Letter of Intent."),
    ("p", "The proposed LOI would indicate the hospital's willingness to:"),
    ("b", "Explore a potential partnership with Unmute."),
    ("b", "Participate in discussions and product demonstrations."),
    ("b", "Nominate an appropriate institutional contact."),
    ("b", "Consider providing clinical and operational feedback."),
    ("b", "Explore participation in a controlled MVP evaluation, subject to approval and "
          "product readiness."),
    ("b", "Discuss the possibility of a future pilot if the evaluation is satisfactory."),
    ("p", "Any actual testing involving patients, clinical workflows, or personal information "
          "would require appropriate institutional authorisation, consent, privacy "
          "safeguards, and clinical oversight."),
    ("p", "An LOI would not constitute a commitment to purchase, deploy, or recommend the "
          "product."),

    ("h", 7, "Responsibilities of Unmute"),
    ("p", "Unmute intends to:"),
    ("b", "Develop and maintain the MVP."),
    ("b", "Provide product demonstrations and relevant documentation."),
    ("b", "Clearly communicate supported capabilities and known limitations."),
    ("b", "Coordinate product testing and collect appropriate feedback."),
    ("b", "Address identified technical issues within the agreed scope."),
    ("b", "Protect information collected during any approved evaluation."),
    ("b", "Provide an evaluation summary where agreed."),
    ("b", "Work with the hospital to define suitable next steps."),

    ("h", 8, "Expected Outcomes"),
    ("p", "The proposed collaboration is expected to help:"),
    ("b", "Improve understanding of communication barriers affecting Deaf patients."),
    ("b", "Identify practical use cases for assistive communication technology."),
    ("b", "Evaluate the relevance and usability of Unmute in healthcare settings."),
    ("b", "Generate feedback to guide product development."),
    ("b", "Establish institutional relationships for potential future pilot programmes."),
    ("b", "Contribute to more accessible healthcare communication."),

    ("h", 9, "Proposed Next Steps"),
    ("p", "We propose the following engagement process:"),
    ("n", 1, "ASLIN facilitates an introduction between Unmute and interested healthcare "
             "institutions."),
    ("n", 2, "Interested hospitals review this proposal and the accompanying LOI."),
    ("n", 3, "The hospital indicates its interest through an authorised representative."),
    ("n", 4, "Unmute schedules an introductory meeting and product demonstration."),
    ("n", 5, "Both parties discuss the appropriate evaluation scope and institutional "
             "requirements."),
    ("n", 6, "If mutually agreed, a pilot evaluation plan is developed."),

    ("h", 10, "Conclusion"),
    ("p", "Accessible communication is an important part of equitable healthcare delivery."),
    ("p", "Unmute believes technology can help reduce some of the barriers Deaf patients "
          "encounter when communicating with healthcare professionals. However, building a "
          "useful solution requires collaboration with the institutions and people who "
          "experience these challenges directly."),
    ("p", "We welcome the opportunity to work with healthcare institutions to evaluate this "
          "approach, improve the product through practical feedback, and explore a "
          "sustainable model for accessible healthcare communication."),
]

# ══════════════════════════════════════════════════════════════════════════
# ASLIN EDITION
# ══════════════════════════════════════════════════════════════════════════

ASLIN_TITLE = ["PROPOSAL FOR ASLIN", "LANGUAGE PARTNERSHIP", "AND CLINICAL EVALUATION"]

ASLIN_META = [
    ("Submitted by", "Unmute"),
    ("Programme", "Unmute Healthcare Communication Initiative"),
    ("Proposed partner", "Association of Sign Language Interpreters of Nigeria (ASLIN)"),
    ("Purpose", "Language Partnership, Interpreter Review, and Clinical Evaluation"),
]

ASLIN = [
    ("h", 1, "Executive Summary"),
    ("p", "Unmute is an AI-powered communication technology initiative focused on reducing "
          "communication barriers between Deaf individuals and hearing people."),
    ("p", "Our initial product focuses on healthcare, where communication barriers between "
          "Deaf patients and healthcare professionals can make routine interactions "
          "difficult, time-consuming, and stressful."),
    ("p", "Deaf patients may struggle to communicate symptoms, describe discomfort, "
          "understand medical instructions, or respond to questions during consultations. "
          "Healthcare professionals may also lack the sign-language skills or immediate "
          "access to qualified interpreters needed to facilitate these interactions."),
    ("p", "Unmute is developing a technology-assisted communication platform designed to "
          "support two-way communication between Deaf patients and hearing healthcare "
          "professionals through sign-language recognition and speech-to-sign technology."),
    ("p", "A language is not a dataset to be collected. It belongs to the people who use it, "
          "and in Nigeria it is carried by interpreters and by Deaf communities whose signs "
          "differ from the American Sign Language that most recognition systems are trained "
          "on. A tool built without them will be confident and wrong."),
    ("p", "Unmute is therefore approaching ASLIN before approaching hospitals. We would like "
          "to review our initial clinical phrase list with interpreters who work in Nigerian "
          "hospitals, and to understand where ASL would mislead a Nigerian Deaf patient "
          "rather than help them."),

    ("h", 2, "The Problem"),
    ("p", "Communication accessibility remains a significant challenge for Deaf patients "
          "accessing healthcare services."),
    ("p", "During routine hospital interactions, communication may depend on:"),
    ("b", "Written notes or text messages."),
    ("b", "Lip-reading, which may not always be reliable."),
    ("b", "Gestures and improvised communication."),
    ("b", "Relatives or accompanying persons acting as informal interpreters."),
    ("b", "The availability of professional sign-language interpreters."),
    ("p", "These alternatives may introduce delays, misunderstandings, privacy concerns, and "
          "additional pressure on both patients and healthcare professionals."),
    ("p", "The challenge is not simply the absence of communication. It is the difficulty of "
          "achieving clear, timely, and independent communication during healthcare "
          "interactions."),
    ("p", "Interpreters see this daily, and see what it costs when the gap is filled by "
          "whoever happens to be nearby. That experience is not available in any dataset, and "
          "it is the reason this proposal is addressed to ASLIN first."),

    ("h", 3, "Our Proposed Solution"),
    ("p", "Unmute is developing an AI-assisted healthcare communication platform designed to "
          "facilitate communication between Deaf patients and hearing healthcare "
          "professionals."),
    ("p", "The initial MVP will focus on American Sign Language (ASL), with a controlled set "
          "of healthcare-related expressions."),
    ("p", "The intended capabilities include:"),
    ("s", "A. Healthcare professional to Deaf patient"),
    ("b", "Spoken English input through a device microphone."),
    ("b", "Conversion of speech into text."),
    ("b", "Mapping of supported English expressions to corresponding ASL representations."),
    ("b", "Display of the corresponding sign-language video or avatar."),
    ("s", "B. Deaf patient to healthcare professional"),
    ("b", "Camera-based capture of supported signing."),
    ("b", "Recognition of supported sign-language expressions."),
    ("b", "Conversion of recognised expressions into English text."),
    ("b", "Optional text-to-speech output."),
    ("s", "C. Communication support"),
    ("b", "Repetition and clarification options."),
    ("b", "Manual phrase selection where automatic recognition is unavailable."),
    ("b", "Clear indication when an expression is unsupported or cannot be confidently "
          "recognised."),
    ("p", "The initial product will be limited to supported expressions and will be evaluated "
          "with Deaf users and healthcare professionals before any broader deployment."),
    ("p", "Unmute is intended to support routine communication. It is not being presented as a "
          "replacement for qualified interpreters during emergencies, informed consent, "
          "complex clinical discussions, or other high-stakes interactions."),

    ("h", 4, "Objectives of the Proposed Partnership"),
    ("p", "We seek to work with ASLIN to:"),
    ("n", 1, "Review the initial clinical phrase list against the signs actually used in "
             "Nigerian healthcare settings."),
    ("n", 2, "Identify where American Sign Language and Nigerian Sign Language diverge, and "
             "where an ASL rendering would mislead rather than inform."),
    ("n", 3, "Obtain interpreter review of the proposed two-way workflow."),
    ("n", 4, "Agree how the product should behave when a sign is unsupported, ambiguous, or "
             "outside its vocabulary."),
    ("n", 5, "Understand the professional and ethical expectations ASLIN would place on a tool "
             "of this kind."),
    ("n", 6, "Agree a basis for crediting contributors and for describing ASLIN's involvement."),
    ("n", 7, "Where ASLIN considers it appropriate, facilitate introductions to healthcare "
             "institutions for a controlled evaluation."),

    ("h", 5, "Proposed Areas of Collaboration"),
    ("p", "We invite ASLIN to consider the following forms of involvement. Each is separable: "
          "ASLIN may take part in any one without the others."),
    ("s", "A. Language and vocabulary review"),
    ("b", "Review the healthcare expressions proposed for the MVP."),
    ("b", "Advise on signs used in Nigerian clinical practice, including regional and local "
          "variation."),
    ("b", "Identify expressions that should not be attempted without a qualified interpreter "
          "present."),
    ("s", "B. Interpreter review"),
    ("b", "Nominate one or more interpreters to review the proposed workflow."),
    ("b", "Advise on how the product should signal uncertainty and unsupported signs."),
    ("b", "Comment on where routine communication ends and high-stakes communication begins."),
    ("s", "C. Introductions"),
    ("b", "Where ASLIN considers it appropriate, introduce Unmute to healthcare institutions."),
    ("b", "Take part in introductory discussions if ASLIN wishes to."),
    ("s", "D. Position and endorsement"),
    ("p", "ASLIN is under no obligation to endorse the product. No endorsement is requested or "
          "implied at this stage, and none will be described as existing until it is given in "
          "writing."),

    ("h", 6, "What We Are Requesting from ASLIN"),
    ("p", "We are not requesting a financial contribution, an endorsement, or an exclusive "
          "arrangement."),
    ("p", "We are seeking an initial conversation, and if ASLIN is willing, the following:"),
    ("b", "A working session on the clinical phrase list, for which Unmute would meet "
          "reasonable interpreter time and costs."),
    ("b", "Written comment on the proposed workflow from one or more nominated interpreters."),
    ("b", "Agreement on how contributors are credited."),
    ("b", "Agreement, in advance and in writing, on how ASLIN's involvement is described "
          "publicly."),
    ("p", "No partnership, endorsement, or agreement exists between Unmute and ASLIN until one "
          "is signed. This document is an invitation to talk, not a claim of association."),

    ("h", 7, "Responsibilities of Unmute"),
    ("p", "Unmute intends to:"),
    ("b", "Develop and maintain the MVP."),
    ("b", "Fund working sessions, including reasonable interpreter time and costs."),
    ("b", "Clearly communicate supported capabilities and known limitations."),
    ("b", "Credit contributors as agreed."),
    ("b", "Not describe ASLIN as a partner, endorser, or adviser without written agreement."),
    ("b", "Provide a written summary of what was reviewed and what changed as a result."),
    ("b", "Publish the limitations of the product rather than only its capabilities."),
    ("b", "Work with ASLIN to define suitable next steps."),

    ("h", 8, "Expected Outcomes"),
    ("p", "The proposed collaboration is expected to help:"),
    ("b", "Produce a phrase list that reflects Nigerian practice rather than an imported one."),
    ("b", "Identify early where ASL fails Nigerian Deaf patients, before a hospital discovers "
          "it."),
    ("b", "Give interpreters a stated role in how the tool behaves, rather than only in what "
          "it gets wrong."),
    ("b", "Establish a defensible basis for a controlled clinical evaluation."),
    ("b", "Ensure the product's limits are described publicly and consistently."),
    ("b", "Contribute to more accessible healthcare communication."),

    ("h", 9, "Proposed Next Steps"),
    ("p", "We propose the following engagement process:"),
    ("n", 1, "ASLIN reviews this proposal and the proposed phrase list."),
    ("n", 2, "An introductory meeting is held at ASLIN's convenience."),
    ("n", 3, "A working session on the phrase list is scheduled and funded by Unmute."),
    ("n", 4, "Unmute provides a written summary of what was reviewed and what changed."),
    ("n", 5, "ASLIN decides whether it wishes to facilitate introductions to healthcare "
             "institutions."),
    ("n", 6, "Any further relationship is agreed in writing before it is described publicly."),

    ("h", 10, "Conclusion"),
    ("p", "Accessible communication is an important part of equitable healthcare delivery."),
    ("p", "Unmute believes technology can help reduce some of the barriers Deaf patients "
          "encounter when communicating with healthcare professionals. However, building a "
          "useful solution requires collaboration with the institutions and people who "
          "experience these challenges directly."),
    ("p", "We welcome the opportunity to work with ASLIN to evaluate this approach, improve "
          "the product through practical feedback, and explore a sustainable model for "
          "accessible healthcare communication."),
]

# Shared signature block
CONTACT = {
    "Submitted by": "Unmute",
    "Contact": "contact@liveunmute.com",
    "Phone": "+234 904 282 0707",
    "Website": "liveunmute.com",
    "Product": "app.liveunmute.com",
}

HOSPITAL_RUNNING = "Unmute · Proposal for Hospital Partnership and Pilot Evaluation"
ASLIN_RUNNING = "Unmute · Proposal for ASLIN Language Partnership and Clinical Evaluation"
