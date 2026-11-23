// ============================================================================
// 下眼瞼 Hotz＋去眼袋（OS）。2026-11-23：還沒有影片，只有列印單（print/）；這裡先放影片的基本資料與參考文獻（REFS），
// 列印單的頁尾與數字檢查（videos/tools/print/numcheck.js）從這裡讀。每一篇都在 PubMed 查證過（DOI 在行尾註解）；
// Kakizaki 2006 沿用 ../lower-lid-entropion-revision，Murali 2021、McCallum 2019、Lima 2009 沿用 ../lateral-canthotomy-ocs。
// ============================================================================
const VIDEO = { id: 'lower-lid-hotz-fat-removal', title: '下眼瞼 Hotz＋去眼袋' };
const SEGS = [];
const CHAPTERS = [];
const REFS = [
 'Kaufman RM, et al. Platelet transfusion: a clinical practice guideline from the AABB. Ann Intern Med 2015;162(3):205-13.',                                         // 10.7326/M14-1589
 'Hass AN, Penne RB, Stefanyszyn MA, Flanagan JC. Incidence of postblepharoplasty orbital hemorrhage and associated visual loss. Ophthalmic Plast Reconstr Surg 2004;20(6):426-32.',   // 10.1097/01.iop.0000143711.48389.c5
 'Murali S, Davis C, McCrea MJ, Plewa MC. Orbital compartment syndrome: pearls and pitfalls for the emergency physician. J Am Coll Emerg Physicians Open 2021;2(2):e12372.',            // 10.1002/emp2.12372
 'McCallum E, et al. Orbital compartment syndrome: an update with review of the literature. Clin Ophthalmol 2019;13:2189-94.',                                         // 10.2147/OPTH.S180058
 'Lima V, et al. Orbital compartment syndrome: the ophthalmic surgical emergency. Surv Ophthalmol 2009;54(4):441-9.',                                                  // 10.1016/j.survophthal.2009.04.005
 'Coban I, et al. Anatomical basis for the lower eyelid rejuvenation. Aesthetic Plast Surg 2023;47(3):1059-1066.',                                                     // 10.1007/s00266-023-03297-z
 'Syniuta LA, Goldberg RA, Thacker NM, Rosenbaum AL. Acquired strabismus following cosmetic blepharoplasty. Plast Reconstr Surg 2003;111(6):2053-9.',                   // 10.1097/01.PRS.0000056840.61348.35
 'Prischmann J, et al. Dry eye symptoms and chemosis following blepharoplasty: a 10-year retrospective review of 892 cases in a single-surgeon series. JAMA Facial Plast Surg 2013;15(1):39-46.',   // 10.1001/2013.jamafacial.1
 'Kakizaki H, et al. Microscopic anatomy of Asian lower eyelids. Ophthalmic Plast Reconstr Surg 2006;22(6):430-3.',                                                    // 10.1097/01.iop.0000242182.96161.78
];
if (typeof module !== 'undefined') module.exports = { VIDEO, SEGS, CHAPTERS, REFS };
