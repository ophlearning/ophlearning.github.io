// Upper-lid wart excision + cryotherapy of the base (OD). No video yet: this file holds the video id and title (the print sheets' footer
// and the site URL) and REFS, the PubMed-verified references the print sheets cite (videos/tools/print). SEGS and CHAPTERS stay empty
// until the video is made. Every number on the sheets is registered in ../check.js LEDGER with one of these references, 院內常規, 示意,
// 結構 or 病例 (the case summary the site owner confirmed on 2026-11-23).
const VIDEO = { id: 'upper-lid-wart-excision-cryo', title: '上眼瞼 wart 切除＋cryotherapy' };
const SEGS = [];
const CHAPTERS = [];
const REFS = [
 'Kersten RC, Ewing-Chow D, Kulwin DR, Gallon M. Accuracy of clinical diagnosis of cutaneous eyelid lesions. Ophthalmology 1997;104(3):479-84.',
 'Custer PL, Council ML. Clinical features and management of eyelid margin nevi. Orbit 2024;43(1):8-15.',
 'Sullivan JH, Beard C, Bullock JD. Cryosurgery for treatment of trichiasis. Am J Ophthalmol 1976;82(1):117-21.',
 'Fraunfelder FT, Petursson GJ. The use of liquid nitrogen cryospray for treatment of trichiasis. Ophthalmic Surg 1979;10(8):42-6.',
 'Wingfield DL, Fraunfelder FT. Possible complications secondary to cryotherapy. Ophthalmic Surg 1979;10(8):47-55.',
 'Luk NM, Tang WYM, Tang NLS, Chan SW, Wong JKW, Hon KLE, Lo KK. Topical 5-fluorouracil has no additional benefit in treating common warts with cryotherapy: a single-centre, double-blind, randomized, placebo-controlled trial. Clin Exp Dermatol 2006;31(3):394-7.',
 'Elder MJ. Anatomy and physiology of eyelash follicles: relevance to lash ablation procedures. Ophthalmic Plast Reconstr Surg 1997;13(1):21-5.',
];
if (typeof module !== 'undefined') module.exports = { VIDEO, SEGS, CHAPTERS, REFS };
