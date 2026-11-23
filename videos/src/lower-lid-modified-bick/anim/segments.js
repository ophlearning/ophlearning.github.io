// ============================================================================
// 下眼瞼 modified Bick — segments of the video (none yet: 2026-11-23 the printed OR sheets came first, the video follows).
// REFS: every reference the sheets (print/) cite, PubMed-verified (DOI or PMID in the comment). The numbers and their sources are in
// ../check.js (LEDGER). Bick 1966 has no abstract on PubMed: it is cited as the original description only, no number or step from it.
// No department template for this procedure: steps follow the literature; what differs between papers is marked 依院內常規.
// ============================================================================
const VIDEO = { id: 'lower-lid-modified-bick', title: '下眼瞼 modified Bick' };
const SEGS = [];
const CHAPTERS = [];
const REFS = [
 'Bick MW. Surgical management of orbital tarsal disparity. Arch Ophthalmol 1966;75(3):386-9.',                                                      // doi:10.1001/archopht.1966.00970050388015 (no abstract)
 'Hurwitz JJ, Mishkin SK, Rodgers KJ. Modification of Bick\'s procedure for treatment of eyelid laxity. Can J Ophthalmol 1987;22(5):262-5.',           // PMID 3311321 (no DOI)
 'Vahdani K, Ford R, Garrott H, Thaller VT. Lateral tarsal strip versus Bick\'s procedure in correction of eyelid malposition. Eye (Lond) 2018;32(6):1117-1122.',   // doi:10.1038/s41433-018-0048-9
 'Poon JS, Vahdani K, Thaller VT. Comparison of four combined procedures for correction of involutional lower eyelid entropion. J Craniofac Surg 2019;30(4):1239-1244.',   // doi:10.1097/SCS.0000000000005466
 'Barrett RV, Meyer DR. The modified Bick quick strip procedure for surgical treatment of eyelid malposition. Ophthalmic Plast Reconstr Surg 2012;28(4):294-9.',   // doi:10.1097/IOP.0b013e31824e1240
 'Prendes MA, et al. Assessment of the safety and efficacy of prolapsed orbital fat resection during involutional entropion repair. Ophthalmic Plast Reconstr Surg 2020;36(1):34-37.',   // doi:10.1097/IOP.0000000000001452
 'Tao BK, et al. Ectropion repair techniques and the role of adjunctive superotemporal skin transposition for tarsal ectropion. J Clin Med 2025;14(3):827.',   // doi:10.3390/jcm14030827 (full text, PMC11818440)
 'Rubino C, et al. 3-Step combined technique for correction of involutional lower eyelid ectropion: a case series. J Clin Med 2024;14(1):128.',   // doi:10.3390/jcm14010128 (full text, PMC11721973)
 'Auguste LA, Nghiem AZ, Vahdani K. Horizontal eyelid shortening alone versus combined procedures for the correction of involutional lower eyelid entropion. Int Ophthalmol 2023;43(12):4979-4983.',   // doi:10.1007/s10792-023-02900-1
 'Pushker N, Mounica B, Agrawal S. Transconjunctival correction of involutional entropion: a video demonstration. Indian J Ophthalmol 2025;73(2):309.',   // doi:10.4103/IJO.IJO_630_24 (as in lower-lid-entropion-revision)
 'Beigi B, et al. Fornix fat prolapse as a sign for involutional entropion. Ophthalmology 2008;115(9):1608-12.',   // doi:10.1016/j.ophtha.2008.02.014 (as in lower-lid-entropion-revision)
 'Gioia VM, Linberg JV, McCormick SA. The anatomy of the lateral canthal tendon. Arch Ophthalmol 1987;105(4):529-32.',   // doi:10.1001/archopht.1987.01060040099042 (as in lower-lid-entropion-revision)
];
if (typeof module !== 'undefined') module.exports = { VIDEO, SEGS, CHAPTERS, REFS };
