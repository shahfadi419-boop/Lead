// LeadHive AI - Industry Scenarios Configuration & Multi-Channel Knowledge Base
// All interactions, customer details and scores are illustrative demonstration models.

export const INDUSTRIES = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    tagline: 'High-value property leads qualified by location, budget and timeline',
    icon: 'Building2',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    description: 'Property consultant discussing residential & commercial opportunities with prospective buyers.',
    defaultLead: {
      prospect: 'Tariq Mehmood',
      channel: 'whatsapp',
      requirement: '5-marla house in DHA Islamabad',
      location: 'DHA Islamabad',
      budget: 'PKR 30 Million',
      timeline: 'Within 30 days',
      intent: 'Strong Buying Interest (Property Purchase)',
      qualificationLevel: 'High (95% Completeness)',
      score: 92,
      temperature: 'Hot',
      recommendedAction: 'Arrange a property consultation and share matching listings.',
      handoverNote: 'Prospect has pre-approved financing and requested an on-site visit for this weekend.'
    },
    channels: [
      {
        id: 'whatsapp-re-1',
        channel: 'whatsapp',
        customer: {
          name: 'Tariq Mehmood',
          handle: '+92 300 ••••482',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
          location: 'Islamabad / DHA',
          verified: true
        },
        time: '2 mins ago (Simulated)',
        initialIntent: 'Property Purchase',
        temperature: 'Hot',
        score: 92,
        recommendedAction: 'Arrange a property consultation and share matching listings in DHA Sector F.',
        messages: [
          { sender: 'customer', text: 'Salam, I am looking to buy a ready 5-marla house in DHA Islamabad. Budget is around 30 million PKR. Can we visit this Saturday?', time: '10:14 AM' },
          { sender: 'ai', text: 'Wa Alaikum Assalam Tariq. We have 3 verified 5-marla houses in DHA Islamabad Sector E and F matching your PKR 30M budget. Are you looking for immediate possession or newly constructed?', time: '10:14 AM' },
          { sender: 'customer', text: 'Immediate possession preferred. Need to finalize within 30 days.', time: '10:15 AM' },
          { sender: 'ai', text: 'Understood. I have shortlisted 2 premium turn-key houses with immediate possession in DHA Sector F. I am assigning our senior DHA property consultant to arrange your VIP site tour this Saturday at 11:30 AM.', time: '10:15 AM' }
        ],
        attributes: {
          propertyType: '5-marla House',
          location: 'DHA Islamabad (Sector F)',
          budget: 'PKR 30M',
          timeline: 'Within 30 days',
          paymentMode: 'Ready Cash / Pre-approved'
        },
        timelineSteps: [
          { id: 1, step: 'Conversation received via WhatsApp Business API', status: 'done', detail: 'Inquiry parsed with NLP intent classifier' },
          { id: 2, step: 'Customer intent identified: Property Purchase (High)', status: 'done', detail: 'Entity extraction: [5-marla], [DHA Islamabad], [30M]' },
          { id: 3, step: 'Relevant business knowledge retrieved', status: 'done', detail: 'Matched DHA Islamabad verified inventory database' },
          { id: 4, step: 'Contextual, compliant response generated', status: 'done', detail: 'Clarified possession preferences and confirmed budget' },
          { id: 5, step: 'Qualification parameters validated', status: 'done', detail: 'Budget: PKR 30M | Timeline: <30d | Readiness: 95%' },
          { id: 6, step: 'Lead score calculated: 92/100 (Hot)', status: 'done', detail: 'High commercial intent and verified purchasing power' },
          { id: 7, step: 'Opportunity prioritized for sales consultation', status: 'done', detail: 'High urgency queue rank #1' },
          { id: 8, step: 'Recommended action: Schedule weekend VIP property visit', status: 'done', detail: 'Consultant assigned with automated dossier' }
        ]
      },
      {
        id: 'fb-re-2',
        channel: 'facebook',
        customer: {
          name: 'Sarah Jenkins',
          handle: '@sarah.jenkins.invest',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          location: 'Overseas Investor (UK)',
          verified: true
        },
        time: '14 mins ago (Simulated)',
        initialIntent: 'High-yield Rental Investment',
        temperature: 'Hot',
        score: 89,
        recommendedAction: 'Dispatch overseas investor prospectus & schedule Zoom with investment partner.',
        messages: [
          { sender: 'customer', text: 'Hi, I saw your post on high-yield luxury rental apartments in Downtown. What is the guaranteed gross yield?', time: '09:58 AM' },
          { sender: 'ai', text: 'Hello Sarah! Our Downtown luxury units currently deliver 8.4% to 9.2% gross rental yields with guaranteed tenant management. Are you looking for 1-bed or 2-bed units?', time: '09:59 AM' },
          { sender: 'customer', text: 'Looking at 2 units of 1-bed with flexible installment plan.', time: '10:01 AM' }
        ],
        attributes: {
          propertyType: '2x 1-Bed Luxury Apartments',
          location: 'Downtown Boulevard',
          budget: '$280,000 Total',
          timeline: 'Q1 Investment',
          paymentMode: 'Milestone Installments'
        },
        timelineSteps: [
          { id: 1, step: 'Inbound message from Facebook Messenger ad campaign', status: 'done', detail: 'Ad source: High Yield Downtown Portfolio' },
          { id: 2, step: 'Intent recognized: Foreign Investor Portfolio Expansion', status: 'done', detail: 'Yield questions indicate high financial qualification' },
          { id: 3, step: 'Retrieved real-time yield performance sheets', status: 'done', detail: 'Downtown historical occupancy 94%' },
          { id: 4, step: 'Lead score calculated: 89/100 (Hot)', status: 'done', detail: 'Multi-unit inquiry with institutional readiness' },
          { id: 5, step: 'Recommended action: Send overseas investor prospectus & schedule Zoom', status: 'done', detail: 'Dossier generated' }
        ]
      },
      {
        id: 'ig-re-3',
        channel: 'instagram',
        customer: {
          name: 'Ali Raza',
          handle: '@aliraza_lifestyle',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
          location: 'Lahore',
          verified: false
        },
        time: '32 mins ago (Simulated)',
        initialIntent: 'Duplex Penthouse Inquiry',
        temperature: 'Warm',
        score: 78,
        recommendedAction: 'Direct message penthouse floor plan and unit specifications.',
        messages: [
          { sender: 'customer', text: 'Love the terrace pool on the reel! Can you DM the floor plan and price for the penthouse?', time: '09:40 AM' },
          { sender: 'ai', text: 'Thanks Ali! The Sky Villa Duplex features 4,200 sq ft with private heated plunge pool. Pricing starts at PKR 65M. What is your estimated move-in timeline?', time: '09:41 AM' }
        ],
        attributes: {
          propertyType: 'Sky Villa Penthouse',
          location: 'Gulberg Greens',
          budget: 'PKR 65M+',
          timeline: '3 - 6 Months',
          paymentMode: 'Down payment + quarterly'
        },
        timelineSteps: [
          { id: 1, step: 'Instagram Story reply detected', status: 'done', detail: 'Creative: Sunset Sky Villa Penthouse Tour' },
          { id: 2, step: 'Intent classified: Luxury Residential Interest', status: 'done', detail: 'Requested architectural specs and pricing' },
          { id: 3, step: 'Lead score calculated: 78/100 (Warm)', status: 'done', detail: 'High ticket inquiry, awaiting timeline confirmation' }
        ]
      },
      {
        id: 'yt-re-4',
        channel: 'youtube',
        customer: {
          name: 'Kamran Ashraf',
          handle: '@kamran_propertyvlog',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
          location: 'Rawalpindi',
          verified: false
        },
        time: '45 mins ago (Simulated)',
        initialIntent: 'Commercial Corner Plot',
        temperature: 'Warm',
        score: 75,
        recommendedAction: 'Share verified DHA Phase 2 commercial corner plot listings & pricing.',
        messages: [
          { sender: 'customer', text: '[Comment on DHA Phase 2 Walkthrough Video] Excellent breakdown. Do you have ready commercial corner plots available in Commercial Sector A? Budget is PKR 50M.', time: '09:25 AM' },
          { sender: 'ai', text: 'Thank you Kamran! Yes, we have two 4-marla commercial plots facing the main boulevard in Sector A, directly within that budget. Please check your notification or click our consultation link to review the plot numbers.', time: '09:27 AM' }
        ],
        attributes: {
          propertyType: 'Commercial Corner Plot (4 Marla)',
          location: 'DHA Phase 2 Sector A',
          budget: 'PKR 50M',
          timeline: 'Immediate acquisition',
          paymentMode: '100% Cash'
        },
        timelineSteps: [
          { id: 1, step: 'YouTube video comment parsed for commercial intent', status: 'done', detail: 'Video ID: #dha-phase2-commercial-analysis' },
          { id: 2, step: 'Commercial intent detected with explicit budget parameter', status: 'done', detail: 'Corner plot requirement extracted' },
          { id: 3, step: 'Lead score calculated: 75/100 (Warm)', status: 'done', detail: 'Commercial buyer requiring direct channel transition' }
        ]
      },
      {
        id: 'tt-re-5',
        channel: 'tiktok',
        customer: {
          name: 'Zainab Qureshi',
          handle: '@zainab_q',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
          location: 'Karachi',
          verified: false
        },
        time: '1 hour ago (Simulated)',
        initialIntent: 'Installment Plan Inquiry',
        temperature: 'Follow-up Required',
        score: 64,
        recommendedAction: 'Dispatch 36-month installment calculator & payment schedule.',
        messages: [
          { sender: 'customer', text: '[Comment on Smart Home Villa Showcase] What is the down payment and monthly installment for this villa?', time: '09:10 AM' },
          { sender: 'ai', text: 'Hi Zainab! Down payment is 20% (approx PKR 4.5M) with 36 interest-free monthly installments. We have sent the brochure to the link in our bio for instant download!', time: '09:12 AM' }
        ],
        attributes: {
          propertyType: 'Smart Villa 3-Bed',
          location: 'Suburban Gated Community',
          budget: 'PKR 22M',
          timeline: 'Planning phase (6-12 mos)',
          paymentMode: '36-month installment'
        },
        timelineSteps: [
          { id: 1, step: 'TikTok engagement workflow initiated', status: 'done', detail: 'Comment on viral smart home walkthrough' },
          { id: 2, step: 'Intent identified: Payment structure exploration', status: 'done', detail: 'Standard installment query' },
          { id: 3, step: 'Lead score calculated: 64/100 (Follow-up Required)', status: 'done', detail: 'Requires nurturing with payment calculator' }
        ]
      },
      {
        id: 'web-re-6',
        channel: 'website',
        customer: {
          name: 'Bilal Khan',
          handle: 'Web Visitor #8491 (DHA Islamabad campaign)',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
          location: 'Islamabad (Active on /listings/dha)',
          verified: true
        },
        time: 'Just now (Simulated)',
        initialIntent: 'Direct Consultation Request',
        temperature: 'Hot',
        score: 95,
        recommendedAction: 'Handover to Senior Field Officer for tomorrow 10:00 AM on-site inspection.',
        messages: [
          { sender: 'customer', text: 'Hello, I have been comparing 3 properties on your website in DHA Phase 5. Can I get a verified title deed check and book a site visit for tomorrow morning?', time: '10:18 AM' },
          { sender: 'ai', text: 'Welcome Bilal! All three listings in DHA Phase 5 have 100% verified non-encumbrance certificates and direct transfer deeds. I have reserved tomorrow 10:00 AM for your guided inspection. What is the best contact number for the officer to meet you at the DHA Gate?', time: '10:19 AM' },
          { sender: 'customer', text: 'Great! My mobile is 0321-5558912. See you tomorrow at 10 AM.', time: '10:19 AM' }
        ],
        attributes: {
          propertyType: '1 Kanal Luxury Villa',
          location: 'DHA Phase 5 Sector C',
          budget: 'PKR 65M',
          timeline: 'Tomorrow morning site visit',
          paymentMode: 'Direct Bank Pay Order'
        },
        timelineSteps: [
          { id: 1, step: 'Website Live Chat session initiated', status: 'done', detail: 'Page URL: /listings/dha-phase-5/sector-c' },
          { id: 2, step: 'Intent classified: Immediate Legal Verification & Site Visit', status: 'done', detail: 'Highest intent grade' },
          { id: 3, step: 'Verified documentation database matched', status: 'done', detail: 'Title deeds & registry checked' },
          { id: 4, step: 'Contact details captured and verified', status: 'done', detail: 'Mobile 0321-5558912 validated' },
          { id: 5, step: 'Lead score calculated: 95/100 (Hot)', status: 'done', detail: 'Immediate inspection scheduled' },
          { id: 6, step: 'Recommended action: Handover to Senior Field Officer immediately', status: 'done', detail: 'Direct inspection protocol' }
        ]
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Clinics',
    tagline: 'Patient inquiries converted into confirmed specialized appointments',
    icon: 'Stethoscope',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    description: 'Reception & patient-service professional handling consultation & diagnostic inquiries.',
    defaultLead: {
      prospect: 'Dr. Mariam Farooq',
      channel: 'whatsapp',
      requirement: 'Specialized Orthodontic Treatment & Dental Implants',
      location: 'Blue Area Clinic',
      budget: 'PKR 250,000',
      timeline: 'This week',
      intent: 'Urgent Clinical Consultation',
      qualificationLevel: 'High (92%)',
      score: 88,
      temperature: 'Hot',
      recommendedAction: 'Book priority diagnostic slot with Dr. Arshad (Consultant Orthodontist).',
      handoverNote: 'Patient has current OPG X-ray and requests late-afternoon appointment.'
    },
    channels: [
      {
        id: 'whatsapp-hc-1',
        channel: 'whatsapp',
        customer: {
          name: 'Mariam Farooq',
          handle: '+92 333 ••••910',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
          location: 'Islamabad',
          verified: true
        },
        time: '3 mins ago (Simulated)',
        initialIntent: 'Clinical Consultation',
        temperature: 'Hot',
        score: 88,
        messages: [
          { sender: 'customer', text: 'Hello, do you have slots for specialized clear aligners / orthodontic consultation this Thursday?', time: '10:05 AM' },
          { sender: 'ai', text: 'Hello Mariam! Yes, Dr. Arshad has availability this Thursday at 4:30 PM and 6:00 PM. Have you had an initial scan or dental X-ray done recently?', time: '10:06 AM' },
          { sender: 'customer', text: 'Yes, I have an OPG X-ray from last week. Thursday at 4:30 PM works perfectly.', time: '10:07 AM' }
        ],
        attributes: {
          service: 'Clear Aligners Orthodontics',
          location: 'Main Aesthetic Clinic',
          budget: 'PKR 250K',
          timeline: 'Thursday 4:30 PM',
          records: 'Recent OPG Available'
        },
        timelineSteps: [
          { id: 1, step: 'WhatsApp Business patient inquiry received', status: 'done', detail: 'HIPAA & medical confidentiality guidelines enforced' },
          { id: 2, step: 'Treatment requirement identified: Orthodontics', status: 'done', detail: 'High procedure value' },
          { id: 3, step: 'Doctor calendar availability cross-checked', status: 'done', detail: 'Thursday slot reserved tentatively' },
          { id: 4, step: 'Lead score calculated: 88/100 (Hot)', status: 'done', detail: 'Confirmed time & medical records' }
        ]
      },
      {
        id: 'web-hc-2',
        channel: 'website',
        customer: {
          name: 'Hamza Sheikh',
          handle: 'Web Visitor #3192',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          location: 'Rawalpindi',
          verified: true
        },
        time: '8 mins ago (Simulated)',
        initialIntent: 'Executive Health Screening',
        temperature: 'Hot',
        score: 91,
        messages: [
          { sender: 'customer', text: 'Looking to book comprehensive executive health checks for 5 family members before traveling abroad.', time: '09:50 AM' },
          { sender: 'ai', text: 'Hello Hamza! Our Comprehensive Executive Wellness Package covers full cardiology, lipid profiling, hepatic panel and ultrasound diagnostics. We offer fast-track same-day reporting for travel requirements.', time: '09:51 AM' }
        ],
        attributes: {
          service: 'Executive Family Wellness Package (5 Pax)',
          location: 'Central Diagnostic Wing',
          budget: 'PKR 180,000',
          timeline: 'Within 48 hours',
          records: 'Travel Requirement'
        },
        timelineSteps: [
          { id: 1, step: 'Web Chat health package inquiry', status: 'done', detail: 'Multi-person corporate/family protocol' },
          { id: 2, step: 'Calculated urgency score: 91/100', status: 'done', detail: 'Direct booking readiness' }
        ]
      }
    ]
  },
  {
    id: 'education',
    name: 'Higher Education & EdTech',
    tagline: 'Student inquiries qualified by degree program, intake and prerequisites',
    icon: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Admissions consultant discussing degree programs & scholarship requirements.',
    defaultLead: {
      prospect: 'Ayesha Siddiqui',
      channel: 'website',
      requirement: 'Executive MBA (FinTech & Business Analytics)',
      location: 'Executive Campus',
      budget: 'PKR 1.4 Million',
      timeline: 'Upcoming Fall Intake',
      intent: 'Executive Program Admission',
      qualificationLevel: 'High (94%)',
      score: 94,
      temperature: 'Hot',
      recommendedAction: 'Schedule 1-on-1 Academic Counseling session and review GMAT waiver.',
      handoverNote: 'Prospect has 6 years managerial experience in banking and high scholarship eligibility.'
    },
    channels: [
      {
        id: 'web-edu-1',
        channel: 'website',
        customer: {
          name: 'Ayesha Siddiqui',
          handle: 'Candidate #EMBA-2026',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
          location: 'Karachi',
          verified: true
        },
        time: '5 mins ago (Simulated)',
        initialIntent: 'Executive MBA Admission',
        temperature: 'Hot',
        score: 94,
        messages: [
          { sender: 'customer', text: 'Hi, I am looking for the Executive MBA program curriculum for Fall 2026. Do you have weekend hybrid classes for working professionals?', time: '10:02 AM' },
          { sender: 'ai', text: 'Hello Ayesha! Yes, our Executive MBA is designed specifically for working executives with alternate weekend on-campus immersion and flexible online modules. What is your total years of corporate experience?', time: '10:03 AM' },
          { sender: 'customer', text: '6 years as a Senior Risk Analyst in commercial banking.', time: '10:04 AM' },
          { sender: 'ai', text: 'Impressive profile! With 6 years in banking risk management, you qualify for our Merit Fellowship (up to 25% tuition grant). Would you like to schedule a 20-min Zoom session with the Program Director this Friday?', time: '10:04 AM' }
        ],
        attributes: {
          program: 'Executive MBA (Hybrid)',
          intake: 'Fall 2026',
          experience: '6 Years Corporate',
          budget: 'PKR 1.4M Tuition',
          scholarship: 'Merit Fellowship Candidate'
        },
        timelineSteps: [
          { id: 1, step: 'Inbound chat from Executive MBA curriculum landing page', status: 'done', detail: 'High intent page visit' },
          { id: 2, step: 'Academic eligibility validated: 6 yrs experience meets criteria', status: 'done', detail: 'Executive qualification met' },
          { id: 3, step: 'Lead score calculated: 94/100 (Hot)', status: 'done', detail: 'High conversion probability' },
          { id: 4, step: 'Recommended action: Schedule Program Director Zoom', status: 'done', detail: 'Calendar invite prepped' }
        ]
      }
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive Dealerships',
    tagline: 'Car inquiries turned into scheduled showroom test drives and financing deals',
    icon: 'Car',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    description: 'Sales consultant presenting premium hybrid & EV vehicles to prospective buyers.',
    defaultLead: {
      prospect: 'Omar Farooq',
      channel: 'facebook',
      requirement: 'Plug-in Hybrid SUV with Trade-in Option',
      location: 'Central Showroom',
      budget: 'PKR 14.5 Million',
      timeline: 'Next 14 Days',
      intent: 'Vehicle Purchase & Trade-in',
      qualificationLevel: 'High (90%)',
      score: 90,
      temperature: 'Hot',
      recommendedAction: 'Schedule VIP showroom test drive and dispatch mobile car evaluation team.',
      handoverNote: 'Customer currently owns a 2021 Civic looking to trade in towards new Hybrid SUV.'
    },
    channels: [
      {
        id: 'fb-auto-1',
        channel: 'facebook',
        customer: {
          name: 'Omar Farooq',
          handle: '@omar.farooq.auto',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
          location: 'Lahore Cantt',
          verified: true
        },
        time: '7 mins ago (Simulated)',
        initialIntent: 'Vehicle Purchase & Trade-in',
        temperature: 'Hot',
        score: 90,
        messages: [
          { sender: 'customer', text: 'Hi, is the 2026 Hybrid SUV available for test drive in Lahore? Also do you accept trade-in for my 2021 Civic?', time: '09:42 AM' },
          { sender: 'ai', text: 'Hello Omar! Yes, we have the 2026 Hybrid SUV ready for immediate test drive at our Cantt flagship showroom. We also offer certified on-the-spot trade-in evaluations with market-rate exchange bonuses. What time suits you best tomorrow?', time: '09:43 AM' },
          { sender: 'customer', text: 'Tomorrow around 3:30 PM works. My Civic is first owner, 42k kms driven.', time: '09:44 AM' }
        ],
        attributes: {
          targetVehicle: '2026 Hybrid SUV Luxury Variant',
          tradeIn: '2021 Civic (First Owner, 42k km)',
          budget: 'PKR 14.5M net difference',
          timeline: 'Tomorrow 3:30 PM test drive',
          financing: 'Bank financing / Cash mix'
        },
        timelineSteps: [
          { id: 1, step: 'Facebook ad lead inquiry parsed', status: 'done', detail: 'Ad campaign: Hybrid Future Test Drive' },
          { id: 2, step: 'Trade-in asset details captured and valued', status: 'done', detail: 'Civic 2021 preliminary range checked' },
          { id: 3, step: 'Lead score calculated: 90/100 (Hot)', status: 'done', detail: 'High buying intent with ready trade-in vehicle' },
          { id: 4, step: 'Recommended action: Confirm test drive slot and assign relationship manager', status: 'done', detail: 'Showroom VIP pass generated' }
        ]
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'B2B & E-commerce',
    tagline: 'Online shoppers and bulk corporate buyers converted into qualified transactions',
    icon: 'ShoppingBag',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    description: 'Commerce representative assisting corporate procurement and custom order requests.',
    defaultLead: {
      prospect: 'Shahmeer Hashmi',
      channel: 'whatsapp',
      requirement: 'Bulk Order: 60 Custom Ergonomic Mesh Chairs & Standing Desks',
      location: 'Corporate Tech Park',
      budget: 'PKR 3.2 Million',
      timeline: '2 Weeks (Office Relocation)',
      intent: 'Commercial Bulk Procurement',
      qualificationLevel: 'High (96%)',
      score: 91,
      temperature: 'Hot',
      recommendedAction: 'Issue B2B wholesale quotation with tiered corporate discount & warranty SLA.',
      handoverNote: 'Procurement manager requested formal NTN tax invoice and sample unit delivery.'
    },
    channels: [
      {
        id: 'whatsapp-ecom-1',
        channel: 'whatsapp',
        customer: {
          name: 'Shahmeer Hashmi',
          handle: '+92 321 ••••654 (Procurement Lead)',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
          location: 'Islamabad I-9',
          verified: true
        },
        time: '12 mins ago (Simulated)',
        initialIntent: 'B2B Bulk Procurement',
        temperature: 'Hot',
        score: 91,
        messages: [
          { sender: 'customer', text: 'Salam, we are outfitting our new software office in I-9 and need 60 high-back ergonomic mesh chairs and 40 dual-motor standing desks. Can you provide wholesale corporate pricing?', time: '09:30 AM' },
          { sender: 'ai', text: 'Wa Alaikum Assalam Shahmeer! Congratulations on the new office expansion. We provide institutional pricing with 3-year commercial on-site warranties for orders over 30 units. What is your expected delivery deadline?', time: '09:31 AM' },
          { sender: 'customer', text: 'We need delivery and assembly by the 25th of this month.', time: '09:32 AM' }
        ],
        attributes: {
          quantity: '60 Chairs + 40 Standing Desks',
          budget: 'PKR 3.2M',
          deliveryWindow: 'By 25th of current month',
          taxStatus: 'Active Corporate NTN',
          serviceRequired: 'On-site installation included'
        },
        timelineSteps: [
          { id: 1, step: 'WhatsApp Business bulk procurement message received', status: 'done', detail: 'High quantity corporate order detected' },
          { id: 2, step: 'Inventory check against central warehouse stock', status: 'done', detail: '60 chairs & 40 desks available immediately' },
          { id: 3, step: 'Lead score calculated: 91/100 (Hot)', status: 'done', detail: 'High value commercial transaction' },
          { id: 4, step: 'Recommended action: Issue formal NTN quote & dispatch sample chair', status: 'done', detail: 'B2B Sales team alerted' }
        ]
      }
    ]
  },
  {
    id: 'professional-services',
    name: 'Professional Services & Advisory',
    tagline: 'High-value corporate advisory, tax and legal inquiries prioritized for senior partners',
    icon: 'Briefcase',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    description: 'Senior partner discussing business advisory, tax restructuring and audit requirements.',
    defaultLead: {
      prospect: 'Faisal Vohra',
      channel: 'website',
      requirement: 'Corporate Tax Restructuring & Cross-border Compliance Audit',
      location: 'Karachi Financial District',
      budget: 'PKR 1.2M Annual Retainer',
      timeline: 'Immediate (Financial Year Close)',
      intent: 'Senior Partner Advisory',
      qualificationLevel: 'High (98%)',
      score: 95,
      temperature: 'Hot',
      recommendedAction: 'Schedule confidential partner discovery session and dispatch mutual NDA.',
      handoverNote: 'Multinational retail chain seeking fiscal restructuring prior to board meeting next month.'
    },
    channels: [
      {
        id: 'web-prof-1',
        channel: 'website',
        customer: {
          name: 'Faisal Vohra',
          handle: 'CFO / Managing Partner',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
          location: 'Karachi',
          verified: true
        },
        time: '4 mins ago (Simulated)',
        initialIntent: 'Corporate Restructuring Advisory',
        temperature: 'Hot',
        score: 95,
        messages: [
          { sender: 'customer', text: 'Good morning. We require urgent advisory on group tax restructuring and cross-border holding transfer before fiscal year close. Can a senior tax partner consult this week?', time: '10:00 AM' },
          { sender: 'ai', text: 'Good morning Mr. Vohra. Our senior tax partners specialize in cross-border holding structures and FBR corporate compliance. We can execute a mutual NDA today and arrange a private partner briefing tomorrow at 2:00 PM. Would that align with your board timeline?', time: '10:01 AM' },
          { sender: 'customer', text: 'Yes, please email the NDA to cfo@vohragroup.com and lock tomorrow 2 PM.', time: '10:02 AM' }
        ],
        attributes: {
          service: 'Group Tax Restructuring & Advisory',
          entity: 'Multinational Retail & Holding Co',
          budget: 'PKR 1.2M Retainer',
          timeline: 'Tomorrow 2:00 PM briefing',
          compliance: 'Mutual NDA required'
        },
        timelineSteps: [
          { id: 1, step: 'Website consultation inquiry from C-suite executive', status: 'done', detail: 'High value advisory service identified' },
          { id: 2, step: 'Compliance and conflict check verified', status: 'done', detail: 'No industry conflict recorded' },
          { id: 3, step: 'Lead score calculated: 95/100 (Hot)', status: 'done', detail: 'CFO verified, high urgency' },
          { id: 4, step: 'Recommended action: Issue mutual NDA & confirm Senior Partner briefing', status: 'done', detail: 'Partner calendar booked' }
        ]
      }
    ]
  }
];

export const CHANNELS_INFO = [
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    description: 'Turn customer inquiries into sales opportunities.',
    interactionType: 'Direct Messenger & ad comments',
    previewText: 'Inquiring about 2-bed apartment options with 3-year installment plans.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    gradient: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
    description: 'Understand and qualify prospects engaging with your brand.',
    interactionType: 'Direct messages & Reel comment queries',
    previewText: 'Saw your luxury villa reel! What is the down payment and floor plan?',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    description: 'Identify commercial intent within audience comments and engagement.',
    interactionType: 'Video comments & community engagement',
    previewText: 'Great property walkthrough. Do you have ready commercial plots in Sector A?',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    color: '#25D366',
    description: 'Handle customer inquiries and capture buying requirements.',
    interactionType: 'Verified business inquiries & catalogue orders',
    previewText: 'I need a 5-marla house in DHA Islamabad. Budget is PKR 30M.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    secondaryColor: '#00F2FE',
    accentColor: '#FE2C55',
    description: 'Identify supported audience engagement and potential sales intent.',
    interactionType: 'Supported comment & showcase engagement',
    previewText: 'What are the possession charges for these smart homes?',
  },
  {
    id: 'website',
    name: 'Website Chat',
    color: '#2BBFDD', // LeadHive AI Brand Identity
    description: 'Convert website visitors into qualified prospects.',
    interactionType: 'Real-time conversational concierge',
    previewText: 'I am comparing 3 listings on your site. Can I book a site visit for tomorrow?',
  }
];

