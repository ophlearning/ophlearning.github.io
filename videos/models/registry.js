// Model registry used by videos/tools: for each model, the scripts it needs in load order (paths relative to videos/models/).
// The last script of each model is its views.js, which fills MODEL_VIEWS[<model>] with the views it offers.
// A new model is usable by the tools once it adds one line here.
const MODEL_REGISTRY = {
  eyelid: ['eyelid/lid.js', 'eyelid/coronal.js', 'eyelid/lower.js', 'eyelid/lower-coronal.js', 'eyelid/canthus.js', 'eyelid/laceration.js', 'eyelid/views.js'],
  globe: ['globe/globe.js', 'globe/cataract.js', 'globe/fluidics.js', 'globe/views.js'],   // cataract.js: optional cataract states (st.cat), its own views; fluidics.js: phaco machine panel data (②)
  hands: ['hands/hands.js', 'hands/views.js'],
  // the orbit model reuses the eyelid model (globe, lateral canthus, rim) so the two share coordinates
  orbit: ['eyelid/lid.js', 'eyelid/coronal.js', 'eyelid/lower.js', 'eyelid/lower-coronal.js', 'eyelid/canthus.js', 'orbit/orbit.js', 'orbit/views.js'],
};
const MODEL_VIEWS = {};
if (typeof module !== 'undefined') module.exports = { MODEL_REGISTRY, MODEL_VIEWS };
